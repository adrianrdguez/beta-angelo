<div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
    <div>
        {{ $logo }}
    </div>

    <div class="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
        {{ $slot }}
    </div>

    <div class="flex-grow"></div>

    <div class="w-full bg-white py-6 px-6 sm:rounded-lg mt-8 mx-6">
        <div class="flex justify-center items-center">
            <div class="flex flex-col items-center">
                <img src="{{ asset('img/gobierno2.jpg') }}" alt="Image 1" class="w-44 h-20 mb-2">
            </div>
            <div class="flex flex-col items-center" style="padding-left: 50px; padding-right: 50px;">
                <img src="{{ asset('img/gobierno1.png') }}" alt="Image 2" class="w-60 h-16 mb-2">
            </div>
            <div class="flex flex-col items-center">
                <img src="{{ asset('img/gobierno3.jpeg') }}" alt="Image 3" class="w-60 h-16 mb-2">
            </div>
        </div>

        <div class="text-center mt-4" style="padding-left: 200px; padding-right: 200px;">
            <p class="text-gray-600 md:text-sm">Proyecto “Desarrollo de nuevos implantes ortopédicos
                veterinarios para el
                tratamiento quirúrgico de patologías de la cadera y la rodilla” cofinanciado por el programa de
                subvenciones a empresas de alta tecnología e intensivas en conocimiento en áreas prioritarias de la RIS3
                (EATIC 2022), cofinanciado por el Fondo Europeo de Desarrollo Regional (FEDER)</p>
        </div>
    </div>
</div>
