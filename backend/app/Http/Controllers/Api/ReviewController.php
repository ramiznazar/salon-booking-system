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
    public function index(\Illuminate\Http\Request $request) {
        try {
            $query = Review::with(['user', 'vendor', 'product']);
            if ($request->filled('vendor_id')) $query->where('vendor_id', $request->vendor_id);
            if ($request->filled('product_id')) $query->where('product_id', $request->product_id);
            if ($request->filled('review_type')) $query->where('review_type', $request->review_type);
            if ($request->boolean('my') && auth()->check()) {
                $query->where('user_id', auth()->id());
            }

            $perPage = max(1, min((int) $request->input('per_page', 20), 100));
            return ApiResponse::success($query->latest()->paginate($perPage));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }
    public function store(StoreReviewRequest $request) {
        try {
            $data = array_merge($request->validated(), ['user_id' => auth()->id()]);
            return ApiResponse::created($this->reviewService->create($data));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage(), 409); }
    }
}
