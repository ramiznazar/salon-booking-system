<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Services\SlotService;
use Illuminate\Http\Request;
use Throwable;

class SlotController extends Controller
{
    public function __construct(protected SlotService $slotService) {}

    public function available(Request $request, Vendor $vendor)
    {
        try {
            $request->validate(['date' => 'required|date|after_or_equal:today']);
            $slots = $this->slotService->available($vendor, $request->date);
            return ApiResponse::success($slots);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
