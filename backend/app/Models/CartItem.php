<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'vendor_id', 'product_id', 'quantity'];
    public function cart(): BelongsTo { return $this->belongsTo(Cart::class); }
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
}
