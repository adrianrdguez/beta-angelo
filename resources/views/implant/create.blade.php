<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Crear implante') }}
                </h2>
            </div>
            <div>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-3">
                <form action="{{ route('implant.store') }}" method="post" enctype="multipart/form-data">
                    @method('POST')
                    @csrf
                    <!-- Name -->
                    <div class="col-span-6 sm:col-span-4">
                        <x-jet-label for="name" value="{{ __('Nombre') }}" />
                        <x-jet-input id="name" type="text" class="mt-1 block w-full" autocomplete="name" name="name" value="{{old('name')}}" />
                        <x-jet-input-error for="name" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4">
                        <x-jet-label for="model" value="{{ __('Modelo') }}" />
                        <x-jet-input id="model" type="text" class="mt-1 block w-full" autocomplete="model" name="model" value="{{old('model')}}" />
                        <x-jet-input-error for="model" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4">
                        <x-jet-label for="measureWidth" value="{{ __('Medida') }}" />
                        <x-jet-input id="measureWidth" type="text" class="mt-1 block w-full" autocomplete="measureWidth" name="measureWidth" value="{{old('measureWidth')}}" />
                        <x-jet-input-error for="measureWidth" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4">
                        <x-jet-label for="implant_type_id" value="{{ __('Tipo') }}" />
                        <select name="implant_type_id" id="implant_type_id" class="mt-1 block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm" value="{{old('implant_type_id')}}">
                            <option selected></option>
                            @foreach ($implantTypes as $implantType)
                            <option value="{{$implantType->id}}">{{$implantType->name}}</option>
                            @endforeach
                        </select>
                        <x-jet-input-error for="implant_type_id" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4">
                        <x-jet-label for="lateralViewImg" value="{{ __('Imagen desde lateral') }}" />
                        <x-jet-input id="lateralViewImg" type="file" class="mt-1 block w-full" autocomplete="lateralViewImg" name="lateralViewImg" value="{{old('lateralViewImg')}}" />
                        <x-jet-input-error for="lateralViewImg" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4">
                        <x-jet-label for="aboveViewImg" value="{{ __('Imagen desde arriba') }}" />
                        <x-jet-input id="aboveViewImg" type="file" class="mt-1 block w-full" autocomplete="aboveViewImg" name="aboveViewImg" value="{{old('aboveViewImg')}}" />
                        <x-jet-input-error for="aboveViewImg" class="mt-2" />
                    </div>
                    <x-jet-button>
                        {{ __('Save') }}
                    </x-jet-button>
                </form>
            </div>
        </div>
    </div>
</x-app-layout>
