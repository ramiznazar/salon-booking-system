<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Order;
use App\Models\Vendor;
use App\Services\AdminService;
use Throwable;

class AdminController extends Controller
{
    public function __construct(protected AdminService $adminService) {}
    public function approveVendor(Vendor $vendor) { try { return ApiResponse::success($this->adminService->updateVendorStatus($vendor, 'approved', auth()->id())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function rejectVendor(Vendor $vendor) { try { return ApiResponse::success($this->adminService->updateVendorStatus($vendor, 'rejected', auth()->id())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function banVendor(Vendor $vendor) { try { return ApiResponse::success($this->adminService->updateVendorStatus($vendor, 'banned', auth()->id())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function orders() { try { return ApiResponse::success(Order::with('items')->paginate(20)); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function bookings() { try { return ApiResponse::success(Booking::paginate(20)); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function snapshot() { try { return ApiResponse::success($this->adminService->snapshot()); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
}
