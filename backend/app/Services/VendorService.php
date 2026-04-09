<?php

namespace App\Services;

use App\Models\Vendor;
use Illuminate\Support\Str;

class VendorService
{
    public function create(array $data): Vendor
    {
        $data['slug'] = Str::slug($data['name']).'-'.Str::lower(Str::random(5));
        return Vendor::create($data);
    }

    public function listPublic(int $perPage = 12)
    {
        return Vendor::where('status', 'approved')->paginate($perPage);
    }
}
