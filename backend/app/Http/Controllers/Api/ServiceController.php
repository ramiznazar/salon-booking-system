<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Service\StoreServiceRequest;
use App\Http\Requests\Service\UpdateServiceRequest;
use App\Models\Service;
use App\Services\ServiceCatalogService;
use Throwable;

class ServiceController extends Controller
{
    public function __construct(protected ServiceCatalogService $catalogService) {}
    public function index(\Illuminate\Http\Request $request) {
        try {
            $query = Service::with(['vendor', 'serviceCategory'])->where('is_active', true)
                ->whereHas('vendor', fn($q) => $q->where('status', 'approved'));
            if ($request->filled('vendor_id')) {
                $query->where('vendor_id', $request->vendor_id);
            }
            $query->orderByRaw('(is_boosted = 1 AND boosted_until > NOW()) DESC')
                  ->orderByDesc('created_at');
            return ApiResponse::success($query->paginate(50));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }
    public function store(StoreServiceRequest $request) { try { return ApiResponse::created($this->catalogService->create($request->validated())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function show(Service $service) { try { return ApiResponse::success($service->load(['vendor', 'serviceCategory'])); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function update(UpdateServiceRequest $request, Service $service) { try { return ApiResponse::success($this->catalogService->update($service, $request->validated()), 'Updated'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
}
