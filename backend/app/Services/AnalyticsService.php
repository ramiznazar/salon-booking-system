<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Order;
use App\Models\Vendor;

class AnalyticsService
{
    public function report(): array
    {
        return [
            'gmv' => (float) Order::sum('total'),
            'orders' => Order::count(),
            'bookings' => Booking::count(),
            'approved_vendors' => Vendor::where('status', 'approved')->count(),
        ];
    }
}
