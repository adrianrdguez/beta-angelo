<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ $project->name }}
                </h2>
            </div>
            <div>
                <button
                    class="inline-block px-2 py-2 bg-transparent text-gray-600 font-medium text-xs leading-tight uppercase rounded hover:text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-0 active:bg-gray-200 transition duration-150 ease-in-out"
                    data-bs-toggle="modal" data-bs-target="#addImageModal">
                    <span class="mr-2">
                        <i class="fa-solid fa-plus"></i>
                    </span>
                    {{ __('Añadir radiografía') }}
                </button>
            </div>
        </div>
    </x-slot>

    <section class="overflow-hidden text-gray-700 ">
        <div class="container px-5 py-2 mx-auto lg:pt-12 lg:px-32">
            <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                @foreach ($project->getMedia('radiographies') as $image)
                    <div class="relative">
                        <a href="{{ $image->getUrl() }}" class="absolute left-2 mt-2" download><i class="fa-solid fa-download fa-xl text-green-600"></i></a>
                        <button type="button" data-bs-toggle="modal"
                            class="absolute right-2 mt-2"
                            data-bs-target="#confirmation"
                            data-eid="{{ $project->id }}"
                            data-iid="{{ $image->id }}"
                            onclick="document.getElementById('delete').action = '/project/' + this.dataset.eid + '/image/' + this.dataset.iid">
                            <i class="fa-solid fa-xmark fa-2xl text-red-600"></i>
                        </button>
                        <a class="block flex flex-wrap w-full h-full"
                            href="{{ route('simulator', ['project' => $project, 'media' => $image]) }}">
                            <div class="rounded-lg z-50 absolute inset-x-0 -bottom-2 pt-30 text-white flex items-end">
                                <div>
                                    <div class="rounded-lg p-4 space-y-3 text-xl translate-y-0 translate-y-4 pb-10">
                                        <div class="font-bold rounded-lg bg-black/50 p-1">{{ $image->name }}</div>
                                    </div>
                                </div>
                            </div>
                            <img class="block object-cover object-center w-full h-full rounded-lg"
                                src="{{ $image->getUrl('thumbnail') }}" alt="content">
                        </a>
                    </div>
                @endforeach
            </div>
            <div class="modal fade fixed top-0 left-0 hidden w-full h-full outline-none overflow-x-hidden overflow-y-auto"
                id="addImageModal" tabindex="-1" data-bs-backdrop="static" aria-modal="true"
                role="dialog">
                <div class="modal-dialog modal-dialog-centered relative w-auto pointer-events-none">
                    <div
                        class="modal-content border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-white bg-clip-padding rounded-md outline-none text-current">
                        <div
                            class="modal-header flex flex-shrink-0 items-center justify-between p-4 border-b border-gray-200 rounded-t-md">
                            <h5 class="text-xl font-medium leading-normal text-gray-800"
                                id="exampleModalScrollableLabel">
                                Subir Imagen Nueva al Proyecto
                            </h5>
                            <button type="button"
                                class="btn-close box-content w-4 h-4 p-1 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                                data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body relative p-4">
                            <form enctype="multipart/form-data" action="{{ route('addProjectImage', $project->id) }}"
                                method="post">
                                @method('POST')
                                @csrf

                                <div class="flex items-center justify-center w-full mb-4">
                                    <label
                                        class="flex flex-col w-96 h-96 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300 relative">
                                        <div class="absolute flex flex-col w-full h-full items-center justify-center pt-7">
                                            <img id="preview" class="absolute inset-0 w-full h-full invisible">
                                            <i class="fa-solid fa-image text-6xl"></i>
                                            <p
                                                class="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                                                Sube una radiograífia</p>
                                        </div>
                                        <input type="hidden" name="rotation" id="rotation" value="0"/>
                                        <input type="file" class="absolute opacity-0" accept="image/*"
                                            name="radiographyImg" onchange="showPreview(event)" required>
                                    </label>
                                </div>

                                <div class="flex items-center justify-center mb-4">
                                    <div class="inline-flex" role="group">
                                        <button type="button" onclick="rotateLeft()"
                                            class="rounded-l px-6 py-2 border border-gray-600 text-gray-600 font-medium text-xs leading-tight uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
                                            <i class="fa-solid fa-rotate-left"></i>
                                        </button>
                                        <button type="button" onclick="rotateRight()"
                                            class="rounded-r px-6 py-2 border border-gray-600 text-gray-600 font-medium text-xs leading-tight uppercase hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
                                            <i class="fa-solid fa-rotate-right"></i>
                                        </button>
                                    </div>
                                </div>

                                <div
                                    class="modal-footer flex flex-shrink-0 items-center justify-end px-4 pt-4 border-t border-gray-200 rounded-b-md">
                                    <x-jet-input id="name" type="text" class="block w-full mr-4"
                                        autocomplete="name" name="name" placeholder="Descripción" required />
                                    <x-jet-button type="submit" class="block">
                                        {{ __('Subir') }}
                                    </x-jet-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        var rotation = 0;
        var preview = document.getElementById("preview");
        function showPreview(event) {
            if (event.target.files.length > 0) {
                let src = URL.createObjectURL(event.target.files[0]);
                let preview = document.getElementById("preview");
                preview.classList.remove('invisible');
                preview.src = src;
                preview.style.display = "block";
                rotation = 0;
            }
        }

        function rotateLeft() {
            if (!preview?.src) {
                return;
            }
            rotation = (rotation - 90) % 360;
            preview.style.transform = 'rotate(' + rotation + 'deg)';
            [preview.style.width, preview.style.height] = [preview.style.height, preview.style.width];
            document.getElementById('rotation').value = (rotation * -1);
        }

        function rotateRight() {
            if (!preview?.src) {
                return;
            }
            rotation = (rotation + 90) % 360;
            preview.style.transform = 'rotate(' + rotation + 'deg)';
            [preview.style.width, preview.style.height] = [preview.style.height, preview.style.width];
            document.getElementById('rotation').value = (rotation * -1);
        }
    </script>

</x-app-layout>
