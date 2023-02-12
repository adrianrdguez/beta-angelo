<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Implantes') }}
                </h2>
            </div>
            <div>
                <a class="inline-block px-2 py-2 bg-transparent text-gray-600 font-medium text-xs leading-tight uppercase rounded hover:text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200 transition duration-150 ease-in-out"
                    href="{{ route('implant.create') }}">
                    <span class="mr-2">
                        <i class="fa-solid fa-plus"></i>
                    </span>
                    {{ __('Crear implante') }}
                </a>
            </div>
        </div>
    </x-slot>
</x-app-layout>
