<?php

namespace App\Http\Requests;

use App\Models\ImplantSubType;
use App\Models\ImplantType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreImplantRequest extends FormRequest
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
                'max:100'
            ],
            'model' => [
                'required',
                'string',
                'min:3',
                'max:100'
            ],
            'measureWidth' => [
                'required',
                'numeric',
                'min:1',
            ],
            'implant_type_id' => [
                'required',
                'numeric',
                Rule::exists(ImplantType::class, 'id')->withoutTrashed(),
            ],
            'implant_sub_type_id' => [
                'required',
                'numeric',
                Rule::exists(ImplantSubType::class, 'id')->withoutTrashed(),
            ],
            'lateralViewImg' => [
                'required_without:aboveViewImg',
                'nullable',
                'mimetypes:image/png'
            ],
            'aboveViewImg' => [
                'required_without:lateralViewImg',
                'nullable',
                'mimetypes:image/png'
            ],
        ];
    }
}
