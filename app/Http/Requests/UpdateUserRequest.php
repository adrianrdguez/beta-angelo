<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return Auth::user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            /* 'email' => [
                'email',
                Rule::unique('users'),
            ],
            'password' => [
                'string',
                'min:8',
                'max:100',
            ], */
            'roleId' => [
                'nullable',
                'numeric',
                'min:1',
                Rule::exists(Role::class, 'id'),
            ],
        ];
    }
}
