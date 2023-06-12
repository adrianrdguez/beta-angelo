<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Tipos de implante') }}
                </h2>
            </div>
            @can('Crear tipo de implante')
                <div>
                    <a class="inline-block px-2 py-2 bg-transparent text-gray-600 font-medium text-xs leading-tight uppercase rounded hover:text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200 transition duration-150 ease-in-out"
                        href="{{ route('implantType.create') }}">
                        <span class="mr-2">
                            <i class="fa-solid fa-plus"></i>
                        </span>
                        {{ __('Crear tipo de implante') }}
                    </a>
                </div>
            @endcan
        </div>
    </x-slot>
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div>
            <form action="{{ route('implantType.index') }}" method="get">
                <div class="max-w-md mx-auto rounded-lg overflow-hidden md:max-w-xl">
                    <div class="md:flex">
                        <div class="w-full p-3">
                            <div class="relative">
                                <i class="absolute fa fa-search text-gray-400 top-5 left-4"></i>
                                <input type="text" class="bg-white h-14 w-full px-12 rounded-lg focus:outline-none hover:cursor-pointer" name="search" autofocus value="{{ $search }}" placeholder="Buscar..." autocomplete="off">
                                <button type="submit" class="absolute top-4 right-5 border-l pl-4"><i class="fa-solid fa-paper-plane text-gray-500 hover:cursor-pointer"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if ($implantTypes->count() === 0)
                <span>No hay registros.</span>
            @else
                <div class="flex flex-col">
                    <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div class="py-4 inline-block min-w-full sm:px-6 lg:px-8">
                            <div class="overflow-hidden">
                                <table class="w-full text-center">
                                    <thead class="border-b bg-gray-50">
                                        <tr>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                Id
                                            </th>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                {{ __('Name') }}
                                            </th>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                {{ __('Actions') }}
                                            </th>
                                        </tr>
                                    </thead class="border-b">
                                    <tbody>
                                        @foreach ($implantTypes as $implantType)
                                            <tr class="bg-white border-b">
                                                <td
                                                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {{ $implantType->id }}</td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    {{ $implantType->name }}
                                                </td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <div class="inline-flex shadow-md hover:shadow-lg focus:shadow-lg"
                                                        role="group">
                                                        @can('Editar tipo de implante')
                                                            <a href="{{ route('implantType.edit', $implantType->id) }}"
                                                                class="rounded-l inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-0 active:bg-blue-800 transition duration-150 ease-in-out">Editar</a>
                                                        @endcan
                                                        @can('Borrar tipo de implante')
                                                            <button type="button" data-bs-toggle="modal"
                                                                data-bs-target="#confirmation"
                                                                data-eid="{{ $implantType->id }}"
                                                                onclick="document.getElementById('delete').action = '/settings/implantType/' + this.dataset.eid"
                                                                class="delete-confirmation-button rounded-r inline-block px-6 py-2.5 bg-red-600 text-white font-medium text-xs leading-tight uppercase hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring-0 active:bg-red-800 transition duration-150 ease-in-out">Borrar</button>
                                                        @endcan
                                                    </div>
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                                <div class="mt-4">
                                    {{ $implantTypes->links('pagination::tailwind') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>
</x-app-layout>
