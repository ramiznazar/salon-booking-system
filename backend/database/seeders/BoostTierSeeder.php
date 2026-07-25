<?php

namespace Database\Seeders;

use App\Models\BoostTier;
use Illuminate\Database\Seeder;

class BoostTierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            ['name' => 'Starter Boost',    'description' => '7-day homepage visibility',  'duration_days' => 7,  'price' => 4.99,  'is_active' => true],
            ['name' => 'Standard Boost',   'description' => '14-day homepage visibility', 'duration_days' => 14, 'price' => 8.99,  'is_active' => true],
            ['name' => 'Premium Boost',    'description' => '30-day homepage visibility', 'duration_days' => 30, 'price' => 14.99, 'is_active' => true],
        ];

        foreach ($tiers as $tier) {
            BoostTier::firstOrCreate(['name' => $tier['name']], $tier);
        }
    }
}
