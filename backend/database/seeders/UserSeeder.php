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
        User::create([
            'name'     => 'Admin',
            'nippos'   => '991234567',
            'password' => Hash::make('password123'),
            'role'     => 'admin',
            'kantor'   => 'Kantor Pusat',
        ]);
    }
}
