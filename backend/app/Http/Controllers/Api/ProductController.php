<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Throwable;

class ProductController extends Controller
{
    public function __construct(protected ProductService $productService) {}
    public function index(\Illuminate\Http\Request $request) {
        try {
            $query = Product::with(['vendor', 'productCategory'])->where('is_active', true)
                ->whereHas('vendor', fn($q) => $q->where('status', 'approved'));
            if ($request->filled('vendor_id')) {
                $query->where('vendor_id', $request->vendor_id);
            }
            $query->orderByRaw('(is_boosted = 1 AND boosted_until > NOW()) DESC')
                  ->orderByDesc('created_at');
            return ApiResponse::success($query->paginate(50));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }
    public function store(StoreProductRequest $request) { try { return ApiResponse::created($this->productService->create($request->validated())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function show(Product $product) { try { return ApiResponse::success($product->load(['vendor', 'images', 'productCategory'])); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function update(UpdateProductRequest $request, Product $product) { try { return ApiResponse::success($this->productService->update($product, $request->validated()), 'Updated'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
}
