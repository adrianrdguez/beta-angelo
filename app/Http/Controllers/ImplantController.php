<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetImplantsApiRequest;
use App\Http\Requests\StoreImplantRequest;
use App\Http\Requests\UpdateImplantRequest;
use App\Http\Resources\ImplantResource;
use App\Models\Implant;
use App\Models\ImplantType;
use Illuminate\Http\UploadedFile;
use Spatie\Image\Image;

class ImplantController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('implant.index', ['implants' => Implant::paginate(20)]);
    }

    /**
     * Display a listing of the resource api.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexApi(GetImplantsApiRequest $request)
    {
        $implants = Implant::select()
            ->where('implant_type_id', $request->implant_type_id)
            ->where('implant_sub_type_id', $request->implant_sub_type_id)
            ->get();
        return ImplantResource::collection($implants);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('implant.create', ['implantTypes' => ImplantType::all()]);
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
        return view('implant.show', ['implant' => $implant]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Implant  $implant
     * @return \Illuminate\Http\Response
     */
    public function edit(Implant $implant)
    {
        return view('implant.edit', ['implant' => $implant, 'implantTypes' => ImplantType::all()]);
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
