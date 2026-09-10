<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // 1. Tampilkan semua data user di tabel
    public function index()
    {
        $users = User::select('id', 'name', 'nippos', 'role', 'kantor')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $users,
        ], 200);
    }

    // 2. Simpan user baru (tombol hijau Simpan)
    public function store(Request $request)
    {
        // Frontend mengirim input 'username', kita petakan ke kolom 'nippos'
        $nippos = $request->username ?? $request->nippos;

        $validator = Validator::make(array_merge($request->all(), ['nippos' => $nippos]), [
            'name'     => 'required|string|max:255',
            'nippos'   => 'required|string|unique:users,nippos|max:50',
            'password' => 'required|min:6',
            'role'     => 'required|in:superadmin,admin,petugas,samsat,agen pos',
            'kantor'   => 'required|string|max:255',
        ], [
            'name.required'     => 'Nama Petugas wajib diisi.',
            'nippos.required'   => 'Username / NIPPOS wajib diisi.',
            'nippos.unique'     => 'Username / NIPPOS sudah digunakan.',
            'password.required' => 'Password wajib diisi.',
            'password.min'      => 'Password minimal 6 karakter.',
            'role.required'     => 'Role wajib dipilih.',
            'role.in'           => 'Role tidak valid.',
            'kantor.required'   => 'Kantor penugasan wajib dipilih.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'nippos'   => $nippos,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'kantor'   => $request->kantor,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'User berhasil ditambahkan.',
            'data'    => [
                'id'     => $user->id,
                'name'   => $user->name,
                'nippos' => $user->nippos,
                'role'   => $user->role,
                'kantor' => $user->kantor,
            ],
        ], 201);
    }

    // 3. Update data user (tombol Edit)
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data user tidak ditemukan.',
            ], 404);
        }

        $nippos = $request->username ?? $request->nippos;

        $validator = Validator::make(array_merge($request->all(), ['nippos' => $nippos]), [
            'name'     => 'required|string|max:255',
            'nippos'   => 'required|string|max:50|unique:users,nippos,' . $id,
            'password' => 'nullable|min:6',
            'role'     => 'required|in:superadmin,admin,petugas,samsat,agen pos',
            'kantor'   => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $updateData = [
            'name'   => $request->name,
            'nippos' => $nippos,
            'role'   => $request->role,
            'kantor' => $request->kantor,
        ];

        // Jika password diisi di form edit, ubah password-nya
        // Jika dikosongkan, tetap pakai password lama
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data user berhasil diperbarui.',
            'data'    => [
                'id'     => $user->id,
                'name'   => $user->name,
                'nippos' => $user->nippos,
                'role'   => $user->role,
                'kantor' => $user->kantor,
            ],
        ], 200);
    }

    // 4. Hapus user (tombol Hapus)
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data user tidak ditemukan.',
            ], 404);
        }

        $user->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'User berhasil dihapus.',
        ], 200);
    }
}