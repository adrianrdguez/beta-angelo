<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UpdateRoleRequest extends FormRequest
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
            'name' => [
                'string',
                'min:3',
                'max:100',
                Rule::unique(Role::class)->ignore($this->role->id),
            ],
            'permissions' => [
                'array',
            ],
            'permissions.*' => [
                'string',
                Rule::exists(Permission::class, 'name'),
            ],
        ];
    }
}
