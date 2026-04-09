<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Models\Booking;
use App\Services\BookingService;
use Throwable;

class BookingController extends Controller
{
    public function __construct(protected BookingService $bookingService) {}
    public function index() { try { return ApiResponse::success(Booking::with(['vendor', 'service'])->paginate(20)); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function store(StoreBookingRequest $request) { try { return ApiResponse::created($this->bookingService->create($request->validated())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function updateStatus(Booking $booking, string $status) { try { return ApiResponse::success($this->bookingService->updateStatus($booking, $status), 'Status updated'); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
}
