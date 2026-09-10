<?php

namespace Database\Seeders;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name'     => 'Super Administrator',
                'nippos'   => '9990001',
                'password' => Hash::make('password123'),
                'role'     => 'superadmin',
                'kantor'   => 'Kantor Pos KC Sidoarjo 61200',
            ],
            [
                'name'     => 'Admin Verifikator',
                'nippos'   => '9990002',
                'password' => Hash::make('password123'),
                'role'     => 'admin',
                'kantor'   => 'Kantor Pos KC Sidoarjo 61200',
            ],
            [
                'name'     => 'Petugas Loket',
                'nippos'   => '9990003',
                'password' => Hash::make('password123'),
                'role'     => 'petugas',
                'kantor'   => 'Kantor Pos KPC Porong 61274',
            ],
            [
                'name'     => 'Petugas Samsat',
                'nippos'   => '9990004',
                'password' => Hash::make('password123'),
                'role'     => 'samsat',
                'kantor'   => 'Layanan Samsat Corner',
            ],
        ];
        
        foreach ($users as $user) {
            User::create($user);
        }
    }
}
