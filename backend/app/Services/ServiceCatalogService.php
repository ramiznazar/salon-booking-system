<?php

namespace App\Services;

use App\Models\Service;

class ServiceCatalogService
{
    public function create(array $data): Service
    {
        return Service::create($data);
    }

    public function update(Service $service, array $data): Service
    {
        $service->update($data);
        return $service->refresh();
    }
}
