<?php

namespace App\Http\Requests\Service;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceRequest extends FormRequest
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
        return ['name' => ['sometimes', 'string', 'max:255'], 'name_it' => ['nullable', 'string', 'max:255'], 'price' => ['sometimes', 'numeric', 'min:0'], 'duration_minutes' => ['sometimes', 'integer', 'min:5'], 'service_category_id' => ['sometimes', 'nullable', 'exists:service_categories,id'], 'description' => ['nullable', 'string'], 'description_it' => ['nullable', 'string']];
    }
}
