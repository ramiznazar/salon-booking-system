<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoostTier extends Model
{
    protected $fillable = ['name', 'description', 'duration_days', 'price', 'cost_per_click', 'is_active'];

    protected $casts = ['is_active' => 'boolean', 'price' => 'float', 'cost_per_click' => 'float'];
}
