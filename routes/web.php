<?php

use App\Http\Controllers\ImplantController;
use App\Http\Controllers\ImplantSubTypeController;
use App\Http\Controllers\ImplantTypeController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingsController;
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
    Route::resource('/project', ProjectController::class);
    Route::post('/project/{project}/image', [ProjectController::class, 'addImage'])->name('addProjectImage');
    Route::get('/project/{project}/image/{media}', [ProjectController::class, 'simulator'])->name('simulator');
    Route::delete('/project/{project}/image/{media}', [ProjectController::class, 'removeImage'])->name('removeProjectImage');
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::resource('/settings/user', UserController::class);
    Route::resource('/settings/role', RoleController::class);
    Route::resource('/settings/implant', ImplantController::class);
    Route::resource('/settings/implantType', ImplantTypeController::class);
    Route::resource('/settings/implantSubType', ImplantSubTypeController::class);
});
