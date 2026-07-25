<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Vendor;
use App\Models\VendorPlan;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PlanService
{
    public function listActive()
    {
        return Plan::where('is_active', true)->orderBy('price')->get();
    }

    public function listAll()
    {
        return Plan::orderBy('price')->paginate(20);
    }

    public function create(array $data): Plan
    {
        if (isset($data['features']) && is_string($data['features'])) {
            $data['features'] = array_map('trim', explode(',', $data['features']));
        }
        if (isset($data['features_it']) && is_string($data['features_it'])) {
            $data['features_it'] = array_map('trim', explode(',', $data['features_it']));
        }
        return Plan::create($data);
    }

    public function update(Plan $plan, array $data): Plan
    {
        if (isset($data['features']) && is_string($data['features'])) {
            $data['features'] = array_map('trim', explode(',', $data['features']));
        }
        if (isset($data['features_it']) && is_string($data['features_it'])) {
            $data['features_it'] = array_map('trim', explode(',', $data['features_it']));
        }
        $plan->update($data);
        return $plan->refresh();
    }

    public function deactivate(Plan $plan): Plan
    {
        $plan->update(['is_active' => false]);
        return $plan->refresh();
    }

    public function purchase(Plan $plan, Vendor $vendor): VendorPlan
    {
        return DB::transaction(function () use ($plan, $vendor) {
            $now = Carbon::now();
            $vendorPlan = VendorPlan::create([
                'vendor_id'   => $vendor->id,
                'plan_id'     => $plan->id,
                'purchased_at' => $now,
                'expires_at'  => $now->copy()->addDays($plan->duration_days),
                'status'      => 'active',
                'amount_paid' => $plan->price,
            ]);

            $vendor->update([
                'active_plan_id' => $vendorPlan->id,
            ]);

            return $vendorPlan->load('plan');
        });
    }

    public function getActivePlan(Vendor $vendor): ?VendorPlan
    {
        return VendorPlan::where('vendor_id', $vendor->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->latest('purchased_at')
            ->with('plan')
            ->first();
    }

    public function usageCounts(Vendor $vendor): array
    {
        return [
            'services' => $vendor->services()->where('is_active', true)->count(),
            'products' => $vendor->products()->where('is_active', true)->count(),
        ];
    }
}
