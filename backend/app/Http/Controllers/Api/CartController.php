<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddToCartRequest;
use App\Services\CartService;
use Throwable;

class CartController extends Controller
{
    public function __construct(protected CartService $cartService) {}
    public function showMyCart() { try { return ApiResponse::success($this->cartService->getOrCreate(auth()->id())->load('items.product.vendor')); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function add(AddToCartRequest $request) { try { return ApiResponse::created($this->cartService->addItem(auth()->id(), $request->validated()), 'Added to cart'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function remove(int $cartItemId) { try { $this->cartService->removeItem(auth()->id(), $cartItemId); return ApiResponse::success(null, 'Item removed'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function clear() { try { $this->cartService->clearCart(auth()->id()); return ApiResponse::success(null, 'Cart cleared'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
}
