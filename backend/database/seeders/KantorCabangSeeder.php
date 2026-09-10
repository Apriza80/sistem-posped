<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\KantorCabang;

class KantorCabangSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kantor = [
            ['kode_kantor' => '61200', 'nama_kantor' => 'Kantor Pos Sidoarjo'],
            ['kode_kantor' => '61211', 'nama_kantor' => 'KPC Waru'],
            ['kode_kantor' => '61252', 'nama_kantor' => 'KPC Porong'],
            ['kode_kantor' => '61254', 'nama_kantor' => 'KPC Krian'],
        ];

        foreach ($kantor as $item) {
            KantorCabang::firstOrCreate($item);
        }
    }
}
