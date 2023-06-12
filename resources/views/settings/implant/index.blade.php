<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Implantes') }}
                </h2>
            </div>
            @can('Crear implante')
                <div>
                    <a class="inline-block px-2 py-2 bg-transparent text-gray-600 font-medium text-xs leading-tight uppercase rounded hover:text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200 transition duration-150 ease-in-out"
                        href="{{ route('implant.create') }}">
                        <span class="mr-2">
                            <i class="fa-solid fa-plus"></i>
                        </span>
                        {{ __('Crear implante') }}
                    </a>
                </div>
            @endcan
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if ($implants->count() === 0)
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
                                                {{ __('Modelo') }}
                                            </th>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                {{ __('Medida') }}
                                            </th>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                {{ __('Tipo de implante') }}
                                            </th>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                {{ __('Subtipo de implante') }}
                                            </th>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                {{ __('Imagen desde lateral') }}
                                            </th>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                {{ __('Imagen desde arriba') }}
                                            </th>
                                            <th scope="col" class="text-sm font-medium text-gray-900 px-6 py-4">
                                                {{ __('Actions') }}
                                            </th>
                                        </tr>
                                    </thead class="border-b">
                                    <tbody>
                                        @foreach ($implants as $implant)
                                            <tr class="bg-white border-b">
                                                <td
                                                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {{ $implant->id }}</td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    {{ $implant->name }}
                                                </td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    {{ $implant->model }}
                                                </td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    {{ $implant->measureWidth }}
                                                </td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    {{ $implant->implantType->name }}
                                                </td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    {{ $implant->implantSubType->name }}
                                                </td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <img class="w-20"
                                                        src="{{ $implant->getFirstMedia('lateralView') ? $implant->getFirstMedia('lateralView')->getUrl('thumbnail') : ' ' }}"
                                                        alt="">
                                                </td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <img class="w-20"
                                                        src="{{ $implant->getFirstMedia('aboveView') ? $implant->getFirstMedia('aboveView')->getUrl('thumbnail') : ' ' }}"
                                                        alt="">
                                                </td>
                                                <td
                                                    class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <div class="inline-flex shadow-md hover:shadow-lg focus:shadow-lg"
                                                        role="group">
                                                        @can('Editar implante')
                                                            <a href="{{ route('implant.edit', $implant->id) }}"
                                                                class="rounded-l inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-0 active:bg-blue-800 transition duration-150 ease-in-out">Editar</a>
                                                        @endcan
                                                        @can('Borrar implante')
                                                            <button type="button" data-bs-toggle="modal"
                                                                data-bs-target="#confirmation"
                                                                data-eid="{{ $implant->id }}"
                                                                onclick="document.getElementById('delete').action = '/settings/implant/' + this.dataset.eid"
                                                                class="delete-confirmation-button rounded-r inline-block px-6 py-2.5 bg-red-600 text-white font-medium text-xs leading-tight uppercase hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring-0 active:bg-red-800 transition duration-150 ease-in-out">Borrar</button>
                                                        @endcan
                                                    </div>
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                                <div class="mt-4">
                                    {{ $implants->links('pagination::tailwind') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @endif
        </div>
    </div>
</x-app-layout>