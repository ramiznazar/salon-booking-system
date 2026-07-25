<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Service;
use App\Models\Vendor;
use App\Services\NotificationService;
use Throwable;

class BoostClickController extends Controller
{
    public function __construct(protected NotificationService $notificationService) {}

    public function productClick(Product $product)
    {
        try {
            if (!$product->is_boosted) {
                return ApiResponse::success(['is_boosted' => false], 'Not boosted');
            }

            $tier = $product->boost_tier_id
                ? \App\Models\BoostTier::find($product->boost_tier_id)
                : null;

            $cpc = $tier ? $tier->cost_per_click : 0;

            $newSpent  = (float) $product->boost_budget_spent + $cpc;
            $newClicks = (int)   $product->boost_clicks + 1;
            $depleted  = $cpc > 0 && $newSpent >= (float) $product->boost_budget;

            $product->update([
                'boost_budget_spent' => $newSpent,
                'boost_clicks'       => $newClicks,
                'is_boosted'         => !$depleted,
                'boosted_until'      => $depleted ? null : $product->boosted_until,
            ]);

            if ($depleted) {
                $vendor = Vendor::find($product->vendor_id);
                if ($vendor) {
                    $this->notificationService->notifyVendor($vendor, 'boost_exhausted', 'Boost budget exhausted', [
                        'product_id'   => $product->id,
                        'product_name' => $product->name,
                        'type'         => 'product',
                    ]);
                }
            }

            return ApiResponse::success([
                'is_boosted'        => !$depleted,
                'boost_budget_spent'=> $newSpent,
                'boost_clicks'      => $newClicks,
                'depleted'          => $depleted,
            ], $depleted ? 'Boost ended: budget depleted' : 'Click recorded');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function serviceClick(Service $service)
    {
        try {
            if (!$service->is_boosted) {
                return ApiResponse::success(['is_boosted' => false], 'Not boosted');
            }

            $tier = $service->boost_tier_id
                ? \App\Models\BoostTier::find($service->boost_tier_id)
                : null;

            $cpc = $tier ? $tier->cost_per_click : 0;

            $newSpent  = (float) $service->boost_budget_spent + $cpc;
            $newClicks = (int)   $service->boost_clicks + 1;
            $depleted  = $cpc > 0 && $newSpent >= (float) $service->boost_budget;

            $service->update([
                'boost_budget_spent' => $newSpent,
                'boost_clicks'       => $newClicks,
                'is_boosted'         => !$depleted,
                'boosted_until'      => $depleted ? null : $service->boosted_until,
            ]);

            if ($depleted) {
                $vendor = Vendor::find($service->vendor_id);
                if ($vendor) {
                    $this->notificationService->notifyVendor($vendor, 'boost_exhausted', 'Boost budget exhausted', [
                        'service_id'   => $service->id,
                        'service_name' => $service->name,
                        'type'         => 'service',
                    ]);
                }
            }

            return ApiResponse::success([
                'is_boosted'        => !$depleted,
                'boost_budget_spent'=> $newSpent,
                'boost_clicks'      => $newClicks,
                'depleted'          => $depleted,
            ], $depleted ? 'Boost ended: budget depleted' : 'Click recorded');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
