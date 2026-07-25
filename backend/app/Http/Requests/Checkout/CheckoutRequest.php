<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
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
        return [
            'items'            => ['required', 'array', 'min:1'],
            'items.*.vendor_id'  => ['required', 'exists:vendors,id'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity'   => ['required', 'integer', 'min:1'],
            'delivery_address'   => ['required', 'string', 'max:500'],
            'phone'              => ['nullable', 'string', 'max:30'],
            'notes'              => ['nullable', 'string', 'max:1000'],
        ];
    }
}
