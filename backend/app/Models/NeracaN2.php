<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NeracaN2 extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'kantor',
        'tanggal',
        'petugas_loket',
        'jumlah_penerimaan',
        'jumlah_pengeluaran',
        'penerimaan_details',
        'pengeluaran_details',
    ];

    // 2. Konversi tipe data otomatis (Casting)
    protected function casts(): array
    {
        return [
            'tanggal'             => 'date',
            'penerimaan_details'  => 'array',
            'pengeluaran_details' => 'array',
        ];
    }

    // 3. Relasi ke Model User (Tabel Users)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
