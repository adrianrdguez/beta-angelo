<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetImplantSubTypeApiRequest;
use App\Http\Requests\StoreImplantSubTypeRequest;
use App\Http\Requests\UpdateImplantSubTypeRequest;
use App\Http\Resources\ImplantSubTypeResource;
use App\Models\ImplantSubType;
use App\Models\ImplantType;

class ImplantSubTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('implantSubType.index', ['implantSubTypes' => ImplantSubType::paginate(20)]);
    }

    public function indexApi(GetImplantSubTypeApiRequest $request)
    {
        $implantType = ImplantType::find($request->implant_type_id);
        return ImplantSubTypeResource::collection($implantType->implantSubTypes);
    }


    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('implantSubType.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreImplantSubTypeRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreImplantSubTypeRequest $request)
    {
        $implantSubType = new ImplantSubType();
        $implantSubType->fill($request->validated());
        $implantSubType->save();
        return redirect()->route('implantSubType.index');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ImplantSubType  $implantSubType
     * @return \Illuminate\Http\Response
     */
    public function edit(ImplantSubType $implantSubType)
    {
        return view('implantSubType.edit', ['implantSubType' => $implantSubType]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateImplantSubTypeRequest  $request
     * @param  \App\Models\ImplantSubType  $implantSubType
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateImplantSubTypeRequest $request, ImplantSubType $implantSubType)
    {
        $implantSubType->fill($request->validated());
        $implantSubType->save();
        return redirect()->route('implantSubType.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ImplantSubType  $implantSubType
     * @return \Illuminate\Http\Response
     */
    public function destroy(ImplantSubType $implantSubType)
    {
        $implantSubType->delete();
        return redirect()->route('implantSubType.index');
    }
}
