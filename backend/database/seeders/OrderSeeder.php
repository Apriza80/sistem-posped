<?php

namespace Database\Seeders;
use App\Models\Order;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Order::create([
            'jenis_order' => 'Order Meterai',
            'kantor'      => 'Kantor Bandung',
            'status'      => 'Diterima',
        ]);

        Order::create([
            'jenis_order' => 'Order Cetak PKB',
            'kantor'      => 'Kantor Surabaya',
            'status'      => 'Diproses',
        ]);

        Order::create([
            'jenis_order' => 'Order Perangko',
            'kantor'      => 'Kantor Medan',
            'status'      => 'Diterima',
        ]);
    }
}
