<?php

namespace App\Observers;

use App\Models\ImplantSubType;
use App\Models\ImplantType;

class ImplantTypeObserver
{
    public function deleting(ImplantType $implantType)
    {
        $defaultImplantSubType = ImplantSubType::firstOrCreate(['name' => 'Sin Subtipo']);
        $defaultImplantType = ImplantType::firstOrCreate(['name' => 'Sin Tipo']);
        $defaultImplantType->implantSubTypes()->sync([$defaultImplantSubType->id]);
        $implantType->implants()->each(function ($implant) use ($defaultImplantType, $defaultImplantSubType) {
            $implant->implant_type_id = $defaultImplantType->id;
            $implant->implant_sub_type_id = $defaultImplantSubType->id;
            $implant->save();
        });
    }

    public function forceDeleted(ImplantType $implantType)
    {
        $this->deleting($implantType);
    }
}
