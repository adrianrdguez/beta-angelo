<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="stylesheet" href="https://fonts.bunny.net/css2?family=Nunito:wght@400;600;700&display=swap">

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body>
        <div class="w-screen bg-gray-100 flex items-center justify-center px-5 py-5 absolute hidden" id="cookieBanner" x-data="{showCookieBanner:true}">
            <section class="w-full p-5 lg:px-24 absolute top-0 bg-gray-600" x-show="showCookieBanner">
                <div class="md:flex items-center -mx-3">
                    <div class="md:flex-1 px-3 lg:px-36 2xl:px-96 mb-5 md:mb-0">
                        <p class="text-center md:text-left text-white text-xs leading-tight md:pr-12">Este portal web únicamente utiliza cookies propias con finalidad técnica, no recaba ni cede datos de carácter personal de los usuarios sin su conocimiento, sin embargo, contiene enlaces a sitios web de terceros con políticas de privacidad ajenas a la de la AEPD que usted podrá decidir si acepta o no cuando acceda a ellos.</p>
                    </div>
                    <div class="px-3 text-center">
                        <button id="btn" @click.prevent="document.cookie = 'cookieAccepted=true';showCookieBanner=!showCookieBanner;" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring focus:ring-gray-300 disabled:opacity-25 transition">{{ _('Entendido') }}</button>
                    </div>
                </div>
            </section>
        </div>
        <div class="font-sans text-gray-900 antialiased">
            {{ $slot }}
        </div>
    </body>
    <script>
        if (document.cookie.includes('cookieAccepted=')) {
            document.getElementById('cookieBanner').classList.add('hidden');
        } else {
            document.getElementById('cookieBanner').classList.remove('hidden');
        }
    </script>
</html>
