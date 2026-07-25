<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\BoostTier;
use Illuminate\Http\Request;
use Throwable;

class BoostTierController extends Controller
{
    public function index()
    {
        try {
            return ApiResponse::success(BoostTier::orderBy('price')->get());
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function adminIndex()
    {
        try {
            return ApiResponse::success(BoostTier::orderBy('price')->get());
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'name'           => 'required|string|max:100',
                'description'    => 'nullable|string',
                'cost_per_click' => 'required|numeric|min:0.01',
                'is_active'      => 'boolean',
            ]);
            $data['is_active']    = $data['is_active'] ?? true;
            $data['duration_days'] = 0;
            $data['price']         = 0;
            return ApiResponse::created(BoostTier::create($data), 'Boost tier created');
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function update(Request $request, BoostTier $boostTier)
    {
        try {
            $data = $request->validate([
                'name'           => 'sometimes|string|max:100',
                'description'    => 'nullable|string',
                'cost_per_click' => 'sometimes|numeric|min:0.01',
                'is_active'      => 'sometimes|boolean',
            ]);
            $boostTier->update($data);
            return ApiResponse::success($boostTier->refresh());
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function destroy(BoostTier $boostTier)
    {
        try {
            $boostTier->delete();
            return ApiResponse::success(null, 'Deleted');
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }
}
