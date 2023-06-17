<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class AddProjectImageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return Auth::user()?->projects()->find($this->route('project')) ?? false;
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
                'max:100'
            ],
            'radiographyImg' => [
                'required',
                'file',
                'mimetypes:image/png,image/jpeg,image/jpg,image/svg',
            ],
            'rotation' => [
                'integer',
                'required',
                'min:-270',
                'max:270',
            ],
        ];
    }
}
