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
        Schema::table('implant_types', function (Blueprint $table) {
            $table->foreignId('implant_sub_type_id')->constrained('implant_sub_types')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('implant_types', function (Blueprint $table) {
            $table->dropForeign(['implant_sub_type_id']);
            $table->dropColumn('implant_sub_type_id');
        });
    }
};
