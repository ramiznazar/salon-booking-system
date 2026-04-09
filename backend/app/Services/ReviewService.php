<?php

namespace App\Services;

use App\Exceptions\ApiException;
use App\Models\Booking;
use App\Models\Review;

class ReviewService
{
    public function create(array $data): Review
    {
        if (! empty($data['booking_id'])) {
            $booking = Booking::find($data['booking_id']);
            if (! $booking || $booking->status !== 'completed') {
                throw new ApiException('Review requires completed booking', 409);
            }
        }
        return Review::create($data);
    }
}
