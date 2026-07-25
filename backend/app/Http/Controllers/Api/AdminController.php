<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Order;
use App\Models\User;
use App\Models\Vendor;
use App\Services\AdminService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Throwable;

class AdminController extends Controller
{
    public function __construct(
        protected AdminService $adminService,
        protected NotificationService $notificationService,
    ) {}

    public function approveVendor(Vendor $vendor)
    {
        try {
            $result = $this->adminService->updateVendorStatus($vendor, 'approved', auth()->id());
            $this->notificationService->notifyUser($vendor->user_id, 'vendor_approved', 'Your vendor account has been approved', [
                'vendor_id'   => $vendor->id,
                'vendor_name' => $vendor->name,
            ]);
            return ApiResponse::success($result);
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function me()
    {
        try {
            return ApiResponse::success(auth()->user());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function updateMe(Request $request)
    {
        try {
            /** @var User $user */
            $user = auth()->user();
            $data = $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'nullable|string|max:30',
                'logo_url' => 'nullable|string|max:500',
            ]);
            $user->update($data);
            return ApiResponse::success($user->refresh(), 'Profile updated');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function rejectVendor(Vendor $vendor)
    {
        try {
            $result = $this->adminService->updateVendorStatus($vendor, 'rejected', auth()->id());
            $this->notificationService->notifyUser($vendor->user_id, 'vendor_rejected', 'Your vendor account has been rejected', [
                'vendor_id'   => $vendor->id,
                'vendor_name' => $vendor->name,
            ]);
            return ApiResponse::success($result);
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function banVendor(Vendor $vendor)
    {
        try {
            $result = $this->adminService->updateVendorStatus($vendor, 'banned', auth()->id());
            $this->notificationService->notifyUser($vendor->user_id, 'vendor_banned', 'Your vendor account has been banned', [
                'vendor_id'   => $vendor->id,
                'vendor_name' => $vendor->name,
            ]);
            return ApiResponse::success($result);
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function orders(\Illuminate\Http\Request $request) { try { return ApiResponse::success(Order::with(['user', 'vendor', 'items.product'])->orderByDesc('created_at')->paginate(20)); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function bookings() { try { return ApiResponse::success(Booking::paginate(20)); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function snapshot() { try { return ApiResponse::success($this->adminService->snapshot()); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }

    public function notifications()
    {
        try {
            $userId = auth()->id();
            return ApiResponse::success($this->notificationService->getPaginated($userId, 30));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function notificationsCount()
    {
        try {
            return ApiResponse::success(['count' => $this->notificationService->unreadCount(auth()->id())]);
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function markNotificationsRead()
    {
        try {
            $this->notificationService->markRead(auth()->id());
            return ApiResponse::success(null, 'Notifications marked as read');
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }
}
