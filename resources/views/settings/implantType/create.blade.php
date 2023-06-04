<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Crear tipo de implante') }}
                </h2>
            </div>
            <div>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-3">
                <form action="{{ route('implantType.store') }}" method="post" id="form">
                    @method('POST')
                    @csrf
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="name" value="{{ __('Name') }}" />
                        <x-jet-input id="name" type="text" class="mt-1 block w-full" autocomplete="name" name="name" value="{{ old('name') }}" />
                        <x-jet-input-error for="name" class="mt-2" />
                    </div>

                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="implant_subtypes" value="{{ __('Subtipos de implante') }}" />
                        <select multiple id="implant_subtypes" class="border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full mt-4">
                            @foreach ($implantSubTypes as $implantSubType)
                            <option class="text-sm relative text-[#999] pl-7 pr-2 py-2 before:content-[''] before:absolute before:h-[18px] before:w-[18px] before:border before:z-[1] before:m-auto before:rounded-sm before:border-solid before:border-[#ccc] before:left-0 before:inset-y-0 checked:after:content-[attr(title)] checked:after:text-[black] checked:after:absolute checked:after:w-full checked:after:h-full checked:after:pl-7 checked:after:pr-2 checked:after:py-2 checked:after:border-[none] checked:after:left-0 checked:after:top-0 checked:after:bg-white checked:before:bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMC42MSA4LjQ4Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6IzNlODhmYTt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPkFzc2V0IDg8L3RpdGxlPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9IkxheWVyIDIiPjxnIGlkPSJfMSIgZGF0YS1uYW1lPSIxIj48cmVjdCBjbGFzcz0iY2xzLTEiIHg9Ii0wLjAzIiB5PSI1LjAxIiB3aWR0aD0iNSIgaGVpZ2h0PSIyIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0Ljk3IDAuMDEpIHJvdGF0ZSg0NSkiLz48cmVjdCBjbGFzcz0iY2xzLTEiIHg9IjUuMzYiIHk9Ii0wLjc2IiB3aWR0aD0iMiIgaGVpZ2h0PSIxMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNC44NiAtMy4yNikgcm90YXRlKDQ1KSIvPjwvZz48L2c+PC9zdmc+)] checked:before:bg-[10px] checked:before:bg-no-repeat checked:before:bg-center checked:before:border-[blue]" value="{{ $implantSubType->id }}" title="{{ $implantSubType->name }}">{{ $implantSubType->name }}</option>
                            @endforeach
                        </select>
                        <x-jet-input-error for="implant_subtypes" class="mt-2" />
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
        document.querySelectorAll('option').forEach((option) => {
            option.addEventListener('mousedown', (e) => {
                e.preventDefault();
                let originalScrollTop = option.parentElement.scrollTop;
                if (option.selected) {
                    option.removeAttribute('selected');
                } else {
                    option.setAttribute('selected', true);
                }
                option.parentElement.focus();
                setTimeout(function() {
                    option.parentElement.scrollTop = originalScrollTop;
                }, 0);
            })
        });
        var form = document.getElementById('form');
        form.addEventListener('submit', (e) => {
            document.querySelectorAll('option').forEach((option) => {
                if (option.selected) {
                    let input = document.createElement('input');
                    input.setAttribute('name', 'implant_subtypes[]');
                    input.setAttribute('value', option.value);
                    input.setAttribute('type', 'hidden')
                    form.appendChild(input);
                }
            })
            form.submit();
        });
    </script>
</x-app-layout>
