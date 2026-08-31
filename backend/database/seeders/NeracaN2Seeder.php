<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\NeracaN2;
use App\Models\User;

class NeracaN2Seeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil user pertama (Admin) sebagai penginput
        $user = User::first();

        if ($user) {
            NeracaN2::create([
                'user_id'            => $user->id,
                'kantor'             => 'Kantor Pos Sidoarjo 61200',
                'tanggal'            => '2026-08-31',
                'petugas_loket'      => $user->name,
                'jumlah_penerimaan'  => 15000000.00,
                'jumlah_pengeluaran' => 12500000.00,
                'penerimaan_details' => [
                    ['keterangan' => 'Pendapatan Mile BM', 'nominal' => 5000000],
                    ['keterangan' => 'Penerimaan Loket Pospay', 'nominal' => 10000000],
                ],
                'pengeluaran_details' => [
                    ['keterangan' => 'Mile Invoice', 'nominal' => 4500000],
                    ['keterangan' => 'Pengeluaran Operasional', 'nominal' => 8000000],
                ],
            ]);
        }
    }
}
