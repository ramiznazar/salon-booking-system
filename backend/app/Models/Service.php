<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['vendor_id', 'staff_id', 'name', 'description', 'price', 'duration_minutes', 'is_active', 'availability'];
    protected $casts = ['is_active' => 'boolean', 'availability' => 'array'];
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
    public function staff(): BelongsTo { return $this->belongsTo(Staff::class); }
}
