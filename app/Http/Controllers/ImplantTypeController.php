<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreImplantTypeRequest;
use App\Http\Requests\UpdateImplantTypeRequest;
use App\Models\ImplantSubType;
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
        $implantTypes = ImplantType::select()->where('name', '!=', 'Sin Tipo');
        return view('implantType.index', ['implantTypes' => $implantTypes->paginate(20)]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('implantType.create', ['implantSubTypes' => ImplantSubType::where('name', '!=', 'Sin Subtipo')->get()]);
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
        $implantType->implantSubTypes()->sync($request->implant_subtypes);
        return redirect()->route('implantType.index');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ImplantType  $implantType
     * @return \Illuminate\Http\Response
     */
    public function show(ImplantType $implantType)
    {
        return view('implantType.show', ['implantType' => $implantType]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ImplantType  $implantType
     * @return \Illuminate\Http\Response
     */
    public function edit(ImplantType $implantType)
    {
        return view('implantType.edit', ['implantType' => $implantType, 'implantSubTypes' => ImplantSubType::where('name', '!=', 'Sin Subtipo')->get()]);
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
        $implantType->implantSubTypes()->sync($request->implant_subtypes);
        return redirect()->route('implantType.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ImplantType  $implantType
     * @return \Illuminate\Http\Response
     */
    public function destroy(ImplantType $implantType)
    {
        $implantType->delete();
        return redirect()->route('implantType.index');
    }
}
