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
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div>
            <form action="{{ route('project.index') }}" method="get">
                <div class="max-w-md mx-auto rounded-lg overflow-hidden md:max-w-xl">
                    <div class="md:flex">
                        <div class="w-full p-3">
                            <div class="relative">
                                <i class="absolute fa fa-search text-gray-400 top-5 left-4"></i>
                                <input type="text"
                                    class="bg-white h-14 w-full px-12 rounded-lg focus:outline-none hover:cursor-pointer"
                                    name="search" autofocus value="{{ $search }}" placeholder="Buscar..."
                                    autocomplete="off">
                                <button type="submit" class="absolute top-4 right-5 border-l pl-4"><i
                                        class="fa-solid fa-paper-plane text-gray-500 hover:cursor-pointer"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if ($projects->count() === 0)
                <span>No hay registros.</span>
            @else
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    @foreach ($projects as $project)
                        <div class="block rounded-lg shadow-lg bg-white max-w-sm text-center hover:bg-gray-50">
                            <a href="{{ route('project.show', $project->id) }}">
                                <div class="py-3 px-6 border-b border-gray-300 font-bold rounded-t-lg capitalize">
                                    {{ $project->name }}
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
                                                <span class="text-gray-600">{{ $project->weight }} kg</span>
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
                            </a>
                            <div class="flex space-x-2 justify-evenly items-center border-t border-gray-300 p-2">
                                @can('Compartir proyecto')
                                    <button type="button" data-bs-toggle="modal" data-bs-target="#shareModal"
                                        data-eid="{{ $project->id }}"
                                        onclick="document.getElementById('share').action = '/project/' + this.dataset.eid + '/share';console.log(document.getElementById('share'))">
                                        <i class="fa-solid fa-share-nodes"></i>
                                    </button>
                                @endcan
                                <a href="{{ route('project.edit', $project->id) }}">
                                    <i class="fa-solid fa-pencil"></i>
                                </a>
                                <button type="button" data-bs-toggle="modal" data-bs-target="#confirmation"
                                    data-eid="{{ $project->id }}"
                                    onclick="document.getElementById('delete').action = '/project/' + this.dataset.eid">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    @endforeach
                </div>
                <div class="mt-4">
                    {{ $projects->links('pagination::tailwind') }}
                </div>
            @endif
        </div>
    </div>
    @can('Compartir proyecto')
        <div class="modal fade fixed top-0 left-0 hidden w-full h-full outline-none overflow-x-hidden overflow-y-auto"
            id="shareModal" tabindex="-1" aria-modal="true" role="dialog">
            <div class="modal-dialog modal-dialog-centered relative w-auto pointer-events-none">
                <div
                    class="modal-content border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-white bg-clip-padding rounded-md outline-none text-current">
                    <div
                        class="modal-header flex flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md">
                        <h5 class="text-xl font-medium leading-normal text-gray-800">
                            Compartir proyecto
                        </h5>
                        <button type="button"
                            class="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                            data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form action="#" method="post" id="share">
                        @csrf
                        <div class="modal-body relative p-4">
                            <div class="mb-4 rounded-lg bg-red-100 px-6 py-5 text-base text-red-700" role="alert">
                                El proyecto se comparte en su totalidad, incluyendo la posibilidad de editar y eliminar.
                            </div>
                            @if (Auth::user()->hasRole('admin'))
                                <div>
                                    <x-jet-label for="userEmail"
                                        value="{{ __('Escribe el email del usuario al que quieres compartir el proyecto.') }}" />
                                    <x-jet-input id="userEmail" class="block mt-1 w-full" type="email" name="userEmail"
                                        :value="old('userEmail')" required autocomplete="userEmail" />
                                </div>
                            @else
                                {{ __('Se va a compartir el proyecto con los administradores') }}
                                <x-jet-input id="userEmail" type="hidden" name="userEmail" value="admin@admin.com"
                                    required />
                            @endif
                        </div>
                        <div
                            class="modal-footer flex flex-shrink-0 flex-wrap items-center justify-end p-4 border-t border-gray-200 rounded-b-md">
                            <button type="button"
                                class="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                                data-bs-dismiss="modal">
                                {{ __('Cancel') }}
                            </button>
                            <button type="submit"
                                class="inline-block px-6 py-2.5 bg-gray-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-gray-700 hover:shadow-lg focus:bg-gray-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg transition duration-150 ease-in-out ml-1">
                                Compartir
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endcan

</x-app-layout>
