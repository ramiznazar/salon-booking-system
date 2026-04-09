<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Throwable;

class AnalyticsController extends Controller
{
    public function __construct(protected AnalyticsService $analyticsService) {}
    public function report() { try { return ApiResponse::success($this->analyticsService->report()); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
}
