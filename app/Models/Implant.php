<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Implant extends Model implements HasMedia
{
    use InteractsWithMedia;
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'model',
        'measureWidth',
        'implant_type_id',
        'implant_sub_type_id',
        'allowRotation',
        'allowDisplay',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('lateralView')
            ->singleFile()
            ->acceptsMimeTypes(['image/png']);
        $this->addMediaCollection('aboveView')
            ->singleFile()
            ->acceptsMimeTypes(['image/png']);
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(368)
            ->height(232)
            ->sharpen(10);
    }

    public function implantType()
    {
        return $this->belongsTo(ImplantType::class);
    }

    public function implantSubType()
    {
        return $this->belongsTo(ImplantSubType::class);
    }
}
