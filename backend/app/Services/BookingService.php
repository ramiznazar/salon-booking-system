<?php

namespace App\Services;

use App\Models\Booking;

class BookingService
{
    public function create(array $data): Booking
    {
        return Booking::create($data);
    }

    public function updateStatus(Booking $booking, string $status): Booking
    {
        $booking->update(['status' => $status]);
        return $booking->refresh();
    }
}
