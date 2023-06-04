<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Configuracion') }}
                </h2>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @can('Ver seccion implantes')
                <a href="{{ route('implant.index') }}">
                    <div class="block rounded-lg shadow-lg bg-white text-center hover:bg-gray-50">
                        <div class="p-6" style="font-size: 8em;">
                            <i class="fa-solid fa-bone"></i>
                        </div>
                        <div class="relative p-2 border-t border-gray-300" style="font-size: 2em;">
                            {{ __('Implantes') }}
                        </div>
                    </div>
                </a>
                @endcan
                @can('Ver seccion tipos de implantes')
                <a href="{{ route('implantType.index') }}">
                    <div class="block rounded-lg shadow-lg bg-white text-center hover:bg-gray-50">
                        <div class="p-6" style="font-size: 8em;">
                            <i class="fa-solid fa-tags"></i>
                        </div>
                        <div class="relative p-2 border-t border-gray-300" style="font-size: 2em;">
                            {{ __('Tipos de implantes') }}
                        </div>
                    </div>
                </a>
                @endcan
                @can('Ver seccion subtipos de implantes')
                <a href="{{ route('implantSubType.index') }}">
                    <div class="block rounded-lg shadow-lg bg-white text-center hover:bg-gray-50">
                        <div class="p-6" style="font-size: 8em;">
                            <i class="fa-solid fa-tag"></i>
                        </div>
                        <div class="relative p-2 border-t border-gray-300" style="font-size: 2em;">
                            {{ __('Subtipos de implantes') }}
                        </div>
                    </div>
                </a>
                @endcan
                @can('Ver seccion usuarios')
                <a href="{{ route('user.index') }}">
                    <div class="block rounded-lg shadow-lg bg-white text-center hover:bg-gray-50">
                        <div class="p-6" style="font-size: 8em;">
                            <i class="fa-solid fa-users"></i>
                        </div>
                        <div class="relative p-2 border-t border-gray-300" style="font-size: 2em;">
                            {{ __('Usuarios') }}
                        </div>
                    </div>
                </a>
                @endcan
                @can('Ver seccion roles')
                <a href="{{ route('role.index') }}">
                    <div class="block rounded-lg shadow-lg bg-white text-center hover:bg-gray-50">
                        <div class="p-6" style="font-size: 8em;">
                            <i class="fa-solid fa-user-doctor"></i>
                        </div>
                        <div class="relative p-2 border-t border-gray-300" style="font-size: 2em;">
                            {{ __('Roles') }}
                        </div>
                    </div>
                </a>
                @endcan
            </div>
        </div>
    </div>
</x-app-layout>
