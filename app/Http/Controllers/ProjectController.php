<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddProjectImageRequest;
use App\Http\Requests\DeleteProjectImageRequest;
use App\Http\Requests\SimulatorProjectImageRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectImageRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

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
        return view('project.index', ['project' => $projects]);
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
        return $this->index();
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
        return $this->index();
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
        return $this->index();
    }

    public function addImage(AddProjectImageRequest $request, Project $project)
    {
        if ($request->hasFile('radiographyImg') && $request->file('radiographyImg')->isValid()) {
            $project->addMediaFromRequest('radiographyImg')
                ->usingName($request->name)
                // ->withCustomProperties($request->validated())
                ->toMediaCollection('radiographies');
        }
        return $this->index();
    }

    public function updateImageApi(UpdateProjectImageRequest $request, Project $project)
    {
        $media = $project->getMedia('radiographies')
            ->firstWhere('id', $request->radiographyId);
        foreach ($request->validated() as $key => $value) {
            $media->setCustomProperty($key, $value);
        }
        return response('', 204)->json();
    }

    public function removeImage(DeleteProjectImageRequest $request, Project $project)
    {
        $project->getMedia('radiographies')
            ->firstWhere('id', $request->radiographyId)
            ->delete();
        return $this->index();
    }

    public function simulator(SimulatorProjectImageRequest $request, Project $project)
    {
        $media = $project->getMedia('radiographies')
            ->firstWhere('id', $request->radiographyId);
        return view('simulator', ['media' => $media]);
    }
}
