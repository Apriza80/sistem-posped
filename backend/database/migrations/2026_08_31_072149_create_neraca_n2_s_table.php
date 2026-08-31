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
        Schema::create('neraca_n2_s', function (Blueprint $table) {
            $table->id();
            // Relasi ke tabel users (siapa petugas yang input)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Kolom Header Form
            $table->string('kantor');            // Contoh: "Kantor Pos Sidoarjo 61200"
            $table->date('tanggal');             // Tanggal laporan
            $table->string('petugas_loket');     // Nama petugas pada input form
            
            // Kolom Ringkasan Angka Uang
            $table->decimal('jumlah_penerimaan', 15, 2)->default(0);
            $table->decimal('jumlah_pengeluaran', 15, 2)->default(0);
            
            // Kolom JSON untuk rincian baris input penerimaan & pengeluaran kas
            $table->json('penerimaan_details')->nullable();
            $table->json('pengeluaran_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('neraca_n2_s');
    }
};
