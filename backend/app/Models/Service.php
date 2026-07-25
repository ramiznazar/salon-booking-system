<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['vendor_id', 'staff_id', 'service_category_id', 'name', 'name_it', 'description', 'description_it', 'image_url', 'price', 'duration_minutes', 'is_active', 'availability', 'is_boosted', 'boosted_until', 'boost_price', 'boost_tier_id', 'boost_budget', 'boost_budget_spent', 'boost_clicks'];
    protected $casts = ['is_active' => 'boolean', 'is_boosted' => 'boolean', 'boosted_until' => 'datetime', 'availability' => 'array', 'boost_budget' => 'float', 'boost_budget_spent' => 'float'];
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
    public function staff(): BelongsTo { return $this->belongsTo(Staff::class); }
    public function serviceCategory(): BelongsTo { return $this->belongsTo(ServiceCategory::class); }
}
