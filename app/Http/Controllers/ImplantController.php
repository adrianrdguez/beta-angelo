<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetImplantsApiRequest;
use App\Http\Requests\StoreImplantRequest;
use App\Http\Requests\UpdateImplantRequest;
use App\Http\Resources\ImplantCollection;
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
        // retornar vista paginada
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
        // retornar vista
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
        // retornar vista
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Implant  $implant
     * @return \Illuminate\Http\Response
     */
    public function show(Implant $implant)
    {
        // retornar vista
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Implant  $implant
     * @return \Illuminate\Http\Response
     */
    public function edit(Implant $implant)
    {
        // retornar vista
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
        // retornar vista
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
        // retornar vista
    }
}
