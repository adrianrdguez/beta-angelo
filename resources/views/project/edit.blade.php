<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Editar Proyecto') }} - {{ $project->id }}
                </h2>
            </div>
            <div>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-3">
                <form action="{{ route('project.update', $project->id) }}" method="post">
                    @method('PUT')
                    @csrf
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="name" value="{{ __('Name') }}" />
                        <x-jet-input id="name" type="text" class="mt-1 block w-full" autocomplete="name" name="name" value="{{ $project->name }}"/>
                        <x-jet-input-error for="name" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="race" value="{{ __('Raza') }}" />
                        <x-jet-input id="race" type="text" class="mt-1 block w-full" autocomplete="race" name="race" value="{{ $project->race }}"/>
                        <x-jet-input-error for="race" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="weight" value="{{ __('Peso') }}" />
                        <x-jet-input id="weight" type="number" step="0.01" class="mt-1 block w-full" autocomplete="weight" name="weight" value="{{ $project->weight }}"/>
                        <x-jet-input-error for="weight" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="age" value="{{ __('Edad') }}" />
                        <x-jet-input id="age" type="number" step="0.01" class="mt-1 block w-full" autocomplete="age" name="age" value="{{ $project->age }}"/>
                        <x-jet-input-error for="age" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="description" value="{{ __('Descripcion') }}" />
                        <x-jet-input id="description" type="text" class="mt-1 block w-full" autocomplete="description" name="description" value="{{ $project->description }}"/>
                        <x-jet-input-error for="description" class="mt-2" />
                    </div>
                    <div
                        class="flex flex-shrink-0 items-center justify-end px-4 pt-4 rounded-b-md">
                        <x-jet-button>
                            {{ __('Save') }}
                        </x-jet-button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
