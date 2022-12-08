<?php

namespace App\Http\Requests;

use App\Models\Implant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateImplantRequest extends FormRequest
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
                Rule::exists(Implant::class),
            ],
            'name' => [
                'string',
                'min:3',
                'max:100'
            ],
            'model' => [
                'string',
                'min:3',
                'max:100'
            ],
            'measureWidth' => [
                'numeric',
                'min:1',
            ],
            'implantTypeId' => [
                'numeric',
                Rule::exists(ImplantType::class),
            ],
            'lateralViewImg' => [
                'mimetypes:image/png'
            ],
            'aboveViewImg' => [
                'mimetypes:image/png'
            ],
        ];
    }
}
