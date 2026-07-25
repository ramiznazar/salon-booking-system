<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = ['name', 'name_it', 'description', 'description_it', 'price', 'duration_days', 'features', 'features_it', 'max_services', 'max_products', 'is_active', 'boost_price', 'boost_duration_days'];
    protected $casts = ['features' => 'array', 'features_it' => 'array', 'is_active' => 'boolean', 'price' => 'decimal:2', 'boost_price' => 'decimal:2'];

    public function vendorPlans(): HasMany { return $this->hasMany(VendorPlan::class); }
}
