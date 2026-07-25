<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(protected NotificationService $notificationService) {}

    public function register(array $data): User
    {
        $user = User::create($data);

        $this->notificationService->notifyAdmin('new_user_registered', 'New user registered', [
            'user_id' => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
        ]);

        return $user;
    }

    public function login(array $credentials): ?array
    {
        $user = User::where('email', $credentials['email'])->first();
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return null;
        }
        return ['user' => $user, 'token' => $user->createToken('api-token')->plainTextToken];
    }
}
