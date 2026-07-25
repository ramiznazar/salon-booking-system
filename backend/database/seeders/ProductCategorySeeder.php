<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Skincare', 'slug' => 'skincare', 'is_active' => true],
            ['name' => 'Haircare', 'slug' => 'haircare', 'is_active' => true],
            ['name' => 'Makeup', 'slug' => 'makeup', 'is_active' => true],
            ['name' => 'Tools & Accessories', 'slug' => 'tools-accessories', 'is_active' => true],
        ];

        foreach ($categories as $category) {
            ProductCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
