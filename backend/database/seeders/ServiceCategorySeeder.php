<?php

namespace Database\Seeders;

use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Facials', 'slug' => 'facials', 'is_active' => true],
            ['name' => 'Hair Styling', 'slug' => 'hair-styling', 'is_active' => true],
            ['name' => 'Nails', 'slug' => 'nails', 'is_active' => true],
            ['name' => 'Massage', 'slug' => 'massage', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            ServiceCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
