<x-app-layout>
    <x-slot name="header">
        <div class="flex space-x-2 justify-between items-center">
            <div>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    {{ __('Editar usuario') }} - {{ $user->id }}
                </h2>
            </div>
            <div>
            </div>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg p-3">
                <form action="{{ route('user.update', $user->id) }}" method="post">
                    @method('PUT')
                    @csrf
                    <div class="col-span-6 sm:col-span-4 mt-4">
                        <x-jet-label for="roleId" value="{{ __('Rol') }}" />
                        <select name="roleId" id="roleId" class="mt-1 block w-full border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm">
                            <option value="">Sin Rol</option>
                            @foreach ($roles as $role)
                                <option value="{{$role->id}}" {{ $role->id === $user->roles()->first()?->id ? 'selected' : ''}}>{{$role->name}}</option>
                            @endforeach
                        </select>
                        <x-jet-input-error for="roleId" class="mt-2" />
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
</x-app-layout>
