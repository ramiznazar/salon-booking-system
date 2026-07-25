<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->decimal('boost_price', 8, 2)->nullable()->after('is_boosted');
            $table->unsignedBigInteger('boost_tier_id')->nullable()->after('boost_price');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('boost_price', 8, 2)->nullable()->after('is_boosted');
            $table->unsignedBigInteger('boost_tier_id')->nullable()->after('boost_price');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['boost_price', 'boost_tier_id']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['boost_price', 'boost_tier_id']);
        });
    }
};
