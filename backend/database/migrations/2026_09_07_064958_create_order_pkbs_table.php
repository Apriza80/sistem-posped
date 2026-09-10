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
        Schema::create('order_pkbs', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('kantor_pos');
            $table->string('petugas');
            $table->string('nopol', 30);
            $table->string('nama_pemilik');
            $table->string('no_bayar', 100);
            $table->string('status')->default('Order'); // Default status: Order
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_pkbs');
    }
};
