<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->json('working_hours')->nullable()->after('reviews_count');
            $table->unsignedInteger('slot_duration_minutes')->default(30)->after('working_hours');
            $table->unsignedBigInteger('active_plan_id')->nullable()->after('slot_duration_minutes');
            $table->foreign('active_plan_id')->references('id')->on('vendor_plans')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropForeign(['active_plan_id']);
            $table->dropColumn(['working_hours', 'slot_duration_minutes', 'active_plan_id']);
        });
    }
};
