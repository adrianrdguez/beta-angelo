<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddProjectImageRequest;
use App\Http\Requests\AddProjectImageRequestApi;
use App\Http\Requests\ShareProjectRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectImageRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Implant;
use App\Models\ImplantType;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $projectId = $request->input('project_id');
        $search = $request->input('search');

        $query = Auth::user()->projects();

        if ($projectId) {
            $project = $query->find($projectId);
            return view('project.show', ['project' => $project]);
        }

        $projects = $query->when($search, function ($query, $search) {
            return $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('race', 'like', '%' . $search . '%')
                    ->orWhere('created_at', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        })
            ->paginate()
            ->withQueryString();

        return view('project.index', ['projects' => $projects, 'search' => $search]);
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

    public function shareProject(ShareProjectRequest $request, Project $project)
    {
        if ($request->userEmail === 'admin@admin.com') {
            $users = User::role(['admin'])->get();
        } else {
            $users = User::where('email', $request->userEmail)->get();
        }
        session()->flash('toastMessage', 'No se ha encontrado ningún usuario con ese email');
        session()->flash('toastColor', 'red');
        if ($users->isNotEmpty()) {
            foreach ($users as $user) {
                $user->projects()->syncWithoutDetaching($project->id);
            }
            session()->flash('toastMessage', 'Proyecto compartido correctamente');
            session()->flash('toastColor', 'green');
        }
        return redirect()->route('project.index');
    }

    public function addImage(AddProjectImageRequest $request, Project $project)
    {
        if ($request->hasFile('radiographyImg') && $request->file('radiographyImg')->isValid()) {
            $project->addMedia($this->getRotatedImg($request->radiographyImg, $request->rotation))
                ->usingName($request->name)
                ->withCustomProperties([
                    'rotation' => $request->rotation
                ])
                ->toMediaCollection('radiographies');
        }
        return redirect()->route('project.show', $project->id);
    }

    public function addImageApi(AddProjectImageRequestApi $request, Project $project)
    {
        if ($request->hasFile('radiographyImg') && $request->file('radiographyImg')->isValid()) {
            $images = $project->getMedia('radiographies')->where('name', $request->name);
            $project->addMedia($this->addUsedImplantsToImg($request->radiographyImg, $request->implants))
                ->usingName($request->name . ' - V' . $images->count() + 1)
                ->withCustomProperties([
                    'rotation' => $request->rotation,
                    'firstLineMeasurePx' => $images->first()->getCustomProperty('firstLineMeasurePx'),
                    'firstLineMeasureMm' => $images->first()->getCustomProperty('firstLineMeasureMm'),
                ])
                ->toMediaCollection('radiographies');
        }
        return response()->json([], 201);
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
        return view('simulator', ['user' => Auth::user(), 'project' => $project, 'media' => $media, 'implantTypes' => ImplantType::all()]);
    }

    private function getRotatedImg(UploadedFile $file, int $rotation): UploadedFile
    {
        $image = match ($file->getMimeType()) {
            'image/jpg', 'image/jpeg' => imagecreatefromjpeg($file->getPathname()),
            'image/png' => imagecreatefrompng($file->getPathname()),
            default => $file,
        };
        if ($image === $file) {
            return $file;
        }
        $img = imagerotate($image, $rotation, imageColorAllocateAlpha($image, 0, 0, 0, 127));
        match ($file->getMimeType()) {
            'image/jpg', 'image/jpeg' => imagejpeg($img, $file->getPathname()),
            'image/png' => imagepng($img, $file->getPathname()),
            default => $file,
        };
        return $file;
    }

    private function addUsedImplantsToImg(UploadedFile $file, ?array $implants): UploadedFile
    {
        if (empty($implants)) {
            return $file;
        }
        $implants = collect($implants)->map(function ($implantId) {
            return ['id' => $implantId];
        });
        $image = match ($file->getMimeType()) {
            'image/jpg', 'image/jpeg' => imagecreatefromjpeg($file->getPathname()),
            'image/png' => imagecreatefrompng($file->getPathname()),
            default => $file,
        };
        $width = imagesx($image);
        $height = imagesy($image);
        $newImage = imagecreatetruecolor($width, $height + (40 * $implants->unique()->count()));
        $white = imagecolorallocate($newImage, 255, 255, 255);
        imagefill($newImage, 0, 0, $white);
        imagecopy($newImage, $image, 0, 0, 0, 0, $width, $height);
        $black = imagecolorallocate($newImage, 0, 0, 0);
        $font = storage_path('fonts/Nunito.ttf');
        $fontSize = 20;
        foreach ($implants->unique() as $implantData) {
            $implant = Implant::find($implantData['id']);
            $text = $implants->where('id', $implantData['id'])->count() . 'x | ' . $implant->name . ' - ' . $implant->model;
            imagettftext($newImage, $fontSize, 0, 10, $height + 30, $black, $font, $text);
            $height += 40;
        }
        imagejpeg($newImage, $file->getPathname());
        imagedestroy($image);
        imagedestroy($newImage);
        return $file;
    }
}
