<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $data = null, string $message = 'OK', int $status = 200, array $meta = []): JsonResponse
    {
        return response()->json(compact('message', 'data', 'meta') + ['success' => true, 'errors' => null], $status);
    }

    public static function created(mixed $data = null, string $message = 'Created'): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    public static function paginated(mixed $data, array $meta, string $message = 'OK'): JsonResponse
    {
        return self::success($data, $message, 200, $meta);
    }

    public static function error(string $message = 'Error', int $status = 500, mixed $errors = null): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message, 'data' => null, 'meta' => [], 'errors' => $errors], $status);
    }

    public static function validationError(mixed $errors, string $message = 'Validation error'): JsonResponse { return self::error($message, 422, $errors); }
    public static function unauthorized(string $message = 'Unauthorized'): JsonResponse { return self::error($message, 401); }
    public static function forbidden(string $message = 'Forbidden'): JsonResponse { return self::error($message, 403); }
    public static function notFound(string $message = 'Not found'): JsonResponse { return self::error($message, 404); }
    public static function conflict(string $message = 'Conflict'): JsonResponse { return self::error($message, 409); }
}
