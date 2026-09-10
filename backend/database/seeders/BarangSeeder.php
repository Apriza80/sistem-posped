<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Barang;

class BarangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $barangs = [

            ['nama_barang' => 'Karbon Mile', 'satuan' => 'Pcs'],
            ['nama_barang' => 'Bollpoint Standart', 'satuan' => 'Pcs'],
            ['nama_barang' => 'Seal Plastik', 'satuan' => 'Pcs'],
            ['nama_barang' => 'Kertas Buram', 'satuan' => 'Rim'],
            ['nama_barang' => 'Resi Thermal Pospay', 'satuan' => 'Pcs'],
        ];

        foreach ($barangs as $barang) {
            Barang::create($barang);
        }
    }
}
