<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = ['vendor_id', 'user_id', 'booking_id', 'rating', 'comment', 'is_flagged'];
    protected $casts = ['is_flagged' => 'boolean'];
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
