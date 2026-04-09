<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Order;
use App\Models\Vendor;

class AdminService
{
    public function updateVendorStatus(Vendor $vendor, string $status, int $actorId): Vendor
    {
        $vendor->update(['status' => $status, 'is_verified' => $status === 'approved']);
        AuditLog::create(['actor_id' => $actorId, 'action' => 'vendor_status_update', 'entity_type' => 'vendor', 'entity_id' => $vendor->id, 'meta' => ['status' => $status]]);
        return $vendor->refresh();
    }

    public function snapshot(): array
    {
        return ['orders' => Order::count(), 'bookings' => Booking::count(), 'vendors' => Vendor::count()];
    }
}
