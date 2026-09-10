<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NeracaN2;
use App\Models\User;

class NeracaN2Seeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        if ($user) {
            NeracaN2::create([
                'user_id'                => $user->id,
                'nama_petugas'           => 'Cece Zia',
                'kpc_kantor'             => 'Kantor Pos Sidoarjo 61200',
                'tanggal'                => '2026-08-31',
                'jumlah_penerimaan_kas'  => 57500000.00,
                'jumlah_pengeluaran_kas' => 57500000.00,
                'ringkasan'              => [
                    'jumlah_penerimaan'            => 21500000.00,
                    'jumlah_panjar_kasir'          => 30000000.00,
                    'saldo_ditahan_kemarin_all'    => 6000000.00,
                    'jumlah_pengeluaran_transaksi' => 30800000.00,
                    'jumlah_setoran_loket'         => 15500000.00,
                    'saldo_hari_ini_all'           => 4500000.00,
                ],
                'pendapatan_details' => [
                    ['nama_rekening' => 'PENDAPATAN MILE BM', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'PENDAPATAN MILE OL', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'PENDAPATAN MILE OM', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'PENDAPATAN WESELPOS ALL', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'RAK-AW REMITANCE ALL', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'RAK-AW POSPAY BM', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'RAK-AW POSPAY OL', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'PRANGKO', 'satuan' => 'Lbr', 'besar_uang' => 500000],
                    ['nama_rekening' => 'PEMBELIAN METERAI', 'satuan' => 'Kep', 'besar_uang' => 1000000],
                ],
                'pengeluaran_details' => [
                    ['nama_rekening' => 'MILE INVOICE', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'MILE LPU', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'PENARIKAN WESEL', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'PENARIKAN POSPAY', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'PENARIKAN BTN', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'QRISS', 'satuan' => '', 'besar_uang' => 0],
                    ['nama_rekening' => 'PENARIKAN PENSIUN', 'satuan' => 'Trx', 'besar_uang' => 8000000],
                    ['nama_rekening' => 'PENARIKAN BANSOS', 'satuan' => 'Trx', 'besar_uang' => 12000000],
                ],
            ]);
        }
    }
}