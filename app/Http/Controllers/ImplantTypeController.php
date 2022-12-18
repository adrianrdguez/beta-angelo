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
        return view('implantType.index', ['implantTypes' => ImplantType::paginate(25)]);
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
        return view('implantType.create');
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
        return $this->index();
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
        return view('implantType.edit', ['implantType' => $implantType]);
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
        return $this->index();
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
        return $this->index();
    }
}
