<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NeracaN2 extends Model
{
    use HasFactory;

    protected $table = 'neraca_n2s';

    protected $fillable = [
        'user_id',
        'nama_petugas',
        'kpc_kantor',
        'tanggal',
        'jumlah_penerimaan_kas',
        'jumlah_pengeluaran_kas',
        'ringkasan',
        'pendapatan_details',
        'pengeluaran_details',
    ];
    protected function casts(): array
    {
        return [
            'tanggal'             => 'date',
            'ringkasan'           => 'array',
            'pendapatan_details'  => 'array',
            'pengeluaran_details' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
