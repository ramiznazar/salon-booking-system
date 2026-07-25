<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Services\PlanService;
use Illuminate\Http\Request;
use Throwable;

class PlanController extends Controller
{
    public function __construct(protected PlanService $planService) {}

    public function index()
    {
        try {
            return ApiResponse::success($this->planService->listActive());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function purchase(Plan $plan)
    {
        try {
            $user = auth()->user();
            $vendor = $user->vendor;
            if (!$vendor) {
                return ApiResponse::error('No vendor profile found. Please register as a vendor first.', 404);
            }
            $vendorPlan = $this->planService->purchase($plan, $vendor);
            return ApiResponse::created($vendorPlan, 'Plan purchased successfully');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    // Admin methods
    public function adminIndex()
    {
        try {
            return ApiResponse::success($this->planService->listAll());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name'         => 'required|string|max:100',
                'name_it'      => 'nullable|string|max:100',
                'description'  => 'nullable|string',
                'description_it' => 'nullable|string',
                'price'        => 'required|numeric|min:0',
                'duration_days' => 'required|integer|min:1',
                'features'     => 'nullable',
                'features_it'  => 'nullable',
                'max_services' => 'nullable|integer|min:1',
                'max_products' => 'nullable|integer|min:1',
                'is_active'    => 'boolean',
            ]);
            $plan = $this->planService->create($data);
            return ApiResponse::created($plan, 'Plan created');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function update(Request $request, Plan $plan)
    {
        try {
            $data = $request->validate([
                'name'         => 'sometimes|string|max:100',
                'name_it'      => 'nullable|string|max:100',
                'description'  => 'nullable|string',
                'description_it' => 'nullable|string',
                'price'        => 'sometimes|numeric|min:0',
                'duration_days' => 'sometimes|integer|min:1',
                'features'     => 'nullable',
                'features_it'  => 'nullable',
                'max_services' => 'nullable|integer|min:1',
                'max_products' => 'nullable|integer|min:1',
                'is_active'    => 'boolean',
            ]);
            $plan = $this->planService->update($plan, $data);
            return ApiResponse::success($plan, 'Plan updated');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function destroy(Plan $plan)
    {
        try {
            $this->planService->deactivate($plan);
            return ApiResponse::success(null, 'Plan deactivated');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
