<?php

namespace App\Observers;

use App\Models\ImplantSubType;
use App\Models\ImplantType;

class ImplantSubTypeObserver
{
    public function deleting(ImplantSubType $implantSubType)
    {
        $implantSubType->implantTypes()->each(function ($implantType) use ($implantSubType) {
            $implantType->implantSubTypes()->detach($implantSubType->id);
        });
        $defaultImplantSubType = ImplantSubType::firstOrCreate(['name' => 'Sin Subtipo']);
        $defaultImplantType = ImplantType::firstOrCreate(['name' => 'Sin Tipo']);
        $defaultImplantType->implantSubTypes()->sync([$defaultImplantSubType->id]);
        $implantSubType->implants()->each(function ($implant) use ($defaultImplantType, $defaultImplantSubType) {
            $implant->implant_type_id = $defaultImplantType->id;
            $implant->implant_sub_type_id = $defaultImplantSubType->id;
            $implant->save();
        });
    }

    public function forceDeleted(ImplantSubType $implantSubType)
    {
        $this->deleting($implantSubType);
    }
}
