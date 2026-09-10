<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BacksheetKurlog extends Model
{
    use HasFactory;

    protected $fillable = [

        'tanggal',
        'jenis_pembayaran',
        'nama_file',
        'file_path',
        'kantor_pos',
        'tipe_file',

    ];

}
