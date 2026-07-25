<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->enum('review_type', ['service', 'product'])->default('service')->after('booking_id');
            $table->foreignId('order_id')->nullable()->after('review_type')->constrained()->nullOnDelete();
            $table->foreignId('order_item_id')->nullable()->after('order_id')->constrained('order_items')->nullOnDelete();
            $table->foreignId('product_id')->nullable()->after('order_item_id')->constrained()->nullOnDelete();

            $table->unique(['user_id', 'booking_id'], 'reviews_user_booking_unique');
            $table->unique(['user_id', 'order_item_id'], 'reviews_user_order_item_unique');
            $table->index(['vendor_id', 'review_type'], 'reviews_vendor_review_type_idx');
            $table->index(['product_id', 'review_type'], 'reviews_product_review_type_idx');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('reviews_product_review_type_idx');
            $table->dropIndex('reviews_vendor_review_type_idx');
            $table->dropUnique('reviews_user_order_item_unique');
            $table->dropUnique('reviews_user_booking_unique');

            $table->dropConstrainedForeignId('product_id');
            $table->dropConstrainedForeignId('order_item_id');
            $table->dropConstrainedForeignId('order_id');
            $table->dropColumn('review_type');
        });
    }
};
