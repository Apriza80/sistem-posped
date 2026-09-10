<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderPerangko;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderPerangkoController extends Controller
{
    // 1. Ambil data riwayat order perangko + filter
    public function index(Request $request)
    {
        $query = OrderPerangko::query();

        // Jika petugas biasa, batasi sesuai kantornya
        if ($request->user()->role === 'petugas') {
            $query->where('kantor_pos', $request->user()->kantor);
        }

        // Filter kantor pos
        if ($request->filled('kantor_pos') && $request->kantor_pos !== 'Semua Kantor') {
            $query->where('kantor_pos', $request->kantor_pos);
        }

        // Filter tanggal
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        $data = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ], 200);
    }

    // 2. Simpan order perangko baru
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal'          => 'required|date',
            'nominal_perangko' => 'required|numeric|min:1',
            'jumlah_keping'    => 'required|integer|min:1',
        ], [
            'tanggal.required'          => 'Tanggal order wajib diisi.',
            'nominal_perangko.required' => 'Pilihan nominal perangko wajib dipilih.',
            'jumlah_keping.required'    => 'Jumlah keping wajib diisi.',
            'jumlah_keping.min'         => 'Jumlah keping minimal 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $nominal = (float) $request->nominal_perangko;
        $keping  = (int) $request->jumlah_keping;
        $total   = $nominal * $keping;

        $order = OrderPerangko::create([
            'tanggal'          => $request->tanggal,
            'kantor_pos'       => $user->kantor ?? 'Kantor Pos Sidoarjo 61200',
            'petugas'          => $user->name,
            'nominal_perangko' => $nominal,
            'jumlah_keping'    => $keping,
            'total_nilai'      => $total,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Order Perangko berhasil disimpan!',
            'data'    => $order,
        ], 201);
    }

    // 3. Update order perangko (fitur Edit)
    public function update(Request $request, $id)
    {
        $order = OrderPerangko::find($id);

        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'tanggal'          => 'required|date',
            'nominal_perangko' => 'required|numeric|min:1',
            'jumlah_keping'    => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $nominal = (float) $request->nominal_perangko;
        $keping  = (int) $request->jumlah_keping;

        $order->update([
            'tanggal'          => $request->tanggal,
            'nominal_perangko' => $nominal,
            'jumlah_keping'    => $keping,
            'total_nilai'      => $nominal * $keping,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Order Perangko berhasil diperbarui!',
            'data'    => $order,
        ], 200);
    }

    // 4. Hapus data order perangko
    public function destroy($id)
    {
        $order = OrderPerangko::find($id);

        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        $order->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Order Perangko berhasil dihapus!',
        ], 200);
    }
}