<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Usuarios y Roles') }}
                </h2>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @can('Ver usuarios')
                <a href="{{ route('user.index') }}">
                    <div class="block rounded-lg shadow-lg bg-white text-center hover:bg-gray-50">
                        <div class="p-6 h-96" style="font-size: 15em;">
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <div class="relative p-2 border-t border-gray-300" style="font-size: 4em;">
                            Usuarios
                        </div>
                    </div>
                </a>
                @endcan
                @can('Ver roles')
                <a href="{{ route('role.index') }}">
                    <div class="block rounded-lg shadow-lg bg-white text-center hover:bg-gray-50">
                        <div class="p-6 h-96" style="font-size: 15em;">
                            <i class="fa-solid fa-user-doctor"></i>
                        </div>
                        <div class="relative p-2 border-t border-gray-300" style="font-size: 4em;">
                            Roles
                        </div>
                    </div>
                </a>
                @endcan

            </div>
        </div>
    </div>
</x-app-layout>
