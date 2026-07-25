<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Product;
use App\Models\Service;
use App\Services\NotificationService;
use App\Services\PlanService;
use App\Services\VendorPanelService;
use Illuminate\Http\Request;
use Throwable;

class VendorPanelController extends Controller
{
    public function __construct(
        protected VendorPanelService $panelService,
        protected PlanService $planService,
        protected NotificationService $notificationService,
    ) {}

    private function vendor()
    {
        return auth()->user()->vendor;
    }

    public function me()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor profile not found', 404);
            $vendor->load('activePlan.plan');
            $activePlan = $this->planService->getActivePlan($vendor);
            $usage = $this->planService->usageCounts($vendor);
            return ApiResponse::success([
                'vendor'      => $vendor,
                'active_plan' => $activePlan,
                'usage'       => $usage,
            ]);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function updateMe(Request $request)
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor profile not found', 404);
            $data = $request->validate([
                'name'                  => 'sometimes|string|max:255',
                'name_it'               => 'nullable|string|max:255',
                'phone'                 => 'nullable|string|max:30',
                'logo_url'              => 'nullable|string|max:500',
                'description'           => 'nullable|string',
                'description_it'        => 'nullable|string',
                'address'               => 'sometimes|string',
                'address_it'            => 'nullable|string',
                'city'                  => 'sometimes|string',
                'city_it'               => 'nullable|string',
                'working_hours'         => 'nullable|array',
                'slot_duration_minutes' => 'nullable|integer|min:15|max:120',
                'map_embed'             => 'nullable|string',
            ]);
            $vendor->update($data);
            return ApiResponse::success($vendor->refresh(), 'Profile updated');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function plan()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor profile not found', 404);
            $activePlan = $this->planService->getActivePlan($vendor);
            $usage = $this->planService->usageCounts($vendor);
            return ApiResponse::success(['active_plan' => $activePlan, 'usage' => $usage]);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function stats()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor profile not found', 404);
            return ApiResponse::success($this->panelService->getStats($vendor));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    // Services
    public function services()
    {
        try {
            $vendor = $this->vendor();
            return ApiResponse::success(Service::with('serviceCategory')->where('vendor_id', $vendor->id)->paginate(20));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function createService(Request $request)
    {
        try {
            $data = $request->validate([
                'name'             => 'required|string|max:255',
                'name_it'          => 'nullable|string|max:255',
                'description'      => 'nullable|string',
                'description_it'   => 'nullable|string',
                'image_url'        => 'nullable|string|max:500',
                'price'            => 'required|numeric|min:0',
                'duration_minutes' => 'required|integer|min:5',
                'is_active'        => 'boolean',
                'service_category_id' => 'nullable|exists:service_categories,id',
            ]);
            $service = $this->panelService->createService($this->vendor(), $data);
            return ApiResponse::created($service->load('serviceCategory'), 'Service created');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function updateService(Request $request, Service $service)
    {
        try {
            $data = $request->validate([
                'name'             => 'sometimes|string|max:255',
                'name_it'          => 'nullable|string|max:255',
                'description'      => 'nullable|string',
                'description_it'   => 'nullable|string',
                'image_url'        => 'nullable|string|max:500',
                'price'            => 'sometimes|numeric|min:0',
                'duration_minutes' => 'sometimes|integer|min:5',
                'is_active'        => 'boolean',
                'service_category_id' => 'sometimes|nullable|exists:service_categories,id',
            ]);
            $service = $this->panelService->updateService($this->vendor(), $service, $data);
            return ApiResponse::success($service->load('serviceCategory'), 'Service updated');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function deleteService(Service $service)
    {
        try {
            $this->panelService->deleteService($this->vendor(), $service);
            return ApiResponse::success(null, 'Service deleted');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    // Products
    public function products()
    {
        try {
            $vendor = $this->vendor();
            return ApiResponse::success(Product::with('productCategory')->where('vendor_id', $vendor->id)->paginate(20));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function createProduct(Request $request)
    {
        try {
            $data = $request->validate([
                'name'        => 'required|string|max:255',
                'name_it'     => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'description_it' => 'nullable|string',
                'image_url'   => 'nullable|string|max:500',
                'price'       => 'required|numeric|min:0',
                'stock'       => 'required|integer|min:0',
                'is_active'   => 'boolean',
                'product_category_id' => 'nullable|exists:product_categories,id',
            ]);
            $product = $this->panelService->createProduct($this->vendor(), $data);
            return ApiResponse::created($product->load('productCategory'), 'Product created');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function updateProduct(Request $request, Product $product)
    {
        try {
            $data = $request->validate([
                'name'        => 'sometimes|string|max:255',
                'name_it'     => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'description_it' => 'nullable|string',
                'image_url'   => 'nullable|string|max:500',
                'price'       => 'sometimes|numeric|min:0',
                'stock'       => 'sometimes|integer|min:0',
                'is_active'   => 'boolean',
                'product_category_id' => 'sometimes|nullable|exists:product_categories,id',
            ]);
            $product = $this->panelService->updateProduct($this->vendor(), $product, $data);
            return ApiResponse::success($product->load('productCategory'), 'Product updated');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function deleteProduct(Product $product)
    {
        try {
            $this->panelService->deleteProduct($this->vendor(), $product);
            return ApiResponse::success(null, 'Product deleted');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function boostService(\Illuminate\Http\Request $request, Service $service)
    {
        try {
            $vendor = $this->vendor();
            abort_if($service->vendor_id !== $vendor->id, 403, 'Forbidden');
            $activePlan = $this->planService->getActivePlan($vendor);
            abort_unless((bool) $activePlan, 403, 'No active plan');

            $tierId = $request->input('boost_tier_id');
            $tier   = $tierId ? \App\Models\BoostTier::where('id', $tierId)->where('is_active', true)->first() : null;
            abort_unless((bool) $tier, 422, 'A valid boost tier is required');

            $budget = (float) $request->input('budget', 0);
            abort_if($budget < $tier->cost_per_click, 422, 'Budget must be at least the cost per click (€' . number_format($tier->cost_per_click, 2) . ')');

            $service->update([
                'is_boosted'          => true,
                'boost_tier_id'       => $tier->id,
                'boost_price'         => $tier->price,
                'boost_budget'        => $budget,
                'boost_budget_spent'  => 0,
                'boost_clicks'        => 0,
                'boosted_until'       => null,
            ]);
            return ApiResponse::success($service->refresh(), 'Service boosted (CPC: €' . number_format($tier->cost_per_click, 2) . ', Budget: €' . number_format($budget, 2) . ')');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function boostProduct(\Illuminate\Http\Request $request, Product $product)
    {
        try {
            $vendor = $this->vendor();
            abort_if($product->vendor_id !== $vendor->id, 403, 'Forbidden');
            $activePlan = $this->planService->getActivePlan($vendor);
            abort_unless((bool) $activePlan, 403, 'No active plan');

            $tierId = $request->input('boost_tier_id');
            $tier   = $tierId ? \App\Models\BoostTier::where('id', $tierId)->where('is_active', true)->first() : null;
            abort_unless((bool) $tier, 422, 'A valid boost tier is required');

            $budget = (float) $request->input('budget', 0);
            abort_if($budget < $tier->cost_per_click, 422, 'Budget must be at least the cost per click (€' . number_format($tier->cost_per_click, 2) . ')');

            $product->update([
                'is_boosted'          => true,
                'boost_tier_id'       => $tier->id,
                'boost_price'         => $tier->price,
                'boost_budget'        => $budget,
                'boost_budget_spent'  => 0,
                'boost_clicks'        => 0,
                'boosted_until'       => null,
            ]);
            return ApiResponse::success($product->refresh(), 'Product boosted (CPC: €' . number_format($tier->cost_per_click, 2) . ', Budget: €' . number_format($budget, 2) . ')');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    // Bookings
    public function bookings(Request $request)
    {
        try {
            $vendor = $this->vendor();
            $query = Booking::where('vendor_id', $vendor->id)
                ->with(['user', 'service'])
                ->latest('scheduled_at');

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            return ApiResponse::success($query->paginate(20));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function updateBookingStatus(Booking $booking, string $status)
    {
        try {
            $booking = $this->panelService->updateBookingStatus($this->vendor(), $booking, $status);
            return ApiResponse::success($booking, 'Booking status updated');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    // Orders
    public function orders()
    {
        try {
            $vendor = $this->vendor();
            $orders = \App\Models\Order::where('vendor_id', $vendor->id)
                ->with(['user', 'items.product'])
                ->latest()
                ->paginate(20);
            return ApiResponse::success($orders);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function showOrder(\App\Models\Order $order)
    {
        try {
            $vendor = $this->vendor();
            if ($order->vendor_id !== $vendor->id) {
                return ApiResponse::error('Not your order', 403);
            }
            return ApiResponse::success($order->load(['user', 'items.product']));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function updateOrderStatus(\App\Models\Order $order, string $status)
    {
        try {
            $vendor = $this->vendor();
            if ($order->vendor_id !== $vendor->id) {
                return ApiResponse::error('Not your order', 403);
            }
            $allowed = ['processing', 'shipped', 'delivered', 'cancelled'];
            if (!in_array($status, $allowed)) {
                return ApiResponse::error('Invalid status', 422);
            }
            $order->update(['status' => $status]);
            $order->refresh()->load(['user', 'items.product']);

            $statusLabels = [
                'processing' => 'Order is being processed',
                'shipped'    => 'Order has been shipped',
                'delivered'  => 'Order delivered',
                'cancelled'  => 'Order cancelled',
            ];

            if ($order->user_id) {
                $this->notificationService->notifyUser($order->user_id, 'order_status_updated', $statusLabels[$status] ?? 'Order updated', [
                    'order_id' => $order->id,
                    'status'   => $status,
                    'vendor'   => $vendor->name,
                ]);
            }

            return ApiResponse::success($order);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    // Notifications
    public function notifications()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor not found', 404);
            return ApiResponse::success($this->panelService->getUnreadNotifications($vendor));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function allNotifications()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor not found', 404);
            return ApiResponse::success($this->panelService->getAllNotifications($vendor));
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function notificationsCount()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor not found', 404);
            return ApiResponse::success(['count' => $this->panelService->getUnreadCount($vendor)]);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function markNotificationsRead()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor not found', 404);
            $this->panelService->markNotificationsRead($vendor);
            return ApiResponse::success(null, 'Notifications marked as read');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function newOrdersCount()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor not found', 404);
            return ApiResponse::success(['count' => $this->panelService->getNewOrdersCount($vendor)]);
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function markOrdersSeen()
    {
        try {
            $vendor = $this->vendor();
            if (!$vendor) return ApiResponse::error('Vendor not found', 404);
            $this->panelService->markOrdersSeen($vendor);
            return ApiResponse::success(null, 'Orders marked as seen');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
