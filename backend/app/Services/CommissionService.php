<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\Order;

class CommissionService
{
    public function calculateAmount(float $subtotal, ?Commission $config = null): float
    {
        $mode = $config?->mode ?? 'percent';
        $value = (float) ($config?->value ?? 10);
        return $mode === 'fixed' ? $value : round(($subtotal * $value) / 100, 2);
    }

    public function persistForOrder(Order $order, float $amount): Commission
    {
        return Commission::create([
            'order_id' => $order->id,
            'vendor_id' => $order->vendor_id,
            'mode' => 'percent',
            'value' => 10,
            'amount' => $amount,
            'is_global' => false,
        ]);
    }
}
