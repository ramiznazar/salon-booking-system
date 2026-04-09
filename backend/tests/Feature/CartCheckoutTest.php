<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_checkout_and_split_orders(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        Sanctum::actingAs($customer);

        $vendorAUser = User::factory()->create(['role' => 'vendor']);
        $vendorA = Vendor::create(['user_id' => $vendorAUser->id, 'name' => 'A Shop', 'slug' => 'a-shop', 'email' => 'a@shop.test', 'address' => 'Street 1', 'city' => 'Rome', 'status' => 'approved']);
        $vendorBUser = User::factory()->create(['role' => 'vendor']);
        $vendorB = Vendor::create(['user_id' => $vendorBUser->id, 'name' => 'B Shop', 'slug' => 'b-shop', 'email' => 'b@shop.test', 'address' => 'Street 2', 'city' => 'Milan', 'status' => 'approved']);

        $productA = Product::create(['vendor_id' => $vendorA->id, 'name' => 'A Product', 'price' => 10, 'stock' => 20]);
        $productB = Product::create(['vendor_id' => $vendorB->id, 'name' => 'B Product', 'price' => 20, 'stock' => 20]);

        $response = $this->postJson('/api/checkout', ['items' => [
            ['vendor_id' => $vendorA->id, 'product_id' => $productA->id, 'quantity' => 1],
            ['vendor_id' => $vendorB->id, 'product_id' => $productB->id, 'quantity' => 2],
        ]]);

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseCount('orders', 2);
    }
}
