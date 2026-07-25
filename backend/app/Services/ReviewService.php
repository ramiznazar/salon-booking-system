<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Booking;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\Vendor;

class ReviewService
{
    public function create(array $data): Review
    {
        $userId = (int) ($data['user_id'] ?? 0);
        $bookingId = isset($data['booking_id']) ? (int) $data['booking_id'] : null;
        $orderItemId = isset($data['order_item_id']) ? (int) $data['order_item_id'] : null;

        if (! $bookingId && ! $orderItemId) {
            throw new ApiException('Either booking_id or order_item_id is required', 422);
        }
        if ($bookingId && $orderItemId) {
            throw new ApiException('Review must target either a booking or an order item, not both', 422);
        }

        if ($bookingId) {
            $booking = Booking::find($bookingId);
            if (! $booking || $booking->status !== 'completed') {
                throw new ApiException('Review requires completed booking', 409);
            }
            if ((int) $booking->user_id !== $userId) {
                throw new ApiException('You can only review your own booking', 403);
            }

            if ((int) ($data['vendor_id'] ?? 0) !== (int) $booking->vendor_id) {
                throw new ApiException('Vendor does not match this booking', 422);
            }

            $exists = Review::where('user_id', $userId)
                ->where('booking_id', $booking->id)
                ->exists();
            if ($exists) {
                throw new ApiException('You already reviewed this booking', 409);
            }

            $data['review_type'] = 'service';
            $data['order_id'] = null;
            $data['order_item_id'] = null;
            $data['product_id'] = null;
        }

        if ($orderItemId) {
            $orderItem = OrderItem::with('order')->find($orderItemId);
            if (! $orderItem) {
                throw new ApiException('Order item not found', 404);
            }

            $order = $orderItem->order;
            if (! $order) {
                throw new ApiException('Order not found', 404);
            }
            if ((int) $order->user_id !== $userId) {
                throw new ApiException('You can only review your own purchases', 403);
            }
            if (! in_array($order->status, ['delivered', 'completed'], true)) {
                throw new ApiException('Product review requires delivered order', 409);
            }

            if ((int) ($data['vendor_id'] ?? 0) !== (int) $order->vendor_id) {
                throw new ApiException('Vendor does not match this order', 422);
            }

            if (! empty($data['order_id']) && (int) $data['order_id'] !== (int) $order->id) {
                throw new ApiException('order_id does not match order item', 422);
            }
            if (! empty($data['product_id']) && (int) $data['product_id'] !== (int) $orderItem->product_id) {
                throw new ApiException('product_id does not match order item', 422);
            }

            $exists = Review::where('user_id', $userId)
                ->where('order_item_id', $orderItem->id)
                ->exists();
            if ($exists) {
                throw new ApiException('You already reviewed this purchased product', 409);
            }

            $data['review_type'] = 'product';
            $data['booking_id'] = null;
            $data['order_id'] = $order->id;
            $data['order_item_id'] = $orderItem->id;
            $data['product_id'] = $orderItem->product_id;
        }

        $review = Review::create($data);
        $this->recalculateVendorMetrics((int) $review->vendor_id);
        if ($review->review_type === 'product' && $review->product_id) {
            $this->recalculateProductMetrics((int) $review->product_id);
        }

        return $review;
    }

    public function recalculateFromReview(Review $review): void
    {
        $this->recalculateVendorMetrics((int) $review->vendor_id);
        if ($review->product_id) {
            $this->recalculateProductMetrics((int) $review->product_id);
        }
    }

    protected function recalculateVendorMetrics(int $vendorId): void
    {
        $vendor = Vendor::find($vendorId);
        if (! $vendor) {
            return;
        }

        $serviceQuery = Review::where('vendor_id', $vendorId)->where('review_type', 'service');
        $productQuery = Review::where('vendor_id', $vendorId)->where('review_type', 'product');

        $serviceCount = (int) $serviceQuery->count();
        $productCount = (int) $productQuery->count();
        $serviceAvg = $serviceCount > 0 ? round((float) $serviceQuery->avg('rating'), 2) : 0;
        $productAvg = $productCount > 0 ? round((float) $productQuery->avg('rating'), 2) : 0;

        // Primary vendor rating remains service-based to avoid blind mixing.
        $vendor->update([
            'rating' => $serviceAvg,
            'reviews_count' => $serviceCount,
            'service_rating' => $serviceAvg,
            'service_reviews_count' => $serviceCount,
            'product_rating' => $productAvg,
            'product_reviews_count' => $productCount,
        ]);
    }

    protected function recalculateProductMetrics(int $productId): void
    {
        $product = Product::find($productId);
        if (! $product) {
            return;
        }

        $query = Review::where('product_id', $productId)->where('review_type', 'product');
        $count = (int) $query->count();
        $avg = $count > 0 ? round((float) $query->avg('rating'), 2) : 0;

        $product->update([
            'rating' => $avg,
            'reviews_count' => $count,
        ]);
    }
}
