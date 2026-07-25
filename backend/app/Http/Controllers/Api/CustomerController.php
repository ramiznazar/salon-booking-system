<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Order;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Throwable;

class CustomerController extends Controller
{
    public function __construct(protected NotificationService $notificationService) {}
    public function updateProfile(Request $request)
    {
        try {
            $data = $request->validate([
                'name'  => 'sometimes|string|max:255',
                'phone' => 'sometimes|nullable|string|max:30',
            ]);
            $user = auth()->user();
            $user->update($data);
            return ApiResponse::success($user->fresh(), 'Profile updated');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function myBookings()
    {
        try {
            $bookings = Booking::where('user_id', auth()->id())
                ->with(['vendor', 'service'])
                ->latest('scheduled_at')
                ->paginate(20);
            return ApiResponse::success($bookings);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function cancelBooking(Booking $booking)
    {
        try {
            if ($booking->user_id !== auth()->id()) {
                return ApiResponse::forbidden('Not your booking');
            }
            if (!in_array($booking->status, ['pending', 'accepted'])) {
                return ApiResponse::error('Cannot cancel a booking that is ' . $booking->status, 422);
            }
            $booking->update(['status' => 'cancelled']);
            return ApiResponse::success($booking->refresh(), 'Booking cancelled');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function myOrders()
    {
        try {
            $orders = Order::where('user_id', auth()->id())
                ->with(['vendor', 'items.product'])
                ->latest()
                ->paginate(20);
            return ApiResponse::success($orders);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function myNotifications()
    {
        try {
            $notifications = $this->notificationService->getPaginated(auth()->id(), 30);
            return ApiResponse::success($notifications);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function myNotificationsCount()
    {
        try {
            $count = $this->notificationService->unreadCount(auth()->id());
            return ApiResponse::success(['count' => $count]);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function markNotificationsRead()
    {
        try {
            $this->notificationService->markRead(auth()->id());
            return ApiResponse::success(null, 'Notifications marked as read');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
