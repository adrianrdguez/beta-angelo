<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Implant extends Model
{
    use HasFactory;
    use SoftDeletes;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('lateralView')
            ->singleFile()
            ->acceptsMimeTypes(['image/png']);
        $this->addMediaCollection('aboveView')
            ->singleFile()
            ->acceptsMimeTypes(['image/png']);
    }

    public function implantType()
    {
        return $this->belongsTo(ImplantType::class);
    }
}
