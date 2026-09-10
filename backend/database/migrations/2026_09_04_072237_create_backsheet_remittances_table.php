<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('backsheet_remittances', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('nama_file');
            $table->string('file_path');
            $table->string('kantor_pos');
            $table->string('tipe_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backsheet_remittances');
    }
};
