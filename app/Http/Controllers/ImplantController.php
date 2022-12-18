<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetImplantsApiRequest;
use App\Http\Requests\StoreImplantRequest;
use App\Http\Requests\UpdateImplantRequest;
use App\Http\Resources\ImplantResource;
use App\Models\Implant;

class ImplantController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('implant.index', ['implants' => Implant::paginate(25)]);
    }

    /**
     * Display a listing of the resource api.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexApi(GetImplantsApiRequest $request)
    {
        $implants = Implant::select()
            ->where('typeId', $request->typeId)
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
        return view('implant.create');
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
        $implant->addMediaFromRequest('lateralViewImg')->toMediaCollection('lateralView');
        $implant->addMediaFromRequest('aboveViewImg')->toMediaCollection('aboveView');
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
        return view('implant.edit', ['implant' => $implant]);
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
            $implant->addMediaFromRequest('lateralViewImg')->toMediaCollection('lateralView');
        }
        if ($request->hasFile('aboveViewImg') && $request->file('aboveViewImg')->isValid()) {
            $implant->addMediaFromRequest('aboveViewImg')->toMediaCollection('aboveView');
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
}
