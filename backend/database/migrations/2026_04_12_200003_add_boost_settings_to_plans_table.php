<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->decimal('boost_price', 8, 2)->default(4.99)->after('max_products');
            $table->unsignedInteger('boost_duration_days')->default(7)->after('boost_price');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['boost_price', 'boost_duration_days']);
        });
    }
};
