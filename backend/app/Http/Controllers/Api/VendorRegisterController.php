<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use App\Models\Vendor;
use App\Services\NotificationService;
use App\Services\PlanService;
use App\Services\VendorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Throwable;

class VendorRegisterController extends Controller
{
    public function __construct(
        protected VendorService $vendorService,
        protected PlanService $planService,
        protected NotificationService $notificationService,
    ) {}

    public function register(Request $request)
    {
        try {
            $data = $request->validate([
                'name'        => 'required|string|max:255',
                'email'       => 'required|email|unique:users,email',
                'password'    => 'required|string|min:8',
                'phone'       => 'nullable|string|max:30',
                'shop_name'   => 'required|string|max:255',
                'shop_name_it' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'description_it' => 'nullable|string',
                'address'     => 'required|string',
                'address_it'  => 'nullable|string',
                'city'        => 'required|string',
                'city_it'     => 'nullable|string',
                'plan_id'     => 'required|exists:plans,id',
            ]);

            $plan = Plan::findOrFail($data['plan_id']);
            if (!$plan->is_active) {
                return ApiResponse::error('Selected plan is no longer available', 422);
            }

            $result = DB::transaction(function () use ($data, $plan) {
                $user = User::create([
                    'name'     => $data['name'],
                    'email'    => $data['email'],
                    'password' => Hash::make($data['password']),
                    'phone'    => $data['phone'] ?? null,
                    'role'     => 'vendor',
                    'is_active' => true,
                ]);

                $vendor = $this->vendorService->create([
                    'user_id'     => $user->id,
                    'name'        => $data['shop_name'],
                    'name_it'     => $data['shop_name_it'] ?? null,
                    'email'       => $data['email'],
                    'phone'       => $data['phone'] ?? null,
                    'description' => $data['description'] ?? null,
                    'description_it' => $data['description_it'] ?? null,
                    'address'     => $data['address'],
                    'address_it'  => $data['address_it'] ?? null,
                    'city'        => $data['city'],
                    'city_it'     => $data['city_it'] ?? null,
                    'status'      => 'pending',
                ]);

                $vendorPlan = $this->planService->purchase($plan, $vendor);

                $token = $user->createToken('vendor-token')->plainTextToken;

                return [
                    'user'       => $user,
                    'vendor'     => $vendor->refresh(),
                    'plan'       => $vendorPlan,
                    'token'      => $token,
                ];
            });

            $this->notificationService->notifyAdmin('new_vendor_registered', 'New vendor registered', [
                'vendor_id'   => $result['vendor']->id,
                'vendor_name' => $result['vendor']->name,
                'user_name'   => $result['user']->name,
                'email'       => $result['user']->email,
            ]);

            return ApiResponse::created($result, 'Vendor registered successfully');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
