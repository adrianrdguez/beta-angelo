<?php

namespace App\Http\Requests;

use App\Models\ImplantSubType;
use App\Models\ImplantType;
use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class GetImplantsApiRequest extends FormRequest
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
            'user_id' => [
                'required',
                'numeric',
                Rule::exists(User::class, 'id')->withoutTrashed(),
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
        ];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success'   => false,
            'message'   => 'Validation errors',
            'data'      => $validator->errors()
        ]));
    }
}
