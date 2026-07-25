<?php

namespace App\Http\Requests\Service;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
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
        return ['vendor_id' => ['required', 'exists:vendors,id'], 'service_category_id' => ['nullable', 'exists:service_categories,id'], 'name' => ['required', 'string', 'max:255'], 'name_it' => ['nullable', 'string', 'max:255'], 'price' => ['required', 'numeric', 'min:0'], 'duration_minutes' => ['required', 'integer', 'min:5'], 'description' => ['nullable', 'string'], 'description_it' => ['nullable', 'string']];
    }
}
