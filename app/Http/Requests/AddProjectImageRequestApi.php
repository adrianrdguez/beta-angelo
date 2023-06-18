<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class AddProjectImageRequestApi extends AddProjectImageRequest
{

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = parent::rules();
        $rules['implants'] = ['array', 'min:0'];
        return $rules;
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
