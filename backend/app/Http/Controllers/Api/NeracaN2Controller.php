<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NeracaN2;
use Illuminate\Http\Request;

class NeracaN2Controller extends Controller
{
    // Mengambil data untuk tabel Rekap N2 (dengan filter kantor & tanggal)
    public function index(Request $request)
    {
        $query = NeracaN2::with('user')->latest();

        // Filter Dropdown Kantor
        if ($request->filled('kantor') && $request->kantor !== 'Semua Kantor') {
            $query->where('kpc_kantor', 'like', '%' . $request->kantor . '%');
        }

        // Filter Input Tanggal
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $query->get(),
        ], 200);
    }

    // Menerima submit saat tombol "Simpan ke Rekap N2" ditekan
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_petugas'           => 'required|string',
            'kpc_kantor'             => 'required|string',
            'tanggal'                => 'required|date',
            'jumlah_penerimaan_kas'  => 'required|numeric',
            'jumlah_pengeluaran_kas' => 'required|numeric',
            'ringkasan'              => 'nullable|array',
            'pendapatan_details'     => 'nullable|array',
            'pengeluaran_details'    => 'nullable|array',
        ]);

        $neraca = NeracaN2::create([
            'user_id'                => $request->user()->id,
            'nama_petugas'           => $validated['nama_petugas'],
            'kpc_kantor'             => $validated['kpc_kantor'],
            'tanggal'                => $validated['tanggal'],
            'jumlah_penerimaan_kas'  => $validated['jumlah_penerimaan_kas'],
            'jumlah_pengeluaran_kas' => $validated['jumlah_pengeluaran_kas'],
            'ringkasan'              => $validated['ringkasan'] ?? null,
            'pendapatan_details'     => $validated['pendapatan_details'] ?? null,
            'pengeluaran_details'    => $validated['pengeluaran_details'] ?? null,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Neraca N2 berhasil disimpan ke Rekap N2',
            'data'    => $neraca,
        ], 201);
    }

    // Mengambil satu data spesifik untuk cetak PDF/detail
    public function show($id)
    {
        $neraca = NeracaN2::find($id);

        if (! $neraca) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $neraca], 200);
    }

    // Memperbarui data saat tombol Edit ditekan
    public function update(Request $request, $id)
    {
        $neraca = NeracaN2::find($id);

        if (! $neraca) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan'], 404);
        }

        $validated = $request->validate([
            'nama_petugas'           => 'sometimes|required|string',
            'kpc_kantor'             => 'sometimes|required|string',
            'tanggal'                => 'sometimes|required|date',
            'jumlah_penerimaan_kas'  => 'sometimes|required|numeric',
            'jumlah_pengeluaran_kas' => 'sometimes|required|numeric',
            'ringkasan'              => 'nullable|array',
            'pendapatan_details'     => 'nullable|array',
            'pengeluaran_details'    => 'nullable|array',
        ]);

        $neraca->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Data Neraca N2 berhasil diperbarui',
            'data'    => $neraca,
        ], 200);
    }

    // Menghapus data saat tombol Hapus ditekan
    public function destroy($id)
    {
        $neraca = NeracaN2::find($id);

        if (! $neraca) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan'], 404);
        }

        $neraca->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data Neraca N2 berhasil dihapus',
        ], 200);
    }
}