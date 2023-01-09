<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the Implant "deleting" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function deleting(User $user)
    {
        $user->projects()->each(function ($project) {
            $project->delete();
        });
    }

    /**
     * Handle the User "forceDeleted" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function forceDeleted(User $user)
    {
        $user->projects()->withTrashed()->each(function ($project) {
            $project->forceDelete();
        });
    }
}
