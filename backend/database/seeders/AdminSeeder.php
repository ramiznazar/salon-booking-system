<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@lumina.test'],
            [
                'name' => 'Admin User',
                'password' => 'password123',
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
