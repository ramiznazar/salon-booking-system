<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class VendorPlan extends Model
{
    protected $fillable = ['vendor_id', 'plan_id', 'purchased_at', 'expires_at', 'status', 'amount_paid'];
    protected $casts = ['purchased_at' => 'datetime', 'expires_at' => 'datetime', 'amount_paid' => 'decimal:2'];

    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
    public function plan(): BelongsTo { return $this->belongsTo(Plan::class); }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->expires_at->isFuture();
    }
}
