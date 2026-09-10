<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KantorCabang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KantorCabangController extends Controller
{
    // 1. Ambil data kantor untuk tabel di React
    public function index()
    {
        $kantor = KantorCabang::orderBy('kode_kantor', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $kantor
        ], 200);
    }

    // 2. Simpan kantor baru (Tombol Simpan)
    public function store(Request $request)
    {
        // Ambil nilai id_kantor atau kode_kantor dari frontend
        $kode = $request->id_kantor ?? $request->kode_kantor;

        $validator = Validator::make(array_merge($request->all(), ['kode_kantor' => $kode]), [
            'kode_kantor' => 'required|unique:kantor_cabangs,kode_kantor',
            'nama_kantor' => 'required|string|max:255',
        ], [
            'kode_kantor.required' => 'Kode / ID Kantor wajib diisi.',
            'kode_kantor.unique'   => 'Kode / ID Kantor sudah digunakan.',
            'nama_kantor.required' => 'Nama Kantor wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $kantor = KantorCabang::create([
            'kode_kantor' => $kode,
            'nama_kantor' => $request->nama_kantor,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data kantor berhasil ditambahkan.',
            'data'    => $kantor
        ], 201);
    }

    // 3. Edit kantor (Tombol Edit)
    public function update(Request $request, $id)
    {
        $kantor = KantorCabang::find($id);

        if (!$kantor) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data kantor tidak ditemukan.'
            ], 404);
        }

        $kode = $request->id_kantor ?? $request->kode_kantor;

        $validator = Validator::make(array_merge($request->all(), ['kode_kantor' => $kode]), [
            'kode_kantor' => 'required|unique:kantor_cabangs,kode_kantor,' . $id,
            'nama_kantor' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $kantor->update([
            'kode_kantor' => $kode,
            'nama_kantor' => $request->nama_kantor,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data kantor berhasil diperbarui.',
            'data'    => $kantor
        ], 200);
    }

    // 4. Hapus kantor (Tombol Hapus)
    public function destroy($id)
    {
        $kantor = KantorCabang::find($id);

        if (!$kantor) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data kantor tidak ditemukan.'
            ], 404);
        }

        $kantor->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data kantor berhasil dihapus.'
        ], 200);
    }
}