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
        Schema::create('order_perangkos', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('kantor_pos');
            $table->string('petugas');
            $table->decimal('nominal_perangko');
            $table->integer('jumlah_keping');
            $table->decimal('total_nilai', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_perangkos');
    }
};
