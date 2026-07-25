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

    public function listPublic(array $filters = [], int $perPage = 12)
    {
        $query = Vendor::where('status', 'approved');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%');
                $q->orWhere('name_it', 'like', '%' . $filters['search'] . '%');
                $q->orWhere('city', 'like', '%' . $filters['search'] . '%');
                $q->orWhere('city_it', 'like', '%' . $filters['search'] . '%');
                $q->orWhere('address', 'like', '%' . $filters['search'] . '%');
                $q->orWhere('address_it', 'like', '%' . $filters['search'] . '%');
                $q->orWhere('description', 'like', '%' . $filters['search'] . '%');
                $q->orWhere('description_it', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['city'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('city', 'like', '%' . $filters['city'] . '%');
                $q->orWhere('city_it', 'like', '%' . $filters['city'] . '%');
            });
        }

        if (!empty($filters['sort']) && $filters['sort'] === 'rating') {
            $query->orderByDesc('rating');
        } else {
            $query->latest();
        }

        return $query->paginate($perPage);
    }
}
