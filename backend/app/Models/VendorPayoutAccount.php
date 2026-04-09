<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class VendorPayoutAccount extends Model
{
    protected $fillable = ['vendor_id', 'provider', 'account_name', 'account_number_masked', 'meta', 'is_active'];
    protected $casts = ['meta' => 'array', 'is_active' => 'boolean'];
    public function vendor(): BelongsTo { return $this->belongsTo(Vendor::class); }
}
