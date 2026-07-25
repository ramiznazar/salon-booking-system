<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Vendor;
use Illuminate\Support\Carbon;

class SlotService
{
    public function available(Vendor $vendor, string $date): array
    {
        $hours = $vendor->working_hours ?? [];
        $dayKey = strtolower(Carbon::parse($date)->format('D'));

        if (empty($hours[$dayKey]) || empty($hours[$dayKey]['open']) || empty($hours[$dayKey]['close'])) {
            return [];
        }

        $open  = Carbon::parse($date . ' ' . $hours[$dayKey]['open']);
        $close = Carbon::parse($date . ' ' . $hours[$dayKey]['close']);
        $step  = $vendor->slot_duration_minutes ?: 30;

        $all = [];
        $cursor = $open->copy();
        while ($cursor->copy()->addMinutes($step)->lte($close)) {
            $all[] = $cursor->format('H:i');
            $cursor->addMinutes($step);
        }

        $booked = Booking::where('vendor_id', $vendor->id)
            ->whereDate('scheduled_at', $date)
            ->whereNotIn('status', ['rejected', 'cancelled'])
            ->pluck('scheduled_at')
            ->map(fn($dt) => Carbon::parse($dt)->format('H:i'))
            ->toArray();

        return array_values(array_filter($all, fn($slot) => !in_array($slot, $booked)));
    }
}
