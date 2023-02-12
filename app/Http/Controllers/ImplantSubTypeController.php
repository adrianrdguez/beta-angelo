<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ImplantSubType;

class ImplantSubTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('implantSubType.index', ['implantSubTypes' => ImplantSubType::paginate(25)]);
    }
}
