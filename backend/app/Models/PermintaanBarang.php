<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermintaanBarang extends Model
{
    use HasFactory;

    protected $table = 'permintaan_barangs';

    protected $fillable = [
        'tanggal',
        'nama_kantor',
        'petugas',
        'nama_barang',
        'jumlah',
        'satuan',
        'status',
        'keterangan',
    ];
}