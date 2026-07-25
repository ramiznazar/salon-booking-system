<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Throwable;

class UploadController extends Controller
{
    public function image(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,jpg,png,webp,gif|max:4096',
            ]);

            $path = $request->file('image')->store('uploads', 'public');
            $url  = $request->getSchemeAndHttpHost() . '/storage/' . $path;

            return ApiResponse::success(['url' => $url], 'Image uploaded');
        } catch (Throwable $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
