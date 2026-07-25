<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->default(0)->after('stock');
            $table->unsignedInteger('reviews_count')->default(0)->after('rating');
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->decimal('service_rating', 3, 2)->default(0)->after('reviews_count');
            $table->unsignedInteger('service_reviews_count')->default(0)->after('service_rating');
            $table->decimal('product_rating', 3, 2)->default(0)->after('service_reviews_count');
            $table->unsignedInteger('product_reviews_count')->default(0)->after('product_rating');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn(['service_rating', 'service_reviews_count', 'product_rating', 'product_reviews_count']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['rating', 'reviews_count']);
        });
    }
};
