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
        Schema::create('neraca_n2s', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Sesuai form atas
            $table->string('nama_petugas'); // Input: "NAMA"
            $table->string('kpc_kantor');   // Input: "KPC / KANTOR"
            $table->date('tanggal');        // Input: "TANGGAL"
            
            // Angka total kas utama di bagian bawah (Rp 57.500.000)
            $table->decimal('jumlah_penerimaan_kas', 15, 2)->default(0);
            $table->decimal('jumlah_pengeluaran_kas', 15, 2)->default(0);
            
            // Sub-total ringkasan (panjar kasir, saldo ditahan kemarin/hari ini, dll)
            $table->json('ringkasan')->nullable();
            
            // Seluruh baris tabel PENDAPATAN & PENGELUARAN (termasuk rekening tambahan)
            $table->json('pendapatan_details')->nullable();
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
