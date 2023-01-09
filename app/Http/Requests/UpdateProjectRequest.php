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
                'string',
                'min:3',
                'max:100'
            ],
            'race' => [
                'string',
                'min:3',
                'max:100'
            ],
            'weight' => [
                'numeric',
                'min:0.01',
            ],
            'age' => [
                'numeric',
                'min:1',
            ],
            'description' => [
                'string',
                'min:3',
            ],
        ];
    }
}
