<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BacksheetCoreGiro extends Model
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
