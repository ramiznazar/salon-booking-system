<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Commission;
use App\Models\Product;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use App\Models\Vendor;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Throwable;

class AdminResourceController extends Controller
{
    public function __construct(protected ReviewService $reviewService) {}

    // ── Users ────────────────────────────────────────────────
    public function users(Request $request)
    {
        try {
            $query = User::query();
            if ($request->filled('role')) $query->where('role', $request->role);
            if ($request->filled('is_active')) $query->where('is_active', $request->boolean('is_active'));
            if ($request->filled('search')) $query->where('name', 'like', '%'.$request->search.'%');
            return ApiResponse::success($query->orderByDesc('created_at')->paginate(20));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function updateUser(Request $request, User $user)
    {
        try {
            $data = $request->validate([
                'role' => 'sometimes|in:admin,vendor,customer',
                'is_active' => 'sometimes|boolean',
            ]);
            $user->update($data);
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'user_update', 'entity_type' => 'user', 'entity_id' => $user->id, 'meta' => $data]);
            return ApiResponse::success($user->refresh());
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    // ── Vendors (list) ───────────────────────────────────────
    public function vendors(Request $request)
    {
        try {
            $query = Vendor::with('user');
            if ($request->filled('status')) $query->where('status', $request->status);
            if ($request->filled('city')) $query->where('city', 'like', '%'.$request->city.'%');
            if ($request->filled('search')) $query->where('name', 'like', '%'.$request->search.'%');
            return ApiResponse::success($query->orderByDesc('created_at')->paginate(20));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    // ── Products ─────────────────────────────────────────────
    public function products(Request $request)
    {
        try {
            $query = Product::with(['vendor', 'productCategory']);
            if ($request->filled('vendor_id')) $query->where('vendor_id', $request->vendor_id);
            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%'.$request->search.'%')
                      ->orWhere('name_it', 'like', '%'.$request->search.'%');
                });
            }
            return ApiResponse::success($query->orderByDesc('created_at')->paginate(20));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function createProduct(Request $request)
    {
        try {
            $data = $request->validate([
                'vendor_id'   => 'required|exists:vendors,id',
                'product_category_id' => 'nullable|exists:product_categories,id',
                'name'        => 'required|string|max:255',
                'name_it'     => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'description_it' => 'nullable|string',
                'image_url'   => 'nullable|string|max:500',
                'price'       => 'required|numeric|min:0',
                'stock'       => 'required|integer|min:0',
                'is_active'   => 'boolean',
            ]);
            $data['is_active'] = $data['is_active'] ?? true;
            $product = Product::create($data);
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'product_create', 'entity_type' => 'product', 'entity_id' => $product->id, 'meta' => ['name' => $product->name, 'vendor_id' => $product->vendor_id]]);
            return ApiResponse::created($product->load(['vendor', 'productCategory']), 'Product created');
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function updateProduct(Request $request, Product $product)
    {
        try {
            $data = $request->validate([
                'name'          => 'sometimes|string|max:255',
                'name_it'       => 'nullable|string|max:255',
                'description'   => 'nullable|string',
                'description_it' => 'nullable|string',
                'is_active'     => 'sometimes|boolean',
                'is_boosted'    => 'sometimes|boolean',
                'boost_price'   => 'sometimes|nullable|numeric|min:0',
                'boost_tier_id' => 'sometimes|nullable|exists:boost_tiers,id',
                'image_url'     => 'sometimes|nullable|string|max:500',
                'product_category_id' => 'sometimes|nullable|exists:product_categories,id',
            ]);
            if (array_key_exists('is_boosted', $data) && $data['is_boosted']) {
                $tier = isset($data['boost_tier_id']) ? \App\Models\BoostTier::find($data['boost_tier_id']) : null;
                $days = $tier ? $tier->duration_days : 30;
                $data['boosted_until'] = now()->addDays($days);
                if ($tier && !isset($data['boost_price'])) $data['boost_price'] = $tier->price;
            } elseif (array_key_exists('is_boosted', $data) && !$data['is_boosted']) {
                $data['boosted_until'] = null;
            }
            $product->update($data);
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'product_update', 'entity_type' => 'product', 'entity_id' => $product->id, 'meta' => $data]);
            return ApiResponse::success($product->refresh()->load(['vendor', 'productCategory']));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function deleteProduct(Product $product)
    {
        try {
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'product_delete', 'entity_type' => 'product', 'entity_id' => $product->id, 'meta' => ['name' => $product->name]]);
            $product->delete();
            return ApiResponse::success(null, 'Deleted');
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    // ── Services ─────────────────────────────────────────────
    public function services(Request $request)
    {
        try {
            $query = Service::with(['vendor', 'serviceCategory']);
            if ($request->filled('vendor_id')) $query->where('vendor_id', $request->vendor_id);
            if ($request->filled('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('name', 'like', '%'.$request->search.'%')
                      ->orWhere('name_it', 'like', '%'.$request->search.'%');
                });
            }
            return ApiResponse::success($query->orderByDesc('created_at')->paginate(20));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function createService(Request $request)
    {
        try {
            $data = $request->validate([
                'vendor_id'        => 'required|exists:vendors,id',
                'service_category_id' => 'nullable|exists:service_categories,id',
                'name'             => 'required|string|max:255',
                'name_it'          => 'nullable|string|max:255',
                'description'      => 'nullable|string',
                'description_it'   => 'nullable|string',
                'image_url'        => 'nullable|string|max:500',
                'price'            => 'required|numeric|min:0',
                'duration_minutes' => 'required|integer|min:5',
                'is_active'        => 'boolean',
            ]);
            $data['is_active'] = $data['is_active'] ?? true;
            $service = Service::create($data);
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'service_create', 'entity_type' => 'service', 'entity_id' => $service->id, 'meta' => ['name' => $service->name, 'vendor_id' => $service->vendor_id]]);
            return ApiResponse::created($service->load(['vendor', 'serviceCategory']), 'Service created');
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function updateService(Request $request, Service $service)
    {
        try {
            $data = $request->validate([
                'name'             => 'sometimes|string|max:255',
                'name_it'          => 'nullable|string|max:255',
                'description'      => 'nullable|string',
                'description_it'   => 'nullable|string',
                'is_active'     => 'sometimes|boolean',
                'is_boosted'    => 'sometimes|boolean',
                'boost_price'   => 'sometimes|nullable|numeric|min:0',
                'boost_tier_id' => 'sometimes|nullable|exists:boost_tiers,id',
                'image_url'     => 'sometimes|nullable|string|max:500',
                'service_category_id' => 'sometimes|nullable|exists:service_categories,id',
            ]);
            if (array_key_exists('is_boosted', $data) && $data['is_boosted']) {
                $tier = isset($data['boost_tier_id']) ? \App\Models\BoostTier::find($data['boost_tier_id']) : null;
                $days = $tier ? $tier->duration_days : 30;
                $data['boosted_until'] = now()->addDays($days);
                if ($tier && !isset($data['boost_price'])) $data['boost_price'] = $tier->price;
            } elseif (array_key_exists('is_boosted', $data) && !$data['is_boosted']) {
                $data['boosted_until'] = null;
            }
            $service->update($data);
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'service_update', 'entity_type' => 'service', 'entity_id' => $service->id, 'meta' => $data]);
            return ApiResponse::success($service->refresh()->load(['vendor', 'serviceCategory']));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function deleteService(Service $service)
    {
        try {
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'service_delete', 'entity_type' => 'service', 'entity_id' => $service->id, 'meta' => ['name' => $service->name]]);
            $service->delete();
            return ApiResponse::success(null, 'Deleted');
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    // ── Reviews ──────────────────────────────────────────────
    public function reviews(Request $request)
    {
        try {
            $query = Review::with(['user', 'vendor', 'product']);
            if ($request->filled('is_flagged')) $query->where('is_flagged', $request->boolean('is_flagged'));
            if ($request->filled('vendor_id')) $query->where('vendor_id', $request->vendor_id);
            if ($request->filled('review_type')) $query->where('review_type', $request->review_type);
            return ApiResponse::success($query->orderByDesc('created_at')->paginate(20));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function updateReview(Request $request, Review $review)
    {
        try {
            $data = $request->validate(['is_flagged' => 'sometimes|boolean']);
            $review->update($data);
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'review_update', 'entity_type' => 'review', 'entity_id' => $review->id, 'meta' => $data]);
            return ApiResponse::success($review->refresh());
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    public function deleteReview(Review $review)
    {
        try {
            $snapshot = $review->replicate();
            AuditLog::create(['actor_id' => auth()->id(), 'action' => 'review_delete', 'entity_type' => 'review', 'entity_id' => $review->id, 'meta' => ['rating' => $review->rating]]);
            $review->delete();
            $this->reviewService->recalculateFromReview($snapshot);
            return ApiResponse::success(null, 'Deleted');
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    // ── Commissions ──────────────────────────────────────────
    public function commissions(Request $request)
    {
        try {
            $query = Commission::with(['order', 'vendor']);
            if ($request->filled('vendor_id')) $query->where('vendor_id', $request->vendor_id);
            return ApiResponse::success($query->orderByDesc('created_at')->paginate(20));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    // ── Audit Logs ───────────────────────────────────────────
    public function auditLogs(Request $request)
    {
        try {
            $query = AuditLog::query();
            if ($request->filled('action')) $query->where('action', $request->action);
            return ApiResponse::success($query->orderByDesc('created_at')->paginate(30));
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }

    // ── Dashboard Snapshot (enhanced) ────────────────────────
    public function dashboard()
    {
        try {
            return ApiResponse::success([
                'total_users' => User::count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'total_vendors' => Vendor::count(),
                'pending_vendors' => Vendor::where('status', 'pending')->count(),
                'approved_vendors' => Vendor::where('status', 'approved')->count(),
                'total_products' => Product::count(),
                'total_services' => Service::count(),
                'total_orders' => \App\Models\Order::count(),
                'total_bookings' => \App\Models\Booking::count(),
                'total_revenue' => (float) \App\Models\Order::sum('total'),
                'total_commissions' => (float) Commission::sum('amount'),
                'total_reviews' => Review::count(),
                'recent_orders' => \App\Models\Order::with(['user', 'vendor'])->orderByDesc('created_at')->limit(5)->get(),
                'recent_bookings' => \App\Models\Booking::with(['user', 'vendor', 'service'])->orderByDesc('created_at')->limit(5)->get(),
                'pending_vendor_list' => Vendor::with('user')->where('status', 'pending')->limit(5)->get(),
            ]);
        } catch (Throwable $e) { return ApiResponse::error($e->getMessage()); }
    }
}
