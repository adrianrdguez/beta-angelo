<?php

use App\Http\Controllers\ImplantController;
use App\Http\Controllers\ImplantTypeController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified'
])->group(function () {
    Route::get('/', function () {
        return redirect(route('project.index'));
    });
    Route::get('/project', function () {
        return view('project');
    })->name('project');
    Route::resource('/project', ProjectController::class);
    Route::resource('/implant', ImplantController::class);
    Route::resource('/implantType', ImplantTypeController::class);
    Route::post('/project/{project}/image', [ProjectController::class, 'addImage'])->name('addProjectImage');
    Route::delete('/project/{project}/image/{media}', [ProjectController::class, 'removeImage'])->name('removeProjectImage');
    Route::get('/project/{project}/image/{media}', [ProjectController::class, 'simulator'])->name('simulator');
});
