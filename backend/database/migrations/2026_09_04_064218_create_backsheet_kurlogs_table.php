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
        Schema::create('backsheet_kurlogs', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('jenis_pembayaran'); // ubah dari date ke string
            $table->string('nama_file');        // ubah dari date ke string
            $table->string('file_path');        // ubah dari date ke string
            $table->string('kantor_pos');       // ubah dari date ke string
            $table->string('tipe_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backsheet_kurlogs');
    }
};
