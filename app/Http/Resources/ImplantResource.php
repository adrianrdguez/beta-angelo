<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ImplantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $lateralViewUrl = $this->getFirstMediaUrl('lateralView');
        $aboveViewUrl = $this->getFirstMediaUrl('aboveView');
        return [
            'id' => $this->id,
            'name' => $this->name,
            'model' => $this->model,
            'measureWidth' => $this->measureWidth,
            'lateralViewUrl' => !empty($lateralViewUrl) ? $lateralViewUrl : null,
            'aboveViewUrl' => !empty($aboveViewUrl) ? $aboveViewUrl : null,
            'allowRotation' => $this->allowRotation,
        ];
    }
}
