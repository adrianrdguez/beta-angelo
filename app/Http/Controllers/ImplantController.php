<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetImplantsApiRequest;
use App\Http\Requests\StoreImplantRequest;
use App\Http\Requests\UpdateImplantRequest;
use App\Http\Resources\ImplantResource;
use App\Models\Implant;
use App\Models\ImplantType;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Spatie\Image\Image;

class ImplantController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $implants = Implant::when($request->search, function ($query, $search) {
                return $query->where('name', 'like', '%' . $search . '%');
            })
            ->orderBy('model')
            ->paginate()
            ->withQueryString();
        return view('settings.implant.index', ['implants' => $implants, 'search' => $request->search]);
    }

    /**
     * Display a listing of the resource api.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexApi(GetImplantsApiRequest $request)
    {
        Auth::loginUsingId($request->user_id);
        $implants = Implant::select()
            ->where('implant_type_id', $request->implant_type_id)
            ->where('implant_sub_type_id', $request->implant_sub_type_id);
        $allowDisplay = [1];
        if (Auth::user()?->hasRole('admin')) {
            $allowDisplay[] = 0;
        }
        $implants->whereIn('allowDisplay', $allowDisplay);
        $implants->orderBy('model');
        return ImplantResource::collection($implants->get());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('settings.implant.create', ['implantTypes' => ImplantType::all()]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreImplantRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreImplantRequest $request)
    {
        $implant = new Implant();
        $implant->fill($request->validated());
        $implant->save();
        if ($request->hasFile('lateralViewImg') && $request->file('lateralViewImg')->isValid()) {
            $implant->addMedia($this->getHorizontalImg($request->lateralViewImg))->toMediaCollection('lateralView');
        }
        if ($request->hasFile('aboveViewImg') && $request->file('aboveViewImg')->isValid()) {
            $implant->addMedia($this->getHorizontalImg($request->aboveViewImg))->toMediaCollection('aboveView');
        }
        return redirect()->route('implant.index');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Implant  $implant
     * @return \Illuminate\Http\Response
     */
    public function show(Implant $implant)
    {
        return view('settings.implant.show', ['implant' => $implant]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Implant  $implant
     * @return \Illuminate\Http\Response
     */
    public function edit(Implant $implant)
    {
        return view('settings.implant.edit', ['implant' => $implant, 'implantTypes' => ImplantType::all()]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateImplantRequest  $request
     * @param  \App\Models\Implant  $implant
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateImplantRequest $request, Implant $implant)
    {
        $implant->fill($request->validated());
        $implant->save();
        if ($request->hasFile('lateralViewImg') && $request->file('lateralViewImg')->isValid()) {
            $implant->addMedia($this->getHorizontalImg($request->lateralViewImg))->toMediaCollection('lateralView');
        }
        if ($request->hasFile('aboveViewImg') && $request->file('aboveViewImg')->isValid()) {
            $implant->addMedia($this->getHorizontalImg($request->aboveViewImg))->toMediaCollection('aboveView');
        }
        return redirect()->route('implant.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Implant  $implant
     * @return \Illuminate\Http\Response
     */
    public function destroy(Implant $implant)
    {
        $implant->delete();
        return redirect()->route('implant.index');
    }

    private function getHorizontalImg(UploadedFile $file)
    {
        $imgDimensions = $this->getDimensions($file);
        if ($imgDimensions[1] > $imgDimensions[0]) {
            $image = imagecreatefrompng($file->getPathname());
            imagealphablending($image, false);
            imagesavealpha($image, true);
            $img = imagerotate($image, 90, imageColorAllocateAlpha($image, 0, 0, 0, 127));
            imagealphablending($img, false);
            imagesavealpha($img, true);
            imagepng($img, $file->getPathname());
        }
        return $file;
    }

    private function getDimensions(UploadedFile $file): array
    {
        try {
            $image = Image::load($file->getPathname());
            return [$image->getWidth(), $image->getHeight()];
        } catch (\Throwable $e) {
            return [null, null];
        }
    }
}
