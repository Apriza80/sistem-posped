<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BarangController extends Controller
{
    // 1. Ambil semua data barang
    public function index()
    {
        $barang = Barang::orderBy('id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $barang,
        ], 200);
    }

    // 2. Simpan barang baru
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_barang' => 'required|string|max:255',
            'satuan'      => 'required|string|max:50',
        ], [
            'nama_barang.required' => 'Nama barang wajib diisi.',
            'satuan.required'      => 'Satuan barang wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $barang = Barang::create([
            'nama_barang' => $request->nama_barang,
            'satuan'      => $request->satuan,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Barang berhasil ditambahkan.',
            'data'    => $barang,
        ], 201);
    }

    // 3. Update barang
    public function update(Request $request, $id)
    {
        $barang = Barang::find($id);

        if (!$barang) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data barang tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_barang' => 'required|string|max:255',
            'satuan'      => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $barang->update([
            'nama_barang' => $request->nama_barang,
            'satuan'      => $request->satuan,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data barang berhasil diperbarui.',
            'data'    => $barang,
        ], 200);
    }

    // 4. Hapus barang
    public function destroy($id)
    {
        $barang = Barang::find($id);

        if (!$barang) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data barang tidak ditemukan.',
            ], 404);
        }

        $barang->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data barang berhasil dihapus.',
        ], 200);
    }
}