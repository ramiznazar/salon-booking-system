<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    protected $fillable = ['vendor_id', 'name', 'email', 'phone', 'skills', 'is_active'];
    protected $casts = ['skills' => 'array', 'is_active' => 'boolean'];
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
}
