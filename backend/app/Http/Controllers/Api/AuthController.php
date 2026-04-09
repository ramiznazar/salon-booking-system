<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\AuthService;
use Throwable;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    public function register(RegisterRequest $request)
    {
        try {
            $user = $this->authService->register($request->validated());
            $token = $user->createToken('api-token')->plainTextToken;
            return ApiResponse::created(['user' => $user, 'token' => $token], 'Registered');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $result = $this->authService->login($request->validated());
            if (! $result) {
                return ApiResponse::unauthorized('Invalid credentials');
            }
            return ApiResponse::success($result, 'Logged in');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function me()
    {
        try {
            return ApiResponse::success(auth()->user());
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }

    public function logout()
    {
        try {
            auth()->user()?->currentAccessToken()?->delete();
            return ApiResponse::success(null, 'Logged out');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
