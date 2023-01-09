<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Proyectos') }}
                </h2>
            </div>
            <div>
                <a class="inline-block px-2 py-2 bg-transparent text-gray-600 font-medium text-xs leading-tight uppercase rounded hover:text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200 transition duration-150 ease-in-out"
                    href="{{ route('project.create') }}">
                    <span class="mr-2">
                        <i class="fa-solid fa-plus"></i>
                    </span>
                    {{ __('Crear Proyecto') }}
                </a>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if ($projects->count() === 0)
                <span>No hay registros.</span>
            @else
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    @foreach ($projects as $project)
                        <a href="{{ route('project.show', $project->id) }}">
                            <div class="block rounded-lg shadow-lg bg-white max-w-sm text-center hover:bg-gray-50">
                                <div class="py-3 px-6 border-b border-gray-300 font-bold rounded-t-lg capitalize">
                                    {{ $project->id }} - {{ $project->name }}
                                </div>
                                <div class="p-6">
                                    <p class="text-gray-600 text-base mb-4 h-12">
                                        @if (!empty($project->description))
                                            {{ str_split($project->description, 50)[0] }}
                                            @if (strlen($project->description) > 50)
                                                ...
                                            @endif
                                        @else
                                            No se ha proporcionado una descripcion.
                                        @endif
                                    </p>
                                </div>
                                <ul class="relative p-2 border-t border-gray-300">
                                    <li class="relative">
                                        <span
                                            class="flex items-center text-sm px-6 overflow-hidden text-gray-700 text-ellipsis whitespace-nowrap">
                                            <span class="mr-2"><i class="fa-solid fa-paw"></i></span>
                                            @if (!empty($project->race))
                                                <span class="text-gray-600 capitalize">{{ $project->race }}</span>
                                            @else
                                                No especificado.
                                            @endif
                                        </span>
                                    </li>
                                    <li class="relative">
                                        <span
                                            class="flex items-center text-sm px-6 overflow-hidden text-gray-700 text-ellipsis whitespace-nowrap">
                                            <span class="mr-2"><i class="fa-solid fa-weight-scale"></i></span>
                                            @if (!empty($project->weight))
                                                <span class="text-gray-600">{{ $project->weight }} g</span>
                                            @else
                                                No especificado.
                                            @endif
                                        </span>
                                    </li>
                                    <li class="relative">
                                        <span
                                            class="flex items-center text-sm px-6 overflow-hidden text-gray-700 text-ellipsis whitespace-nowrap">
                                            <span class="mr-3"><i class="fa-solid fa-hourglass"></i></span>
                                            @if (!empty($project->age))
                                                <span class="text-gray-600">{{ $project->age }} años</span>
                                            @else
                                                No especificado.
                                            @endif
                                        </span>
                                    </li>
                                    <li class="relative">
                                        <span
                                            class="flex items-center text-sm px-6 overflow-hidden text-gray-700 text-ellipsis whitespace-nowrap">
                                            <span class="mr-2"><i class="fa-solid fa-calendar"></i></i></span>
                                            @if (!empty($project->created_at))
                                                <span class="text-gray-600">{{ $project->created_at }}</span>
                                            @else
                                                No especificado.
                                            @endif
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </a>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
</x-app-layout>
