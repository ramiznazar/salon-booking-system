<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name'               => 'Starter',
                'description'        => 'Perfect for independent barbers just getting started.',
                'price'              => 9.99,
                'duration_days'      => 30,
                'features'           => ['Online booking page', 'Customer notifications', 'Basic analytics'],
                'max_services'       => 3,
                'max_products'       => 5,
                'is_active'          => true,
                'boost_price'        => 4.99,
                'boost_duration_days' => 7,
            ],
            [
                'name'               => 'Professional',
                'description'        => 'Ideal for growing salons with multiple services and products.',
                'price'              => 24.99,
                'duration_days'      => 30,
                'features'           => ['Everything in Starter', 'Priority listing', 'Advanced analytics', 'Customer reviews'],
                'max_services'       => 15,
                'max_products'       => 30,
                'is_active'          => true,
                'boost_price'        => 2.99,
                'boost_duration_days' => 14,
            ],
            [
                'name'               => 'Premium',
                'description'        => 'Unlimited everything for established studios and chains.',
                'price'              => 49.99,
                'duration_days'      => 30,
                'features'           => ['Everything in Professional', 'Unlimited services & products', 'Featured homepage placement', 'Dedicated support'],
                'max_services'       => null,
                'max_products'       => null,
                'is_active'          => true,
                'boost_price'        => 0.99,
                'boost_duration_days' => 30,
            ],
        ];

        foreach ($plans as $plan) {
            \App\Models\Plan::updateOrCreate(['name' => $plan['name']], $plan);
        }
    }
}
