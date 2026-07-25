<?php

namespace App\Http\Requests\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return true; }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return ['vendor_id' => ['required', 'exists:vendors,id'], 'product_category_id' => ['nullable', 'exists:product_categories,id'], 'name' => ['required', 'string', 'max:255'], 'name_it' => ['nullable', 'string', 'max:255'], 'price' => ['required', 'numeric', 'min:0'], 'stock' => ['required', 'integer', 'min:0'], 'description' => ['nullable', 'string'], 'description_it' => ['nullable', 'string']];
    }
}
