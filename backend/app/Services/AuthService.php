<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): User
    {
        return User::create($data);
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
