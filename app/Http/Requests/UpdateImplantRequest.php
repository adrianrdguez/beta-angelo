<?php

namespace App\Http\Requests;

use App\Models\ImplantSubType;
use App\Models\ImplantType;
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
            'implant_type_id' => [
                'numeric',
                Rule::exists(ImplantType::class, 'id')->withoutTrashed(),
            ],
            'implant_sub_type_id' => [
                'numeric',
                Rule::exists(ImplantSubType::class, 'id')->withoutTrashed(),
            ],
            'lateralViewImg' => [
                'mimetypes:image/png'
            ],
            'aboveViewImg' => [
                'mimetypes:image/png'
            ],
            'allowRotation' => [
                'nullable',
                'required',
                'boolean'
            ],
            'allowDisplay' => [
                'nullable',
                'required',
                'boolean'
            ],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'allowRotation' => $this->allowRotation ?? false,
            'allowDisplay' => $this->allowDisplay ?? false,
        ]);
    }
}
