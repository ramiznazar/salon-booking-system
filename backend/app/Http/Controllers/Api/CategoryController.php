<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class CategoryController extends Controller
{
    public function productIndex()
    {
        try {
            return ApiResponse::success(ProductCategory::where('is_active', true)->orderBy('name')->get());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function serviceIndex()
    {
        try {
            return ApiResponse::success(ServiceCategory::where('is_active', true)->orderBy('name')->get());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function adminProductIndex()
    {
        try {
            return ApiResponse::success(ProductCategory::orderBy('name')->get());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function adminServiceIndex()
    {
        try {
            return ApiResponse::success(ServiceCategory::orderBy('name')->get());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function storeProduct(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:120',
                'slug' => 'nullable|string|max:140|unique:product_categories,slug',
                'is_active' => 'boolean',
            ]);
            $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
            $data['is_active'] = $data['is_active'] ?? true;

            return ApiResponse::created(ProductCategory::create($data), 'Product category created');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function storeService(Request $request)
    {
        try {
            $data = $request->validate([
                'name' => 'required|string|max:120',
                'slug' => 'nullable|string|max:140|unique:service_categories,slug',
                'is_active' => 'boolean',
            ]);
            $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
            $data['is_active'] = $data['is_active'] ?? true;

            return ApiResponse::created(ServiceCategory::create($data), 'Service category created');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function updateProduct(Request $request, ProductCategory $productCategory)
    {
        try {
            $data = $request->validate([
                'name' => 'sometimes|string|max:120',
                'slug' => 'sometimes|nullable|string|max:140|unique:product_categories,slug,' . $productCategory->id,
                'is_active' => 'sometimes|boolean',
            ]);

            if (array_key_exists('name', $data) && !array_key_exists('slug', $data)) {
                $data['slug'] = Str::slug($data['name']);
            }

            $productCategory->update($data);
            return ApiResponse::success($productCategory->refresh());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function updateService(Request $request, ServiceCategory $serviceCategory)
    {
        try {
            $data = $request->validate([
                'name' => 'sometimes|string|max:120',
                'slug' => 'sometimes|nullable|string|max:140|unique:service_categories,slug,' . $serviceCategory->id,
                'is_active' => 'sometimes|boolean',
            ]);

            if (array_key_exists('name', $data) && !array_key_exists('slug', $data)) {
                $data['slug'] = Str::slug($data['name']);
            }

            $serviceCategory->update($data);
            return ApiResponse::success($serviceCategory->refresh());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function destroyProduct(ProductCategory $productCategory)
    {
        try {
            $productCategory->delete();
            return ApiResponse::success(null, 'Deleted');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function destroyService(ServiceCategory $serviceCategory)
    {
        try {
            $serviceCategory->delete();
            return ApiResponse::success(null, 'Deleted');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
