<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Editar tipo de implante') }} - {{ $implantType->id }}
                </h2>
            </div>
            <div>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-3">
                <form action="{{ route('implantType.update', $implantType->id) }}" method="post">
                    @method('PUT')
                    @csrf
                    <!-- Name -->
                    <div class="col-span-6 sm:col-span-4">
                        <x-jet-label for="name" value="{{ __('Nombre') }}" />
                        <x-jet-input id="name" type="text" class="mt-1 block w-full" autocomplete="name" name="name" value="{{ $implantType->name }}"/>
                        <x-jet-input-error for="name" class="mt-2" />
                    </div>
                    <x-jet-button>
                        {{ __('Save') }}
                    </x-jet-button>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
