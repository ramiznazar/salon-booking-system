<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Models\Vendor;
use App\Services\VendorService;
use Throwable;

class VendorController extends Controller
{
    public function __construct(protected VendorService $vendorService) {}

    public function index()
    {
        try {
            return ApiResponse::success($this->vendorService->listPublic());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function store(StoreVendorRequest $request)
    {
        try {
            return ApiResponse::created($this->vendorService->create($request->validated()));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function show(Vendor $vendor)
    {
        try {
            return ApiResponse::success($vendor->load(['services', 'products']));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
