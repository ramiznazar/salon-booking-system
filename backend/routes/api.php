<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminResourceController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BoostClickController;
use App\Http\Controllers\Api\BoostTierController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SlotController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\VendorPanelController;
use App\Http\Controllers\Api\VendorRegisterController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('api/auth/register');
    Route::post('/login', [AuthController::class, 'login'])->name('api/auth/login');
});

Route::get('/vendors', [VendorController::class, 'index']);
Route::get('/vendors/{vendor}', [VendorController::class, 'show']);
Route::get('/vendors/{vendor}/slots', [SlotController::class, 'available']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/plans', [PlanController::class, 'index']);
Route::get('/boost-tiers', [BoostTierController::class, 'index']);
Route::post('/products/{product}/click', [BoostClickController::class, 'productClick']);
Route::post('/services/{service}/click', [BoostClickController::class, 'serviceClick']);
Route::get('/product-categories', [CategoryController::class, 'productIndex']);
Route::get('/service-categories', [CategoryController::class, 'serviceIndex']);
Route::post('/auth/vendor-register', [VendorRegisterController::class, 'register']);

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
    Route::delete('/cart/items/{cartItemId}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/checkout', [CheckoutController::class, 'checkout']);
    Route::post('/reviews', [ReviewController::class, 'store']);

    Route::post('/upload/image', [UploadController::class, 'image']);

    Route::post('/plans/{plan}/purchase', [PlanController::class, 'purchase']);

    // Customer routes
    Route::prefix('my')->middleware('role:customer')->group(function () {
        Route::put('/profile', [CustomerController::class, 'updateProfile']);
        Route::get('/bookings', [CustomerController::class, 'myBookings']);
        Route::post('/bookings/{booking}/cancel', [CustomerController::class, 'cancelBooking']);
        Route::get('/orders', [CustomerController::class, 'myOrders']);
        Route::get('/notifications', [CustomerController::class, 'myNotifications']);
        Route::get('/notifications/count', [CustomerController::class, 'myNotificationsCount']);
        Route::patch('/notifications/read', [CustomerController::class, 'markNotificationsRead']);
        Route::get('/chat/unread', [ChatController::class, 'myUnreadCount']);
        Route::get('/chat/conversations', [ChatController::class, 'myConversations']);
        Route::post('/chat/conversations/vendor/{vendorId}', [ChatController::class, 'startOrGet']);
        Route::get('/chat/conversations/{conversationId}/messages', [ChatController::class, 'messages']);
        Route::post('/chat/conversations/{conversationId}/messages', [ChatController::class, 'sendMessage']);
        Route::delete('/chat/conversations/{conversationId}/messages', [ChatController::class, 'clearMessages']);
    });

    // Vendor panel routes
    Route::prefix('vendor')->middleware('role:vendor')->group(function () {
        Route::get('/me', [VendorPanelController::class, 'me']);
        Route::put('/me', [VendorPanelController::class, 'updateMe']);
        Route::get('/plan', [VendorPanelController::class, 'plan']);
        Route::get('/stats', [VendorPanelController::class, 'stats']);
        Route::get('/notifications', [VendorPanelController::class, 'notifications']);
        Route::get('/notifications/all', [VendorPanelController::class, 'allNotifications']);
        Route::get('/notifications/count', [VendorPanelController::class, 'notificationsCount']);
        Route::patch('/notifications/read', [VendorPanelController::class, 'markNotificationsRead']);
        Route::get('/orders/new-count', [VendorPanelController::class, 'newOrdersCount']);
        Route::patch('/orders/mark-seen', [VendorPanelController::class, 'markOrdersSeen']);

        Route::get('/services', [VendorPanelController::class, 'services']);
        Route::post('/services', [VendorPanelController::class, 'createService']);
        Route::put('/services/{service}', [VendorPanelController::class, 'updateService']);
        Route::delete('/services/{service}', [VendorPanelController::class, 'deleteService']);
        Route::post('/services/{service}/boost', [VendorPanelController::class, 'boostService']);

        Route::get('/products', [VendorPanelController::class, 'products']);
        Route::post('/products', [VendorPanelController::class, 'createProduct']);
        Route::put('/products/{product}', [VendorPanelController::class, 'updateProduct']);
        Route::delete('/products/{product}', [VendorPanelController::class, 'deleteProduct']);
        Route::post('/products/{product}/boost', [VendorPanelController::class, 'boostProduct']);

        Route::get('/bookings', [VendorPanelController::class, 'bookings']);
        Route::patch('/bookings/{booking}/status/{status}', [VendorPanelController::class, 'updateBookingStatus']);
        Route::get('/orders', [VendorPanelController::class, 'orders']);
        Route::get('/orders/{order}', [VendorPanelController::class, 'showOrder']);
        Route::patch('/orders/{order}/status/{status}', [VendorPanelController::class, 'updateOrderStatus']);

        Route::get('/chat/unread', [ChatController::class, 'vendorUnreadCount']);
        Route::get('/chat/conversations', [ChatController::class, 'vendorConversations']);
        Route::get('/chat/conversations/{conversationId}/messages', [ChatController::class, 'vendorMessages']);
        Route::post('/chat/conversations/{conversationId}/messages', [ChatController::class, 'vendorSendMessage']);
        Route::delete('/chat/conversations/{conversationId}/messages', [ChatController::class, 'vendorClearMessages']);
    });

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [AdminResourceController::class, 'dashboard']);

        Route::get('/me', [AdminController::class, 'me']);
        Route::put('/me', [AdminController::class, 'updateMe']);

        Route::patch('/vendors/{vendor}/approve', [AdminController::class, 'approveVendor']);
        Route::patch('/vendors/{vendor}/reject', [AdminController::class, 'rejectVendor']);
        Route::patch('/vendors/{vendor}/ban', [AdminController::class, 'banVendor']);
        Route::get('/vendors', [AdminResourceController::class, 'vendors']);
        Route::get('/users', [AdminResourceController::class, 'users']);
        Route::patch('/users/{user}', [AdminResourceController::class, 'updateUser']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::get('/bookings', [AdminController::class, 'bookings']);
        Route::get('/products', [AdminResourceController::class, 'products']);
        Route::post('/products', [AdminResourceController::class, 'createProduct']);
        Route::patch('/products/{product}', [AdminResourceController::class, 'updateProduct']);
        Route::delete('/products/{product}', [AdminResourceController::class, 'deleteProduct']);
        Route::get('/services', [AdminResourceController::class, 'services']);
        Route::post('/services', [AdminResourceController::class, 'createService']);
        Route::patch('/services/{service}', [AdminResourceController::class, 'updateService']);
        Route::delete('/services/{service}', [AdminResourceController::class, 'deleteService']);
        Route::get('/reviews', [AdminResourceController::class, 'reviews']);
        Route::patch('/reviews/{review}', [AdminResourceController::class, 'updateReview']);
        Route::delete('/reviews/{review}', [AdminResourceController::class, 'deleteReview']);
        Route::get('/commissions', [AdminResourceController::class, 'commissions']);
        Route::get('/audit-logs', [AdminResourceController::class, 'auditLogs']);
        Route::get('/snapshot', [AdminController::class, 'snapshot']);
        Route::get('/analytics', [AnalyticsController::class, 'report']);
        Route::get('/notifications', [AdminController::class, 'notifications']);
        Route::get('/notifications/count', [AdminController::class, 'notificationsCount']);
        Route::patch('/notifications/read', [AdminController::class, 'markNotificationsRead']);

        Route::get('/plans', [PlanController::class, 'adminIndex']);
        Route::post('/plans', [PlanController::class, 'store']);
        Route::put('/plans/{plan}', [PlanController::class, 'update']);
        Route::delete('/plans/{plan}', [PlanController::class, 'destroy']);

        Route::get('/boost-tiers', [BoostTierController::class, 'adminIndex']);
        Route::post('/boost-tiers', [BoostTierController::class, 'store']);
        Route::put('/boost-tiers/{boostTier}', [BoostTierController::class, 'update']);
        Route::delete('/boost-tiers/{boostTier}', [BoostTierController::class, 'destroy']);

        Route::get('/product-categories', [CategoryController::class, 'adminProductIndex']);
        Route::post('/product-categories', [CategoryController::class, 'storeProduct']);
        Route::put('/product-categories/{productCategory}', [CategoryController::class, 'updateProduct']);
        Route::delete('/product-categories/{productCategory}', [CategoryController::class, 'destroyProduct']);

        Route::get('/service-categories', [CategoryController::class, 'adminServiceIndex']);
        Route::post('/service-categories', [CategoryController::class, 'storeService']);
        Route::put('/service-categories/{serviceCategory}', [CategoryController::class, 'updateService']);
        Route::delete('/service-categories/{serviceCategory}', [CategoryController::class, 'destroyService']);
    });
});
