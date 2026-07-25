<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    public function __construct(
        protected CommissionService $commissionService,
        protected CartService $cartService,
        protected NotificationService $notificationService,
    ) {}

    public function checkout(int $userId, array $items, array $address = []): array
    {
        $outOfStockProducts = [];

        $orders = DB::transaction(function () use ($userId, $items, $address, &$outOfStockProducts) {
            $grouped = collect($items)->groupBy('vendor_id');
            $orders = [];
            foreach ($grouped as $vendorId => $vendorItems) {
                $subtotal = 0.0;
                $order = Order::create(array_merge([
                    'user_id' => $userId,
                    'vendor_id' => $vendorId,
                    'status' => 'pending',
                    'subtotal' => 0,
                    'commission_amount' => 0,
                    'total' => 0,
                ], $address));
                foreach ($vendorItems as $item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                    if ($product->stock < $item['quantity']) {
                        throw new ApiException('Insufficient stock for '.$product->name, 409);
                    }
                    $product->decrement('stock', $item['quantity']);
                    if ($product->fresh()->stock === 0) {
                        $outOfStockProducts[] = ['product' => $product, 'vendorId' => $vendorId];
                    }
                    $line = $product->price * $item['quantity'];
                    $subtotal += $line;
                    OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => $item['quantity'], 'price' => $product->price]);
                }
                $commissionAmount = $this->commissionService->calculateAmount($subtotal);
                $order->update(['subtotal' => $subtotal, 'commission_amount' => $commissionAmount, 'total' => $subtotal]);
                $this->commissionService->persistForOrder($order, $commissionAmount);
                $orders[] = $order->load('items.product');
            }
            return $orders;
        });

        $this->cartService->clearCart($userId);

        $customer = User::find($userId);
        $customerName = $customer?->name ?? 'A customer';

        foreach ($orders as $order) {
            $vendor = Vendor::find($order->vendor_id);
            if ($vendor) {
                $this->notificationService->notifyVendor($vendor, 'new_order', 'New order received', [
                    'order_id'  => $order->id,
                    'customer'  => $customerName,
                    'total'     => $order->total,
                ]);
            }

            $this->notificationService->notifyAdmin('new_order', 'New order placed', [
                'order_id'  => $order->id,
                'customer'  => $customerName,
                'vendor_id' => $order->vendor_id,
                'total'     => $order->total,
            ]);
        }

        foreach ($outOfStockProducts as $entry) {
            $vendor = Vendor::find($entry['vendorId']);
            if ($vendor) {
                $this->notificationService->notifyVendor($vendor, 'product_out_of_stock', 'Product out of stock', [
                    'product_id'   => $entry['product']->id,
                    'product_name' => $entry['product']->name,
                ]);
            }
        }

        return $orders;
    }
}
