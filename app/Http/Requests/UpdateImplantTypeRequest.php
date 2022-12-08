<?php

namespace App\Http\Requests;

use App\Models\ImplantType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateImplantTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'id' => [
                'numeric',
                Rule::exists(ImplantType::class),
            ],
            'name' => [
                'string',
                'min:3',
                'max:100'
            ],
        ];
    }
}
