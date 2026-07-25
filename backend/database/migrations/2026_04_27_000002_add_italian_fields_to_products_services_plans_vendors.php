<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('name_it')->nullable()->after('name');
            $table->text('description_it')->nullable()->after('description');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('name_it')->nullable()->after('name');
            $table->text('description_it')->nullable()->after('description');
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->string('name_it')->nullable()->after('name');
            $table->text('description_it')->nullable()->after('description');
            $table->json('features_it')->nullable()->after('features');
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->string('name_it')->nullable()->after('name');
            $table->text('description_it')->nullable()->after('description');
            $table->string('address_it')->nullable()->after('address');
            $table->string('city_it')->nullable()->after('city');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['name_it', 'description_it']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['name_it', 'description_it']);
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['name_it', 'description_it', 'features_it']);
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['name_it', 'description_it', 'address_it', 'city_it']);
        });
    }
};
