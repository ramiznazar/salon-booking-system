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
    public function index() { try { return ApiResponse::success(Product::with('vendor')->paginate(20)); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function store(StoreProductRequest $request) { try { return ApiResponse::created($this->productService->create($request->validated())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function show(Product $product) { try { return ApiResponse::success($product->load('images')); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function update(UpdateProductRequest $request, Product $product) { try { return ApiResponse::success($this->productService->update($product, $request->validated()), 'Updated'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
}
