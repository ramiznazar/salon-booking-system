<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $fillable = ['order_id', 'vendor_id', 'mode', 'value', 'amount', 'is_global'];
    protected $casts = ['is_global' => 'boolean'];
    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
}
