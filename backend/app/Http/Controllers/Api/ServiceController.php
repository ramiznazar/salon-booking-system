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
    public function index() { try { return ApiResponse::success(Service::with('vendor')->paginate(20)); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function store(StoreServiceRequest $request) { try { return ApiResponse::created($this->catalogService->create($request->validated())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function show(Service $service) { try { return ApiResponse::success($service->load('vendor')); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function update(UpdateServiceRequest $request, Service $service) { try { return ApiResponse::success($this->catalogService->update($service, $request->validated()), 'Updated'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
}
