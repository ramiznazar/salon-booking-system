<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use App\Exceptions\ApiException;
use App\Helpers\ApiResponse;
use App\Http\Middleware\CheckRole;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias(['role' => CheckRole::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ApiException $e) {
            return ApiResponse::error($e->getMessage(), $e->status(), $e->errors());
        });

        $exceptions->render(function (ValidationException $e) {
            return ApiResponse::validationError($e->errors());
        });

        $exceptions->render(function (HttpExceptionInterface $e) {
            return ApiResponse::error($e->getMessage() ?: 'HTTP error', $e->getStatusCode());
        });
    })->create();
