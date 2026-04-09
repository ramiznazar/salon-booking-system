<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\VendorController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/vendors', [VendorController::class, 'index']);
Route::get('/vendors/{vendor}', [VendorController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::get('/reviews', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/vendors', [VendorController::class, 'store']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{booking}/status/{status}', [BookingController::class, 'updateStatus']);
    Route::get('/cart', [CartController::class, 'showMyCart']);
    Route::post('/cart/items', [CartController::class, 'add']);
    Route::post('/checkout', [CheckoutController::class, 'checkout']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::patch('/vendors/{vendor}/approve', [AdminController::class, 'approveVendor']);
        Route::patch('/vendors/{vendor}/reject', [AdminController::class, 'rejectVendor']);
        Route::patch('/vendors/{vendor}/ban', [AdminController::class, 'banVendor']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::get('/bookings', [AdminController::class, 'bookings']);
        Route::get('/snapshot', [AdminController::class, 'snapshot']);
        Route::get('/analytics', [AnalyticsController::class, 'report']);
    });
});
