<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Fungsi untuk memproses login
    public function login(Request $request)
    {
        // 1. Validasi input dari frontend
        $request->validate([
            'nippos'   => 'required|string',
            'password' => 'required|string',
        ]);

        // 2. Cari user berdasarkan NIPPOS
        $user = User::where('nippos', $request->nippos)->first();

        // 3. Cek apakah user ada dan passwordnya sesuai
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'NIPPOS atau password salah.'
            ], 401);
        }

        // 4. Buat token Sanctum jika data valid
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Kembalikan response JSON ke frontend
        return response()->json([
            'status'  => 'success',
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => [
                'id'     => $user->id,
                'name'   => $user->name,
                'nippos' => $user->nippos,
                'role'   => $user->role,
                'kantor' => $user->kantor,
            ]
        ], 200);
    }

    // Fungsi untuk memproses logout
    public function logout(Request $request)
    {
        // Menghapus token yang sedang aktif
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Logout berhasil'
        ], 200);
    }
}