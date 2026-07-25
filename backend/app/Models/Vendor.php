<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    protected $fillable = [
        'user_id', 'name', 'name_it', 'slug', 'email', 'phone', 'logo_url', 'description', 'description_it',
        'address', 'address_it', 'city', 'city_it', 'state', 'country', 'postal_code', 'categories',
        'status', 'is_verified', 'rating', 'reviews_count',
        'service_rating', 'service_reviews_count', 'product_rating', 'product_reviews_count',
        'working_hours', 'slot_duration_minutes', 'active_plan_id', 'map_embed',
    ];

    protected $casts = [
        'categories' => 'array',
        'working_hours' => 'array',
        'is_verified' => 'boolean',
        'rating' => 'float',
        'service_rating' => 'float',
        'product_rating' => 'float',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function services(): HasMany { return $this->hasMany(Service::class); }
    public function products(): HasMany { return $this->hasMany(Product::class); }
    public function staff(): HasMany { return $this->hasMany(Staff::class); }
    public function bookings(): HasMany { return $this->hasMany(Booking::class); }
    public function orders(): HasMany { return $this->hasMany(Order::class); }
    public function reviews(): HasMany { return $this->hasMany(Review::class); }
    public function vendorPlans(): HasMany { return $this->hasMany(VendorPlan::class); }
    public function activePlan(): \Illuminate\Database\Eloquent\Relations\BelongsTo { return $this->belongsTo(VendorPlan::class, 'active_plan_id'); }

    public function hasActivePlan(): bool
    {
        return $this->activePlan && $this->activePlan->isActive();
    }
}
