<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderPerangko extends Model
{
    use HasFactory;

    protected $table = 'order_perangkos';

    protected $fillable = [
        'tanggal',
        'kantor_pos',
        'petugas',
        'nominal_perangko',
        'jumlah_keping',
        'total_nilai',
    ];
}