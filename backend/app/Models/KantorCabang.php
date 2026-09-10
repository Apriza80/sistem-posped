<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class KantorCabang extends Model
{
    use HasFactory;

    protected $table = 'kantor_cabangs';

    protected $fillable = [
        'kode_kantor',
        'nama_kantor',
    ];
}
