<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ImplantSubType extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'name',
    ];

    public function implants()
    {
        return $this->hasMany(Implant::class);
    }

    public function implantTypes()
    {
        return $this->belongsToMany(ImplantType::class);
    }
}
