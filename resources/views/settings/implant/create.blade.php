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
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="name" value="{{ __('Name') }}" />
                        <x-jet-input id="name" type="text" class="mt-1 block w-full" autocomplete="name" name="name" value="{{old('name')}}" />
                        <x-jet-input-error for="name" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="model" value="{{ __('Modelo') }}" />
                        <x-jet-input id="model" type="text" class="mt-1 block w-full" autocomplete="model" name="model" value="{{old('model')}}" />
                        <x-jet-input-error for="model" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="measureWidth" value="{{ __('Medida') }}" />
                        <x-jet-input id="measureWidth" type="text" class="mt-1 block w-full" autocomplete="measureWidth" name="measureWidth" value="{{old('measureWidth')}}" />
                        <x-jet-input-error for="measureWidth" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="implant_type_id" value="{{ __('Tipo') }}" />
                        <select name="implant_type_id" id="implant_type_id" class="mt-1 block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm" value="{{old('implant_type_id')}}">
                            <option selected></option>
                            @foreach ($implantTypes as $implantType)
                            <option value="{{$implantType->id}}">{{$implantType->name}}</option>
                            @endforeach
                        </select>
                        <x-jet-input-error for="implant_type_id" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="implant_sub_type_id" value="{{ __('Subtipo') }}" />
                        <select name="implant_sub_type_id" id="implant_sub_type_id" class="mt-1 block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm" value="{{old('implant_sub_type_id')}}">
                            <option selected></option>
                        </select>
                        <x-jet-input-error for="implant_sub_type_id" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <label for="allowRotation" class="flex items-center cursor-pointer">
                            <div class="relative">
                                <input id="allowRotation" name="allowRotation" type="checkbox" value="1" class="sr-only"/>
                                <div class="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                                <div class="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"></div>
                            </div>
                            <div class="ml-3 text-gray-700 font-medium">{{ __('Permitir rotación') }}</div>
                        </label>
                        <x-jet-input-error for="allowRotation" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <label for="allowDisplay" class="flex items-center cursor-pointer">
                            <div class="relative">
                                <input id="allowDisplay" name="allowDisplay" type="checkbox" value="1" class="sr-only"/>
                                <div class="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
                                <div class="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"></div>
                            </div>
                            <div class="ml-3 text-gray-700 font-medium">{{ __('Mostrar para todos los usuarios') }}</div>
                        </label>
                        <x-jet-input-error for="allowDisplay" class="mt-2" />
                    </div>
                    <div class="col-span-6 sm:col-span-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center justify-center w-full mb-4">
                            <div>
                                <div class="text-center mb-2 text-gray-700 font-medium">
                                    {{ __('Imagen desde lateral') }}
                                    <button type="button"
                                        onclick="clearPreview('lateralViewImg')">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                <label
                                    class="flex flex-col w-96 h-96 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300 relative">
                                    <div
                                        class="absolute flex flex-col w-full h-full items-center justify-center">
                                        <img alt="" id="lateralViewImgPreview" class="absolute inset-0 w-full h-full invisible object-contain">
                                        <i id="lateralViewImgIcon" class="fa-solid fa-image text-6xl"></i>
                                    </div>
                                    <input type="file" id="lateralViewImgInput" class="absolute opacity-0" accept="image/*"
                                        name="lateralViewImg" onchange="showPreview(event, 'lateralViewImg')">
                                </label>
                            </div>
                        </div>
                        <div class="flex items-center justify-center w-full mb-4">
                            <div>
                                <div class="text-center mb-2 text-gray-700 font-medium">
                                    {{ __('Imagen desde arriba') }}
                                    <button type="button"
                                        onclick="clearPreview('aboveViewImg')">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                                <label
                                    class="flex flex-col w-96 h-96 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300 relative">
                                    <div
                                        class="absolute flex flex-col w-full h-full items-center justify-center">
                                        <img alt="" id="aboveViewImgPreview" class="absolute inset-0 w-full h-full invisible object-contain">
                                        <i id="aboveViewImgIcon" class="fa-solid fa-image text-6xl"></i>
                                    </div>
                                    <input type="file" id="aboveViewImgInput" class="absolute opacity-0" accept="image/*"
                                        name="aboveViewImg" onchange="showPreview(event, 'aboveViewImg')">
                                </label>
                            </div>
                        </div>
                        <x-jet-input-error for="lateralViewImg" class="text-center" />
                        <x-jet-input-error for="aboveViewImg" class="text-center" />
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
    <script>
        function showPreview(event, id) {
            if (event.target.files.length > 0) {
                let src = URL.createObjectURL(event.target.files[0]);
                let preview = document.getElementById(id + 'Preview');
                preview.classList.remove('invisible');
                preview.classList.remove('absolute');
                preview.src = src;
                preview.style.display = "block";
                document.getElementById(id + 'Icon').classList.add('hidden');
            }
        }
        function clearPreview(id) {
            let preview = document.getElementById(id + 'Preview');
            preview.classList.add('invisible');
            preview.classList.add('absolute');
            preview.src = '';
            preview.style.display = "none";
            document.getElementById(id + 'Icon').classList.remove('hidden');
            document.getElementById(id + 'Input').value = null;
        }
        function listImplantSubTypes(selectInput, implant_type_id, implant_sub_type_id = null) {
            fetch(`/api/implantSubTypes?implant_type_id=${implant_type_id}`)
                .then(response => response.json())
                .then(result => {
                    if (Array.isArray(result.data) && result?.success !== false) {
                        let select = document.getElementById(selectInput);
                        select.innerHTML = '';
                        result.data.forEach(implantSubType => {
                            select.innerHTML += `
                            <option value="${implantSubType.id}" ${implant_sub_type_id === implantSubType.id ? 'selected' : ''}>${implantSubType.name}</option>
                            `;
                        })
                    }
                }).catch(error => console.log('error', error));
        }
        document.getElementById('implant_type_id').addEventListener('change', (e) => listImplantSubTypes('implant_sub_type_id', e.target.value));
    </script>
</x-app-layout>
