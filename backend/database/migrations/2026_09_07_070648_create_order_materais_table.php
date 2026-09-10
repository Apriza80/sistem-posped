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
        Schema::create('order_materais', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('sesi_order', 50);          // Misal: Order Pagi, Order Sore
            $table->string('kantor_pos');              // Dari user login
            $table->string('petugas');                 // Nama user login
            $table->decimal('nominal_meterai', 15, 2); // Nilai nominal per keping (misal: 10000)
            $table->integer('jumlah_keping');          // Jumlah keping
            $table->decimal('total_nilai', 15, 2);     // nominal * jumlah_keping
            $table->string('status')->default('Order');// Order, Dikirim, Selesai
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_materais');
    }
};
