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
    public function checkout(CheckoutRequest $request)
    {
        try {
            $validated = $request->validated();
            $address = array_filter([
                'delivery_address' => $validated['delivery_address'] ?? null,
                'phone'            => $validated['phone'] ?? null,
                'notes'            => $validated['notes'] ?? null,
            ], fn($v) => $v !== null);
            return ApiResponse::success($this->checkoutService->checkout(auth()->id(), $validated['items'], $address), 'Checkout complete');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage(), 409);
        }
    }
}
