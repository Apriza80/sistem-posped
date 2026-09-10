<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderPkb extends Model
{

    use HasFactory;
    protected $table = 'order_pkbs';

    protected $fillable = [

        'tanggal',
        'kantor_pos',
        'petugas',
        'nopol',
        'nama_pemilik',
        'no_bayar',
        'status',
        'keterangan',
    ];

}
