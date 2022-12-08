<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreImplantTypeRequest;
use App\Http\Requests\UpdateImplantTypeRequest;
use App\Http\Resources\ImplantTypeResource;
use App\Models\ImplantType;

class ImplantTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // retornar vista
    }

    /**
     * Display a listing of the resource api.
     *
     * @return \Illuminate\Http\Response
     */
    public function indexApi()
    {
        $implantTypes = ImplantType::all();
        return ImplantTypeResource::collection($implantTypes);
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
     * @param  \App\Http\Requests\StoreImplantTypeRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreImplantTypeRequest $request)
    {
        $implantType = new ImplantType();
        $implantType->fill($request->validated());
        $implantType->save();
        // retornar vista
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ImplantType  $implantType
     * @return \Illuminate\Http\Response
     */
    public function show(ImplantType $implantType)
    {
        // retornar vista
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ImplantType  $implantType
     * @return \Illuminate\Http\Response
     */
    public function edit(ImplantType $implantType)
    {
        // retornar vista
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateImplantTypeRequest  $request
     * @param  \App\Models\ImplantType  $implantType
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateImplantTypeRequest $request, ImplantType $implantType)
    {
        $implantType->fill($request->validated());
        $implantType->save();
        // retornar vista
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ImplantType  $implantType
     * @return \Illuminate\Http\Response
     */
    public function destroy(ImplantType $implantType)
    {
        // retornar vista
    }
}
