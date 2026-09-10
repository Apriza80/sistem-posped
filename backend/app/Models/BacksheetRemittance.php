<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BacksheetRemittance extends Model
{
    use HasFactory;

    protected $fillable = [

        'tanggal',
        'nama_file',
        'file_path',
        'kantor_pos',
        'tipe_file',
    ];
}
