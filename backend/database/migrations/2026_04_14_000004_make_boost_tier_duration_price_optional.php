<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('boost_tiers', function (Blueprint $table) {
            $table->unsignedInteger('duration_days')->default(0)->nullable()->change();
            $table->decimal('price', 8, 2)->default(0)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('boost_tiers', function (Blueprint $table) {
            $table->unsignedInteger('duration_days')->nullable(false)->change();
            $table->decimal('price', 8, 2)->nullable(false)->change();
        });
    }
};
