<?php

namespace App\Observers;

use App\Models\ImplantType;

class ImplantTypeObserver
{
    /**
     * Handle the Implant "deleting" event.
     *
     * @param  \App\Models\ImplantType  $implantType
     * @return void
     */
    public function deleting(ImplantType $implantType)
    {
        $implantType->implants()->each(function ($implant) {
            $implant->delete();
        });
    }

    /**
     * Handle the User "forceDeleted" event.
     *
     * @param  \App\Models\ImplantType  $implantType
     * @return void
     */
    public function forceDeleted(ImplantType $implantType)
    {
        $implantType->implants()->withTrashed()->each(function ($implant) {
            $implant->forceDelete();
        });
    }
}
