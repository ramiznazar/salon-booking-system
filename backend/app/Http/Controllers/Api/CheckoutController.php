<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Checkout\CheckoutRequest;
use App\Services\CheckoutService;
use Throwable;

class CheckoutController extends Controller
{
    public function __construct(protected CheckoutService $checkoutService) {}
    public function checkout(CheckoutRequest $request) { try { return ApiResponse::success($this->checkoutService->checkout(auth()->id(), $request->validated('items')), 'Checkout complete'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage(), 409); } }
}
