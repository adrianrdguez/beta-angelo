<?php

use App\Http\Controllers\ImplantController;
use App\Http\Controllers\ImplantSubTypeController;
use App\Http\Controllers\ProjectController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/implantSubTypes', [ImplantSubTypeController::class, 'indexApi']);
Route::get('/implants', [ImplantController::class, 'indexApi']);
Route::put('/project/{project}/image/{media}', [ProjectController::class, 'updateImageApi'])->name('updateProjectImage');
Route::post('/project/{project}/image', [ProjectController::class, 'addImageApi'])->name('addProjectImageApi');
