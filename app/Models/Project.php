<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Project extends Model implements HasMedia
{
    use InteractsWithMedia;
    use HasFactory;
    use SoftDeletes;

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('radiographies')
            ->acceptsMimeTypes([
            'image/jpeg',
            'image/jpg',
            'image/svg',
            'image/png',
        ]);
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->width(368)
            ->height(232)
            ->sharpen(10);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
