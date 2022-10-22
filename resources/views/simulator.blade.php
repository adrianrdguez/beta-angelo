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

<body>
    <!-- Canvas -->
    <canvas id="simulator" data-img="img/radiografia.png"></canvas>

    <!-- Menu contextual -->
    <div id="menu-1" class="menu">
        <div class="menu-li" id="remove-btn">
            <i class="fa-solid fa-trash"></i> Borrar elemento
        </div>
    </div>

    <!-- Posicionamiento de los botones -->
    <div class="botones-flotantes">
        <button class="btn btn-success rounded-circle" data-bs-toggle="offcanvas" data-bs-target="#opciones"
            aria-controls="opciones">
            <i class="fa-solid fa-gear"></i>
        </button>
        <button id="boton-herramientas" class="btn btn-success rounded-circle" data-bs-toggle="offcanvas"
            data-bs-target="#herramientas" aria-controls="herramientas">
            <i class="fa-solid fa-toolbox"></i>
        </button>
    </div>

    <!-- Sidebar de herramientas -->
    <div class="offcanvas offcanvas-end" tabindex="-1" id="herramientas" data-bs-scroll="true" data-bs-backdrop="false"
        aria-labelledby="herramientasLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="herramientasLabel"><b>HERRAMIENTAS</b></h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="row m-3">
                <button id="drag" class="btn btn-outline-success"><i class="fa-solid fa-up-down-left-right"></i>
                    Mover</button>
            </div>
            <div class="row m-3">
                <button id="rule" class="btn btn-outline-success"><i class="fa-solid fa-ruler"></i> Medir</button>
            </div>
            <div class="row m-3">
                <button id="free-draw" class="btn btn-outline-success"><i class="fa-solid fa-paintbrush"></i>
                    Dibujar</button>
            </div>
            <div class="row m-3">
                <button id="rule-circle" class="btn btn-outline-success"><i class="fa-solid fa-ruler-vertical"></i><i
                        class="fa-regular fa-circle"> </i> Nuevo círculo</button>
            </div>
            <div class="row m-3">
                <button id="rule-triangle" class="btn btn-outline-success"><i class="fa-solid fa-ruler-vertical"> </i><i
                        class="fa-solid fa-circle-nodes"></i> Nuevo triángulo</button>
            </div>
            <div class="row m-3">
                <button id="free-cut" class="btn btn-outline-success"><i class="fa-solid fa-scissors"></i>
                    Cortar</button>
            </div>
        </div>
    </div>

    <!-- Sidebar de opciones de la herramienta -->
    <div class="offcanvas offcanvas-start active" tabindex="-1" id="opciones" data-bs-scroll="true"
        data-bs-backdrop="false" aria-labelledby="opcionesLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="opcionesLabel"><b>OPCIONES</b></h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="row m-3">
                <input type="checkbox" class="btn-check" id="blackandwhite" autocomplete="off">
                <label class="btn btn-outline-success" for="blackandwhite">Blanco y negro</label>
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
                Añadir Medida
                <input id="measure-form" type="text" class="measure" placeholder="Milímetros">
            </div>
            <div class="row m-3">
                <button id="reset-filters" class="btn btn-success">Reiniciar filtros</button>
            </div>
        </div>
    </div>

</body>

</html>
