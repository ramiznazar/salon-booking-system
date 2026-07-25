<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['vendor_id', 'product_category_id', 'name', 'name_it', 'description', 'description_it', 'image_url', 'price', 'stock', 'rating', 'reviews_count', 'is_active', 'is_boosted', 'boosted_until', 'boost_price', 'boost_tier_id', 'boost_budget', 'boost_budget_spent', 'boost_clicks'];
    protected $casts = ['is_active' => 'boolean', 'is_boosted' => 'boolean', 'boosted_until' => 'datetime', 'boost_budget' => 'float', 'boost_budget_spent' => 'float', 'rating' => 'float'];
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
    public function productCategory(): BelongsTo { return $this->belongsTo(ProductCategory::class); }
    public function images(): HasMany { return $this->hasMany(ProductImage::class); }
    public function reviews(): HasMany { return $this->hasMany(Review::class); }
}
