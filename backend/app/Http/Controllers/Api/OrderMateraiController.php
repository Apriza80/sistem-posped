<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderMaterai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderMateraiController extends Controller
{
    // 1. Ambil Riwayat Order Materai (untuk Rekap Laporan -> Riwayat Order Materai)
    public function index(Request $request)
    {
        $query = OrderMaterai::query();

        if ($request->user()->role === 'petugas') {
            $query->where('kantor_pos', $request->user()->kantor);
        }

        if ($request->filled('kantor_pos') && $request->kantor_pos !== 'Semua Kantor') {
            $query->where('kantor_pos', $request->kantor_pos);
        }

        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        $data = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ], 200);
    }

    // 2. Simpan form Order Materai baru
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal'         => 'required|date',
            'sesi_order'      => 'required|string|max:50',
            'nominal_meterai' => 'required|numeric|min:0',
            'jumlah_keping'   => 'required|integer|min:1',
        ], [
            'tanggal.required'         => 'Tanggal order wajib diisi.',
            'sesi_order.required'      => 'Sesi order wajib dipilih.',
            'nominal_meterai.required' => 'Nominal meterai wajib diisi.',
            'jumlah_keping.required'   => 'Jumlah keping wajib diisi.',
            'jumlah_keping.min'        => 'Jumlah keping minimal 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Ambil user dan kantor dari token login Sanctum
        $user = $request->user();

        // Hitung total nilai di server agar valid
        $nominal = (float) $request->nominal_meterai;
        $keping  = (int) $request->jumlah_keping;
        $total   = $nominal * $keping;

        $order = OrderMaterai::create([
            'tanggal'         => $request->tanggal,
            'sesi_order'      => $request->sesi_order,
            'kantor_pos'      => $user->kantor ?? 'Kantor Pos Sidoarjo',
            'petugas'         => $user->name,
            'nominal_meterai' => $nominal,
            'jumlah_keping'   => $keping,
            'total_nilai'     => $total,
            'status'          => 'Order',
            'keterangan'      => null,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Order Materai berhasil disimpan!',
            'data'    => $order,
        ], 201);
    }
}
