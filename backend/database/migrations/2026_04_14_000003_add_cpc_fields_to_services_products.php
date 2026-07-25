<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->decimal('boost_budget', 8, 2)->nullable()->after('boost_tier_id');
            $table->decimal('boost_budget_spent', 8, 2)->default(0)->after('boost_budget');
            $table->unsignedInteger('boost_clicks')->default(0)->after('boost_budget_spent');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->decimal('boost_budget', 8, 2)->nullable()->after('boost_tier_id');
            $table->decimal('boost_budget_spent', 8, 2)->default(0)->after('boost_budget');
            $table->unsignedInteger('boost_clicks')->default(0)->after('boost_budget_spent');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['boost_budget', 'boost_budget_spent', 'boost_clicks']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['boost_budget', 'boost_budget_spent', 'boost_clicks']);
        });
    }
};
