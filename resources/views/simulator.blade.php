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
    @vite(['resources/js/bootstrap.bundle.min.js', 'resources/js/fontAwesome.2accd57d6d.js', 'resources/js/simulator.js', 'resources/js/app.js', 'resources/css/bootstrap.min.css', 'resources/css/app.css'])
</head>

<body data-projectid="{{ $project->id }}" data-mediaid="{{ $media->id }}" id="body">
    <!-- Canvas -->
    <canvas id="simulator" data-img="{{ $media->getUrl() }}"
        data-firstlinemeasurepx="{{ $media->getCustomProperty('firstLineMeasurePx') }}"
        data-firstlinemeasuremm="{{ $media->getCustomProperty('firstLineMeasureMm') }}">
    </canvas>

    <!-- Posicionamiento de los botones -->
    <div class="botones-flotantes">
        <button class="btn btn-warning rounded-circle" data-bs-toggle="offcanvas" data-bs-target="#opciones"
            aria-controls="opciones">
            <i class="fa-solid fa-gear"></i>
        </button>
        <button class="btn btn-warning rounded-circle" data-bs-toggle="offcanvas" data-bs-target="#implants"
            aria-controls="implants">
            <i class="fa-solid fa-bone"></i>
        </button>
        <button class="btn btn-warning rounded-circle" data-bs-toggle="offcanvas" data-bs-target="#herramientas"
            aria-controls="herramientas">
            <i class="fa-solid fa-toolbox"></i>
        </button>
    </div>

    <!-- Input de las Medidas -->
    <div class="wrapper">
        <div class="input-data">
            <input id="measure-input" type="text" class="measure-input">
            <label>Medida</label>
        </div>
    </div>

    <!-- Sidebar de herramientas -->
    <div class="offcanvas offcanvas-end" tabindex="-1" id="herramientas" data-bs-scroll="true" data-bs-backdrop="false"
        aria-labelledby="herramientasLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="herramientasLabel"><b>HERRAMIENTAS</b></h5>
            <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas"
                aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="row m-3">
                <button id="drag" class="btn btn-outline-warning"><i class="fa-solid fa-up-down-left-right"></i>
                    Mover</button>
            </div>
            <div class="row m-3">
                <button id="rule" class="btn btn-outline-warning"><i class="fa-solid fa-ruler"></i> Medir</button>
            </div>
            <div class="row m-3">
                <button id="free-draw" class="btn btn-outline-warning"><i class="fa-solid fa-paintbrush"></i>
                    Dibujar</button>
            </div>
            <div class="row m-3">
                <button id="rule-circle" class="btn btn-outline-warning"><i class="fa-solid fa-ruler-vertical"></i><i
                        class="fa-regular fa-circle"> </i> Nuevo círculo</button>
            </div>
            <div class="row m-3">
                <button id="rule-triangle" class="btn btn-outline-warning"><i class="fa-solid fa-ruler-vertical"> </i><i
                        class="fa-solid fa-circle-nodes"></i> Nuevo triángulo</button>
            </div>
            <div class="row m-3">
                <button id="triangle-cut" class="btn btn-outline-warning"><i class="fa-solid fa-scissors"></i><i
                        class="fa-solid fa-circle-nodes"></i> Nuevo corte triangular</button>
            </div>
            <div class="row m-3">
                <button id="free-cut" class="btn btn-outline-warning"><i class="fa-solid fa-scissors"></i>
                    Cortar</button>
            </div>
        </div>
    </div>

    <!-- Sidebar de opciones de la herramienta -->
    <div class="offcanvas offcanvas-start" tabindex="-1" id="opciones" data-bs-scroll="true" data-bs-backdrop="false"
        aria-labelledby="opcionesLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="opcionesLabel"><b>OPCIONES</b></h5>
            <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas"
                aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="row m-3">
                <input type="checkbox" class="btn-check" id="blackandwhite" autocomplete="off">
                <label class="btn btn-outline-warning" for="blackandwhite">Blanco y negro</label>
            </div>
            <div class="row m-3 p-3">
                <label for="customRange1" class="form-label">Tamaño del pincel</label>
                <input type="range" id="pincelsize" class="form-range custom-range" value="1" min="0"
                    max="10" step="0.1">
            </div>
            <div class="row">
                <div class="col-md mt-2">
                    <div class="custom-container">
                        <label for="pincelcolor">Color</label>
                        <input type="color" value="#FF0000" id="pincelcolor" />
                    </div>
                </div>
                <div class="col-md iluminacion-rangos">
                    <div class="form-group">
                        <label for="formControlRange">Iluminación</label>
                        <input type="range" id="brightness" class="form-range custom-range" value="0"
                            min="-1" max="1" step="0.003921">
                    </div>
                    <div class="form-group">
                        <label for="formControlRange">Contraste</label>
                        <input type="range" id="contrast" class="form-range custom-range" value="0"
                            min="-1" max="1" step="0.003921">
                    </div>
                </div>
            </div>
            <div class="row m-3">
                <button id="reset-filters" class="btn btn-warning">Reiniciar filtros</button>
            </div>
        </div>
    </div>

    <div class="offcanvas offcanvas-bottom h-100" tabindex="-1" id="implants" data-bs-scroll="false"
        data-bs-backdrop="false">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="implantsLabel"><b>IMPLANTES</b></h5>
            <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas"
                aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <select class="form-select mb-4" id="implant-type-selector">
                @foreach ($implantTypes as $implantType)
                    <option value="{{ $implantType->id }}"
                        {{ $implantTypes->first()->id === $implantType->id ? 'selected' : '' }}>{{ $implantType->name }}
                    </option>
                @endforeach
            </select>
            <div class="row row-cols-1 row-cols-md-4 g-4" id="implant-cards">
            </div>
        </div>
    </div>

    <div class="offcanvas offcanvas-bottom h-48 w-50" tabindex="-1" id="implant-settings" data-bs-scroll="false"
        data-bs-backdrop="false" style="margin: auto">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="opcionesLabel"><b>OPCIONES DEL IMPLANTE</b></h5>
            <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas"
                aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="row">
                <div class="col-md iluminacion-rangos">
                    <div class="form-group">
                        <label for="formControlRange">Iluminación</label>
                        <input type="range" id="brightness" class="form-range custom-range" value="0"
                            min="-1" max="1" step="0.003921">
                    </div>
                    <div class="form-group">
                        <label for="formControlRange">Contraste</label>
                        <input type="range" id="contrast" class="form-range custom-range" value="0"
                            min="-1" max="1" step="0.003921">
                    </div>
                </div>
            </div>
            <div class="row m-3">
                <button id="reset-filters" class="btn btn-warning">Rotar</button>
            </div>
            <div class="row m-3">
                <button id="reset-filters" class="btn btn-warning">Reiniciar filtros</button>
            </div>
        </div>
    </div>

</body>

</html>
