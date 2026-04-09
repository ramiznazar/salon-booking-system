<?php

namespace Database\Seeders;

use App\Models\Commission;
use App\Models\Product;
use App\Models\Service;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(['email' => 'admin@lumina.test'], ['name' => 'Admin User', 'password' => Hash::make('password123'), 'role' => 'admin']);
        $vendorUser = User::updateOrCreate(['email' => 'vendor@lumina.test'], ['name' => 'Vendor User', 'password' => Hash::make('password123'), 'role' => 'vendor']);
        $customer = User::updateOrCreate(['email' => 'customer@lumina.test'], ['name' => 'Customer User', 'password' => Hash::make('password123'), 'role' => 'customer']);

        $vendor = Vendor::updateOrCreate(['email' => 'vendor@shop.test'], ['user_id' => $vendorUser->id, 'name' => 'Glow Studio', 'slug' => 'glow-studio', 'address' => 'Via Milano 12', 'city' => 'Catanzaro', 'status' => 'approved', 'is_verified' => true]);
        Product::updateOrCreate(['vendor_id' => $vendor->id, 'name' => 'Purifying Face Wash'], ['price' => 34, 'stock' => 100]);
        Service::updateOrCreate(['vendor_id' => $vendor->id, 'name' => 'Signature Hydrating Facial'], ['price' => 120, 'duration_minutes' => 60]);

        Commission::updateOrCreate(['is_global' => true], ['mode' => 'percent', 'value' => 10, 'amount' => 0]);
    }
}
