<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderMaterai extends Model
{
    use HasFactory;

    protected $table = 'order_materais';

    protected $fillable = [
        'tanggal',
        'sesi_order',
        'kantor_pos',
        'petugas',
        'nominal_meterai',
        'jumlah_keping',
        'total_nilai',
        'status',
        'keterangan',
    ];
}