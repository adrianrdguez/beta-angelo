<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Simulador</title>

    <!-- Fonts -->
    <link rel="stylesheet" href="https://fonts.bunny.net/css2?family=Nunito:wght@400;600;700&display=swap">

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js', 'node_modules/tw-elements/dist/js/index.min.js', 'resources/js/simulator.js'])
</head>

<body data-userid="{{ $user->id }}" data-projectid="{{ $project->id }}" data-mediaid="{{ $media->id }}"
    id="body" class="bg-neutral-800">
    <!-- Canvas -->
    <canvas id="simulator" data-img="{{ $media->getUrl() }}" {{-- data-json="{{ $media->getCustomProperty('canvasJson') }}" --}} data-name="{{ $media->name }}"
        data-firstlinemeasurepx="{{ $media->getCustomProperty('firstLineMeasurePx') }}"
        data-firstlinemeasuremm="{{ $media->getCustomProperty('firstLineMeasureMm') }}">
    </canvas>

    <!-- Posicionamiento de los botones -->
    <div class="fixed absolute left-1/2 top-10 -translate-x-1/2 -translate-y-1/2" id="botones-flotantes">
        <button id="button-offcanvas-opciones" type="button" title="Opciones del simulador"
            class="inline-block rounded-full bg-yellow-500 text-black leading-normal uppercase shadow-md hover:bg-yellow-700 hover:shadow-lg focus:bg-yellow-700 focus:shadow-lg focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-10 h-10">
            <i class="fa-solid fa-gear" title="Opciones del simulador"></i>
        </button>
        <button id="button-offcanvas-implants" type="button" title="Implantes"
            class="inline-block rounded-full bg-yellow-500 text-black leading-normal uppercase shadow-md hover:bg-yellow-700 hover:shadow-lg focus:bg-yellow-700 focus:shadow-lg focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-10 h-10">
            <i class="fa-solid fa-bone" title="Implantes"></i>
        </button>
        <button id="button-offcanvas-herramientas" type="button" title="Herramientas"
            class="inline-block rounded-full bg-yellow-500 text-black leading-normal uppercase shadow-md hover:bg-yellow-700 hover:shadow-lg focus:bg-yellow-700 focus:shadow-lg focus:outline-none focus:ring-0 transition duration-150 ease-in-out w-10 h-10">
            <i class="fa-solid fa-toolbox" title="Herramientas"></i>
        </button>
    </div>

    <!-- Sidebar de offcanvas-herramientas -->

    <div id="offcanvas-herramientas"
        class="offcanvas offcanvas-end fixed bottom-0 flex flex-col max-w-full bg-slate-800 invisible bg-clip-padding shadow-sm outline-none transition duration-300 ease-in-out text-white top-0 right-0 border-none w-96"
        tabindex="-1" aria-labelledby="offcanvas-herramientasLabel">
        <div class="offcanvas-header flex items-center justify-between p-4">
            <h5 class="offcanvas-title mb-0 leading-normal font-semibold" id="offcanvas-herramientasLabel">HERRAMIENTAS
            </h5>
            <button type="button"
                class="btn-close btn-close-white box-content w-4 h-4 p-2 -my-5 -mr-2 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                aria-label="Close"></button>
        </div>
        <div class="offcanvas-body flex-grow p-4 overflow-y-auto">
            <div class="mb-4 w-full">
                <button id="drag"
                    class="w-full select-none text-left cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold hover:bg-yellow-500 hover:text-black">
                    <i class="fa-solid fa-up-down-left-right"></i>
                    Mover
                </button>
            </div>
            <div class="mb-4 w-full">
                <button id="free-draw"
                    class="w-full select-none text-left cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold hover:bg-yellow-500 hover:text-black">
                    <i class="fa-solid fa-paintbrush"></i>
                    Dibujar</button>
            </div>
            <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700">
            <div class="mb-4 w-full">
                <button id="rule"
                    class="w-full select-none text-left cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold hover:bg-yellow-500 hover:text-black">
                    <i class="fa-solid fa-ruler"></i> Medir</button>
            </div>
            <div class="mb-4 w-full">
                <button id="rule-circle"
                    class="w-full select-none text-left cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold hover:bg-yellow-500 hover:text-black">
                    <i class="fa-solid fa-ruler-vertical"></i>
                    <i class="fa-regular fa-circle"> </i>
                    Nuevo círculo</button>
            </div>
            <div class="mb-4 w-full">
                <button id="rule-triangle"
                    class="w-full select-none text-left cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold hover:bg-yellow-500 hover:text-black">
                    <i class="fa-solid fa-ruler-vertical"> </i>
                    <i class="fa-solid fa-circle-nodes"></i> Nuevo triángulo</button>
            </div>
            <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700">
            <div class="mb-4 w-full">
                <button id="free-cut"
                    class="w-full select-none text-left cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold hover:bg-yellow-500 hover:text-black">
                    <i class="fa-solid fa-scissors"></i>
                    Cortar</button>
            </div>
            <div class="mb-4 w-full">
                <button id="circle-cut"
                    class="w-full select-none text-left cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold hover:bg-yellow-500 hover:text-black">
                    <i class="fa-solid fa-scissors"></i>
                    <i class="fa-regular fa-circle"></i>
                    Nuevo corte circular</button>
            </div>
            <div class="mb-4 w-full">
                <button id="triangle-cut"
                    class="w-full select-none text-left cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold hover:bg-yellow-500 hover:text-black">
                    <i class="fa-solid fa-scissors"></i>
                    <i class="fa-solid fa-circle-nodes"></i>
                    Nuevo corte triangular</button>
            </div>
        </div>
    </div>

    <div id="offcanvas-opciones"
        class="offcanvas offcanvas-start fixed bottom-0 flex flex-col max-w-full bg-slate-800 invisible bg-clip-padding shadow-sm outline-none transition duration-300 ease-in-out text-white top-0 left-0 border-none w-96"
        tabindex="-1" aria-labelledby="offcanvas-opcionesLabel">
        <div class="offcanvas-header flex items-center justify-between p-4">
            <h5 class="offcanvas-title mb-0 leading-normal font-semibold" id="offcanvas-opcionesLabel">HERRAMIENTAS
            </h5>
            <button type="button"
                class="btn-close btn-close-white box-content w-4 h-4 p-2 -my-5 -mr-2 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"
                aria-label="Close"></button>
        </div>
        <div class="offcanvas-body flex-grow p-4 overflow-y-auto">
            <div class="w-full mb-4">
                <label for="pincelsize">Tamaño del pincel</label>
                <input type="range" id="pincelsize" value="1" min="0" max="10" step="0.1"
                    class="form-range appearance-none w-full h-6 p-0 bg-transparent focus:outline-none focus:ring-0 focus:shadow-none">
            </div>
            <div class="w-full mb-4">
                <label for="pincelcolor">Color</label>
                <input type="color" value="#FF0000" id="pincelcolor" class="w-full h-6 p-0 focus:shadow-none" />
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="w-full">
                    <button id="undo-drawing"
                        class="w-full select-none cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold bg-yellow-500 text-black">Deshacer
                        dibujo</button>
                </div>
                <div class="w-full">
                    <button id="clear-drawing"
                        class="w-full select-none cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold bg-yellow-500 text-black">Borrar
                        dibujo</button>
                </div>
            </div>
            <hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700">
            <div class="flex w-full mb-4">
                <input type="checkbox" id="blackandwhite" autocomplete="off" class="peer hidden">
                <label for="blackandwhite"
                    class="w-full select-none cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold transition-colors duration-200 ease-in-out peer-checked:bg-yellow-500 peer-checked:text-black text-center">Blanco
                    y negro</label>
            </div>
            <div class="w-full mb-4">
                <label for="brightness">Iluminación</label>
                <input type="range" id="brightness" value="0" min="-1" max="1" step="0.003921"
                    class="form-range appearance-none w-full h-6 p-0 bg-transparent focus:outline-none focus:ring-0 focus:shadow-none">
            </div>
            <div class="w-full mb-4">
                <label for="contrast">Contraste</label>
                <input type="range" id="contrast" value="0" min="-1" max="1" step="0.003921"
                    class="form-range appearance-none w-full h-6 p-0 bg-transparent focus:outline-none focus:ring-0 focus:shadow-none">
            </div>
            <div class="w-full mb-4">
                <button id="reset-filters"
                    class="w-full select-none cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold bg-yellow-500 text-black">Reiniciar
                    filtros</button>
            </div>
        </div>
        <div class="p-4">
            <div class="w-full">
                <button id="save-exit"
                    class="w-full select-none cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold bg-yellow-500 text-black">Guardar
                    Y Salir</button>
            </div>
        </div>
    </div>

    <div id="offcanvas-implants"
        class="offcanvas offcanvas-end fixed bottom-0 flex flex-col max-w-full bg-slate-800 invisible bg-clip-padding shadow-sm outline-none transition duration-300 ease-in-out text-white top-0 right-0 border-none w-96"
        tabindex="-1" aria-labelledby="offcanvas-implantsLabel">
        <div class="offcanvas-header flex items-center justify-between p-4">
            <h5 class="offcanvas-title mb-0 leading-normal font-semibold" id="offcanvas-implantsLabel">IMPLANTES</h5>
            <button type="button"
                class="btn-close btn-close-white box-content w-4 h-4 p-2 -my-5 -mr-2 text-black border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-black hover:opacity-75 hover:no-underline"aria-label="Close"></button>
        </div>
        <div class="offcanvas-body flex-grow p-4 overflow-y-auto small">
            <select class="mb-4 w-full text-black" id="implant-type-selector" autocomplete="off">
                <option selected disabled hidden>Selecciona un tipo</option>
                @foreach ($implantTypes as $implantType)
                    <option value="{{ $implantType->id }}">{{ $implantType->name }}</option>
                @endforeach
            </select>
            <select class="mb-4 w-full text-black" id="implant-sub-type-selector" autocomplete="off">
            </select>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4"
                id="implants">
                <div class="block rounded-lg shadow-lg bg-white max-w-sm text-center invisible">
                    <div class="py-3 px-6 border-b border-gray-300">
                        <h5 style="color: black;">Sin implantes</h5>
                    </div>
                    <div class="p-6 h-40">
                    </div>
                    <div class="py-3 px-6 border-t border-gray-300 text-gray-600">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="offcanvas-implants-settings"
        class="offcanvas offcanvas-bottom fixed bottom-0 flex flex-col w-full sm:w-8/12 md:w-6/12 lg:w-4/12 mx-auto my-0 bg-slate-800 invisible bg-clip-padding shadow-sm outline-none transition duration-300 ease-in-out text-white left-0 right-0 border-none h-3/12 max-h-full"
        tabindex="-1" aria-labelledby="offcanvas-implants-settingsLabel">
        <div class="offcanvas-header flex items-center justify-between p-4">
            <h5 class="offcanvas-title mb-0 leading-normal font-semibold" id="offcanvas-implants-settingsLabel">
                OPCIONES DEL
                IMPLANTE</h5>
        </div>
        <div class="offcanvas-body flex-grow p-4 overflow-y-auto small">
            <div class="w-full mb-4">
                <label for="opacity">Transparencia</label>
                <input type="range" id="opacity" value="1" min="0" max="1" step="0.003921"
                    class="form-range appearance-none w-full h-6 p-0 bg-transparent focus:outline-none focus:ring-0 focus:shadow-none">
            </div>
            <div class="w-full mb-4">
                <button id="rotate-implant"
                    class="w-full select-none cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold bg-yellow-500 text-black">Rotar</button>
            </div>
        </div>
    </div>

    <div id="offcanvas-tool-settings"
        class="offcanvas offcanvas-bottom fixed bottom-0 flex flex-col w-full sm:w-8/12 md:w-6/12 lg:w-4/12 mx-auto my-0 bg-slate-800 invisible bg-clip-padding shadow-sm outline-none transition duration-300 ease-in-out text-white left-0 right-0 border-none h-3/12 max-h-full overflow-hidden"
        tabindex="-1" aria-labelledby="offcanvas-tool-settingsLabel">
        <div class="offcanvas-header flex items-center justify-between p-4">
            <h5 class="offcanvas-title mb-0 leading-normal font-semibold" id="offcanvas-tool-settingsLabel">
                OPCIONES DE LA HERRAMIENTA</h5>
        </div>
        <div class="offcanvas-body flex-grow p-4 overflow-hidden small">
            <div class="w-full mb-4">
                <label for="radius-input">Radio</label>
                <div class="relative w-11/12 mx-auto my-0">
                    <input id="radius-input" type="range"
                        class="form-range appearance-none w-full h-6 p-0 bg-transparent focus:outline-none focus:ring-0 focus:shadow-none"
                        value="5" min="0" max="7" step="1" />
                    <div
                        class="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                        <div id="radius-input-value"
                            class="bg-yellow-500 text-sm text-black rounded-full w-12 h-8 flex items-center justify-center shadow-md absolute border border-black">
                        </div>
                    </div>
                </div>
            </div>
            <div class="w-full mb-4">
                <label for="angle-input">Angulo</label>
                <div class="relative w-11/12 mx-auto my-0">
                    <input id="angle-input" type="range"
                        class="form-range appearance-none w-full h-6 p-0 bg-transparent focus:outline-none focus:ring-0 focus:shadow-none"
                        value="180" min="1" max="359" step="1" />
                    <div
                        class="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                        <div id="angle-input-value"
                            class="bg-yellow-500 text-sm text-black rounded-full w-10 h-8 flex items-center justify-center shadow-md absolute border border-black">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="offcanvas-initial-settings"
        class="offcanvas offcanvas-bottom fixed bottom-0 flex flex-col w-full sm:w-8/12 md:w-6/12 lg:w-4/12 mx-auto my-0 bg-slate-800 invisible bg-clip-padding shadow-sm outline-none transition duration-300 ease-in-out text-white left-0 right-0 border-none h-3/12 max-h-full"
        tabindex="-1" aria-labelledby="offcanvas-initial-settingsLabel">
        <div class="offcanvas-header flex items-center justify-between p-4">
            <h5 class="offcanvas-title mb-0 leading-normal font-semibold" id="offcanvas-initial-settingsLabel">
                OPCIONES INICIALES</h5>
        </div>
        <div class="offcanvas-body flex-grow p-4 overflow-y-auto small">
            <label for="measure-input">Medida</label>
            <div class="flex items-stretch py-2 w-full">
                <input id="measure-input" autofocus pattern="^[0-9]+\.[0-9]+$"
                    class="form-range appearance-none w-full p-0 pl-2 focus:outline-none focus:ring-0 focus:shadow-none mr-2 text-black"
                    type="number">
                <button id="measure-input-button"
                    class="select-none cursor-pointer rounded-lg border-2 border-yellow-500 py-2 px-4 font-bold bg-yellow-500 text-black"
                    type="button">
                    Confirmar
                </button>
            </div>
        </div>
    </div>

</body>

</html>
