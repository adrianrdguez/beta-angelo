<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('implants', function (Blueprint $table) {
            $table->boolean('allowRotation')->default(true)->after('measureWidth');
            $table->boolean('allowDisplay')->default(true)->after('allowRotation');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('implants', function (Blueprint $table) {
            $table->dropColumn('allowRotation');
            $table->dropColumn('allowDisplay');
        });
    }
};
