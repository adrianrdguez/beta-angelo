<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $users = User::when($request->search, function ($query, $search) {
            $query->where('name', 'like', '%' . $search . '%');
            $query->orWhere('email', 'like', '%' . $search . '%');
            return $query;
        })
            ->paginate()
            ->withQueryString();
        return view('settings.user.index', ['users' => $users, 'search' => $request->search]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function edit(User $user)
    {
        return view('settings.user.edit', ['user' => $user, 'roles' => Role::where('name', '!=', 'admin')->get()]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\updateuser  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $user->syncRoles($request->validated()['roleId']);
        $user->fill($request->validated());
        $user->save();
        return redirect()->route('user.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('user.index');
    }
}
