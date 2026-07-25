<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Vendor;

class BookingService
{
    public function __construct(protected NotificationService $notificationService) {}

    public function create(array $data): Booking
    {
        $conflict = Booking::where('vendor_id', $data['vendor_id'])
            ->where('scheduled_at', $data['scheduled_at'])
            ->whereNotIn('status', ['rejected', 'cancelled'])
            ->exists();

        if ($conflict) {
            throw new \Exception('This time slot is already booked. Please choose another time.');
        }

        $booking = Booking::create($data);
        $booking->load(['user', 'service', 'vendor']);

        $vendor = Vendor::find($data['vendor_id']);
        $customerName = $booking->user?->name ?? 'Customer';
        $serviceName  = $booking->service?->name ?? 'Service';
        $time         = $booking->scheduled_at?->toDateTimeString();

        if ($vendor) {
            $this->notificationService->notifyVendor($vendor, 'new_booking', 'New booking received', [
                'booking_id' => $booking->id,
                'customer'   => $customerName,
                'service'    => $serviceName,
                'time'       => $time,
            ]);
        }

        $this->notificationService->notifyAdmin('new_booking', 'New booking placed', [
            'booking_id' => $booking->id,
            'customer'   => $customerName,
            'service'    => $serviceName,
            'time'       => $time,
        ]);

        $this->notificationService->notifyUser($data['user_id'], 'booking_confirmed', 'Booking confirmed', [
            'booking_id' => $booking->id,
            'service'    => $serviceName,
            'vendor'     => $booking->vendor?->name ?? 'Vendor',
            'time'       => $time,
        ]);

        return $booking;
    }

    public function updateStatus(Booking $booking, string $status): Booking
    {
        $booking->update(['status' => $status]);
        return $booking->refresh();
    }
}
