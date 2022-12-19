<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddProjectImageRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectImageRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\ImplantType;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $projects = Auth::user()->projects()->paginate();
        return view('project.index', ['projects' => $projects]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('project.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreProjectRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreProjectRequest $request)
    {
        $project = new Project();
        $project->fill($request->validated());
        $project->save();
        Auth::user()->projects()->attach($project->id);
        return redirect()->route('project.index');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\Response
     */
    public function show(Project $project)
    {
        return view('project.show', ['project' => $project]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\Response
     */
    public function edit(Project $project)
    {
        return view('project.edit', ['project' => $project]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateProjectRequest  $request
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->fill($request->validated());
        $project->save();
        return redirect()->route('project.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Project  $project
     * @return \Illuminate\Http\Response
     */
    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->route('project.index');
    }

    public function addImage(AddProjectImageRequest $request, Project $project)
    {
        if ($request->hasFile('radiographyImg') && $request->file('radiographyImg')->isValid()) {
            $project->addMediaFromRequest('radiographyImg')
                ->usingName($request->name)
                // ->withCustomProperties($request->validated())
                ->toMediaCollection('radiographies');
        }
        return redirect()->route('project.show', $project->id);
    }

    public function updateImageApi(UpdateProjectImageRequest $request, Project $project, Media $media)
    {
        foreach ($request->validated() as $key => $value) {
            $media->setCustomProperty($key, $value);
        }
        $media->save();
        return response()->json([], 204);
    }

    public function removeImage(Project $project, Media $media)
    {
        $media->delete();
        return redirect()->route('project.show', $project->id);
    }

    public function simulator(Project $project, Media $media)
    {
        return view('simulator', ['project' => $project, 'media' => $media, 'implantTypes' => ImplantType::all()]);
    }
}
