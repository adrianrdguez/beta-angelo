<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ $project->name }}
        </h2>
    </x-slot>

    <section class="overflow-hidden text-gray-700 ">
        <div class="container px-5 py-2 mx-auto lg:pt-12 lg:px-32">
            <div class="flex flex-wrap -m-1 md:-m-2">
                <div class="flex flex-wrap w-1/3 rounded-lg shadow-xl" style="cursor: pointer" data-bs-toggle="modal"
                    data-bs-target="#addImageModal">
                    <div class="flex w-full p-1 md:p-2"
                        style="
                    flex-direction: column;
                    justify-content: space-between;">
                        <div></div>
                        <div class="flex
                        justify-center">
                            <i class="fas fa-5x fa-plus-circle"></i>
                        </div>
                        <h2 class="text-lg font-medium text-gray-900 title-font mb-2" style="text-align: center;">
                            Add new project image</h2>
                    </div>
                </div>
                @foreach ($project->getMedia('radiographies') as $image)
                    <div class="flex flex-wrap w-1/3" style="cursor: pointer">
                        <div class="w-full p-1 md:p-2">
                            <img class="block object-cover object-center w-full h-full rounded-lg"
                                src="{{ $image->getUrl('thumbnail') }}" alt="content">
                        </div>
                    </div>
                @endforeach
            </div>
            <div class="modal fade fixed top-0 left-0 hidden w-full h-full outline-none overflow-x-hidden overflow-y-auto"
                id="addImageModal" tabindex="-1" aria-labelledby="exampleModalCenterTitle" aria-modal="true"
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
                                Nombre de la imagen
                                <input type="text" name="name">
                                <x-jet-input-error for="name" class="mt-2" />
                                <input type="file" name="radiographyImg">
                                <x-jet-input-error for="radiographyImg" class="mt-2" />
                                <button type="submit"
                                    class="inline-block px-6 py-2.5 bg-purple-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-purple-700 hover:shadow-lg focus:bg-purple-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-purple-800 active:shadow-lg transition duration-150 ease-in-out">
                                    Subir
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

</x-app-layout>
