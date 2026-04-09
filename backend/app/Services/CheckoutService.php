<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
    public function __construct(protected CommissionService $commissionService) {}

    public function checkout(int $userId, array $items): array
    {
        return DB::transaction(function () use ($userId, $items) {
            $grouped = collect($items)->groupBy('vendor_id');
            $orders = [];
            foreach ($grouped as $vendorId => $vendorItems) {
                $subtotal = 0.0;
                $order = Order::create(['user_id' => $userId, 'vendor_id' => $vendorId, 'status' => 'paid', 'subtotal' => 0, 'commission_amount' => 0, 'total' => 0]);
                foreach ($vendorItems as $item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                    if ($product->stock < $item['quantity']) {
                        throw new ApiException('Insufficient stock for '.$product->name, 409);
                    }
                    $product->decrement('stock', $item['quantity']);
                    $line = $product->price * $item['quantity'];
                    $subtotal += $line;
                    OrderItem::create(['order_id' => $order->id, 'product_id' => $product->id, 'quantity' => $item['quantity'], 'price' => $product->price]);
                }
                $commissionAmount = $this->commissionService->calculateAmount($subtotal);
                $order->update(['subtotal' => $subtotal, 'commission_amount' => $commissionAmount, 'total' => $subtotal]);
                $this->commissionService->persistForOrder($order, $commissionAmount);
                $orders[] = $order->load('items');
            }
            return $orders;
        });
    }
}
