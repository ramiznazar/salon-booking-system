<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['vendor_id', 'name', 'description', 'price', 'stock', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
    public function images(): HasMany { return $this->hasMany(ProductImage::class); }
}
