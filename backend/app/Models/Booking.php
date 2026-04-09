<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = ['vendor_id', 'service_id', 'user_id', 'scheduled_at', 'status', 'notes'];
    protected $casts = ['scheduled_at' => 'datetime'];
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
    public function service(): BelongsTo { return $this->belongsTo(Service::class); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
