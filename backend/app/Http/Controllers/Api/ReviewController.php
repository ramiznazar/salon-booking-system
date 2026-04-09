<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Models\Review;
use App\Services\ReviewService;
use Throwable;

class ReviewController extends Controller
{
    public function __construct(protected ReviewService $reviewService) {}
    public function index() { try { return ApiResponse::success(Review::with(['user', 'vendor'])->paginate(20)); } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); } }
    public function store(StoreReviewRequest $request) { try { return ApiResponse::created($this->reviewService->create($request->validated())); } catch (Throwable $e) { return ApiResponse::error($e->getMessage(), 409); } }
}
