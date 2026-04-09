<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    protected $fillable = [
        'user_id', 'name', 'slug', 'email', 'phone', 'logo_url', 'description',
        'address', 'city', 'state', 'country', 'postal_code', 'categories',
        'status', 'is_verified', 'rating', 'reviews_count',
    ];

    protected $casts = [
        'categories' => 'array',
        'is_verified' => 'boolean',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function services(): HasMany { return $this->hasMany(Service::class); }
    public function products(): HasMany { return $this->hasMany(Product::class); }
    public function staff(): HasMany { return $this->hasMany(Staff::class); }
    public function bookings(): HasMany { return $this->hasMany(Booking::class); }
    public function orders(): HasMany { return $this->hasMany(Order::class); }
    public function reviews(): HasMany { return $this->hasMany(Review::class); }
}
