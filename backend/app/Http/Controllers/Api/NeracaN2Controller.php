<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NeracaN2;
use Illuminate\Http\Request;

class NeracaN2Controller extends Controller
{
    public function index(Request $request)
    {
        $query = NeracaN2::with('user')->latest();

        // Jika user mengisi tanggal pencarian di frontend
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        $riwayat = $query->get();

        return response()->json([
            'status' => 'success',
            'data'   => $riwayat,
        ], 200);
    }

    // 2. Simpan input saat tombol "Simpan Neraca N2" ditekan
    public function store(Request $request)
    {
        $request->validate([
            'kantor'              => 'required|string',
            'tanggal'             => 'required|date',
            'petugas_loket'       => 'required|string',
            'jumlah_penerimaan'   => 'required|numeric',
            'jumlah_pengeluaran'  => 'required|numeric',
            'penerimaan_details'  => 'nullable|array',
            'pengeluaran_details' => 'nullable|array',
        ]);

        $neraca = NeracaN2::create([
            'user_id'             => $request->user()->id,
            'kantor'              => $request->kantor,
            'tanggal'             => $request->tanggal,
            'petugas_loket'       => $request->petugas_loket,
            'jumlah_penerimaan'   => $request->jumlah_penerimaan,
            'jumlah_pengeluaran'  => $request->jumlah_pengeluaran,
            'penerimaan_details'  => $request->penerimaan_details,
            'pengeluaran_details' => $request->pengeluaran_details,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Neraca N2 berhasil disimpan',
            'data'    => $neraca,
        ], 201);
    }

    // 3. Ambil data detail 1 Neraca N2 berdasarkan ID (untuk cetak / Export PDF)
    public function show($id)
    {
        $neraca = NeracaN2::with('user')->find($id);

        if (! $neraca) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data Neraca N2 tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $neraca,
        ], 200);
    }
}
