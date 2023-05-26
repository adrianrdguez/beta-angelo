<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class AssingRoleToUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permission:assign-role {userEmail?} {roleName?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Asignar rol a un usuario';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $userEmail = $this->argument('userEmail');
        $roleName = $this->argument('roleName');
        if (!$userEmail) {
            $userEmail = $this->choice('Seleccione el usuario', User::pluck('email')->toArray());
        }
        if (!$roleName) {
            $roleName = $this->choice('Seleccione el rol', Role::pluck('name')->toArray());
        }
        $user = User::where('email', $userEmail)->first();
        if (!$user) {
            $this->error('El usuario no existe');
            return Command::FAILURE;
        }
        $role = Role::where('name', $roleName)->first();
        if (!$role) {
            $this->error('El rol no existe');
            return Command::FAILURE;
        }
        if ($user->hasRole($roleName)) {
            $this->error('El usuario ya tiene asignado el rol');
            return Command::FAILURE;
        }
        $user->syncRoles($roleName);
        $this->info('Rol asignado correctamente');
        return Command::SUCCESS;
    }
}
