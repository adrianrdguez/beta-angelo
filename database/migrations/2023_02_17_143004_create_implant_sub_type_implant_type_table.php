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
            $table->dropConstrainedForeignId('implant_sub_type_id');
        });
        Schema::create('implant_sub_type_implant_type', function (Blueprint $table) {
            $table->foreignId('implant_sub_type_id')->constrained('implant_sub_types')->cascadeOnDelete();
            $table->foreignId('implant_type_id')->constrained('implant_types')->cascadeOnDelete();
        });
        Schema::table('implants', function (Blueprint $table) {
            $table->foreignId('implant_sub_type_id')->after('implant_type_id')->constrained('implant_sub_types')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('implant_sub_type_implant_type');
        Schema::table('implant_types', function (Blueprint $table) {
            $table->foreignId('implant_sub_type_id')->constrained('implant_sub_types')->cascadeOnDelete();
        });
        Schema::table('implants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('implant_sub_type_id');
        });
    }
};
