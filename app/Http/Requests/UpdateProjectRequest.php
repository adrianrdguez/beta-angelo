<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'min:3',
                'max:100',
            ],
            'race' => [
                'string',
                'min:3',
                'max:100',
                'nullable'
            ],
            'weight' => [
                'numeric',
                'min:0.01',
                'nullable'
            ],
            'age' => [
                'numeric',
                'min:1',
                'nullable'
            ],
            'description' => [
                'string',
                'min:3',
                'nullable'
            ],
        ];
    }
}
