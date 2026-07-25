<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `orders` MODIFY `status` ENUM('pending','paid','processing','shipped','delivered','completed','cancelled') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::table('orders')->where('status', 'shipped')->update(['status' => 'processing']);
            DB::table('orders')->where('status', 'delivered')->update(['status' => 'completed']);
            DB::statement("ALTER TABLE `orders` MODIFY `status` ENUM('pending','paid','processing','completed','cancelled') NOT NULL DEFAULT 'pending'");
        }
    }
};
