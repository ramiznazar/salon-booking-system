<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\NotificationLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\Service;
use App\Models\Vendor;
use Illuminate\Support\Carbon;

class VendorPanelService
{
    public function __construct(
        protected PlanService $planService,
        protected NotificationService $notificationService,
    ) {}

    public function getStats(Vendor $vendor): array
    {
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();

        $todayEarnings = Order::where('vendor_id', $vendor->id)
            ->whereDate('created_at', $today)
            ->whereIn('status', ['paid', 'delivered'])
            ->sum('total');

        $weekEarnings = Order::where('vendor_id', $vendor->id)
            ->where('created_at', '>=', $weekStart)
            ->whereIn('status', ['paid', 'delivered'])
            ->sum('total');

        $bookingsToday = Booking::where('vendor_id', $vendor->id)
            ->whereDate('scheduled_at', $today)
            ->whereIn('status', ['pending', 'accepted'])
            ->count();

        $pendingBookings = Booking::where('vendor_id', $vendor->id)
            ->where('status', 'pending')
            ->count();

        $usage = $this->planService->usageCounts($vendor);

        return [
            'today_earnings'  => (float) $todayEarnings,
            'week_earnings'   => (float) $weekEarnings,
            'bookings_today'  => $bookingsToday,
            'pending_bookings' => $pendingBookings,
            'services_count'  => $usage['services'],
            'products_count'  => $usage['products'],
        ];
    }

    public function createService(Vendor $vendor, array $data): Service
    {
        $this->checkPlanLimit($vendor, 'service');
        $data['vendor_id'] = $vendor->id;
        return Service::create($data);
    }

    public function updateService(Vendor $vendor, Service $service, array $data): Service
    {
        abort_if($service->vendor_id !== $vendor->id, 403, 'Forbidden');
        $service->update($data);
        return $service->refresh();
    }

    public function deleteService(Vendor $vendor, Service $service): void
    {
        abort_if($service->vendor_id !== $vendor->id, 403, 'Forbidden');
        $service->delete();
    }

    public function createProduct(Vendor $vendor, array $data): Product
    {
        $this->checkPlanLimit($vendor, 'product');
        $data['vendor_id'] = $vendor->id;
        return Product::create($data);
    }

    public function updateProduct(Vendor $vendor, Product $product, array $data): Product
    {
        abort_if($product->vendor_id !== $vendor->id, 403, 'Forbidden');
        $product->update($data);
        return $product->refresh();
    }

    public function deleteProduct(Vendor $vendor, Product $product): void
    {
        abort_if($product->vendor_id !== $vendor->id, 403, 'Forbidden');
        $product->delete();
    }

    public function updateBookingStatus(Vendor $vendor, Booking $booking, string $status): Booking
    {
        abort_if($booking->vendor_id !== $vendor->id, 403, 'Forbidden');
        $allowed = ['accepted', 'rejected', 'completed', 'cancelled'];
        abort_unless(in_array($status, $allowed), 422, 'Invalid status');
        $booking->update(['status' => $status]);
        $booking->refresh()->load(['user', 'service']);

        $statusLabels = [
            'accepted'  => 'Booking accepted',
            'rejected'  => 'Booking rejected',
            'completed' => 'Booking completed',
            'cancelled' => 'Booking cancelled',
        ];

        if ($booking->user_id) {
            $this->notificationService->notifyUser($booking->user_id, 'booking_status_updated', $statusLabels[$status] ?? 'Booking updated', [
                'booking_id' => $booking->id,
                'status'     => $status,
                'service'    => $booking->service?->name ?? 'Service',
                'vendor'     => $vendor->name,
            ]);
        }

        return $booking;
    }

    public function getUnreadNotifications(Vendor $vendor)
    {
        return NotificationLog::where('user_id', $vendor->user_id)
            ->whereNull('read_at')
            ->latest()
            ->limit(20)
            ->get();
    }

    public function markNotificationsRead(Vendor $vendor): void
    {
        NotificationLog::where('user_id', $vendor->user_id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function getUnreadCount(Vendor $vendor): int
    {
        return NotificationLog::where('user_id', $vendor->user_id)
            ->whereNull('read_at')
            ->count();
    }

    public function getNewOrdersCount(Vendor $vendor): int
    {
        return NotificationLog::where('user_id', $vendor->user_id)
            ->where('event', 'new_order')
            ->whereNull('read_at')
            ->count();
    }

    public function markOrdersSeen(Vendor $vendor): void
    {
        NotificationLog::where('user_id', $vendor->user_id)
            ->where('event', 'new_order')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function getAllNotifications(Vendor $vendor)
    {
        return NotificationLog::where('user_id', $vendor->user_id)
            ->latest()
            ->paginate(30);
    }

    private function checkPlanLimit(Vendor $vendor, string $type): void
    {
        $activePlan = $this->planService->getActivePlan($vendor);
        if (!$activePlan) {
            abort(403, 'No active plan. Please purchase a plan to add ' . $type . 's.');
        }

        $plan = $activePlan->plan;
        $usage = $this->planService->usageCounts($vendor);

        if ($type === 'service' && $plan->max_services !== null && $usage['services'] >= $plan->max_services) {
            abort(422, "Service limit reached ({$plan->max_services}). Upgrade your plan.");
        }
        if ($type === 'product' && $plan->max_products !== null && $usage['products'] >= $plan->max_products) {
            abort(422, "Product limit reached ({$plan->max_products}). Upgrade your plan.");
        }
    }
}
