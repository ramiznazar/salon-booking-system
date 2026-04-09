<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_approve_vendor(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $vendorUser = User::factory()->create(['role' => 'vendor']);
        $vendor = Vendor::create(['user_id' => $vendorUser->id, 'name' => 'Pending Shop', 'slug' => 'pending-shop', 'email' => 'pending@shop.test', 'address' => 'Street 3', 'city' => 'Naples']);

        $response = $this->patchJson("/api/admin/vendors/{$vendor->id}/approve");
        $response->assertOk()->assertJsonPath('data.status', 'approved');
    }
}
