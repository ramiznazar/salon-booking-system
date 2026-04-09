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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('logo_url')->nullable();
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('state')->nullable();
            $table->string('country')->default('IT');
            $table->string('postal_code')->nullable();
            $table->json('categories')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'banned'])->default('pending');
            $table->boolean('is_verified')->default(false);
            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
