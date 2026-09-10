<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\OrderPkb;

class OrderPkbController extends Controller
{
    // 1. Ambil data Riwayat Order PKB & Pengiriman (+ Filter)
    public function index(Request $request)
    {
        $query = OrderPkb::query();

        // Jika petugas biasa atau agen pos, batasi ke kantornya
        if (in_array($request->user()->role, ['petugas', 'agen pos'])) {
            $query->where('kantor_pos', $request->user()->kantor);
        }

        // Filter Kantor Pos (dropdown)
        if ($request->filled('kantor_pos') && $request->kantor_pos !== 'Semua Kantor') {
            $query->where('kantor_pos', $request->kantor_pos);
        }

        // Filter Tanggal
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        $data = $query->orderBy('tanggal', 'desc')
                      ->orderBy('id', 'desc')
                      ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ], 200);
    }

    // 2. Simpan order baru dari halaman "Order Percetakan PKB"
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal'      => 'required|date',
            'nama_pemilik' => 'required|string|max:255',
            'nopol'        => 'required|string|max:30',
            'no_bayar'     => 'required|string|max:100',
        ], [
            'tanggal.required'      => 'Tanggal order wajib diisi.',
            'nama_pemilik.required' => 'Nama pemilik kendaraan wajib diisi.',
            'nopol.required'        => 'Nomor plat kendaraan wajib diisi.',
            'no_bayar.required'     => 'Nomor bukti bayar wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $order = OrderPkb::create([
            'tanggal'      => $request->tanggal,
            'kantor_pos'   => $user->kantor ?? 'Kantor Pos Sidoarjo',
            'petugas'      => $user->name,
            'nopol'        => strtoupper($request->nopol),
            'nama_pemilik' => $request->nama_pemilik,
            'no_bayar'     => $request->no_bayar,
            'status'       => 'Order',
            'keterangan'   => null,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Order PKB berhasil dikirim!',
            'data'    => $order,
        ], 201);
    }

    // 3. Tombol "Simpan Perubahan" (Simpan status & keterangan tabel sekaligus)
    public function updateBulk(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'orders'                => 'required|array',
            'orders.*.id'           => 'required|exists:order_pkbs,id',
            'orders.*.status'       => 'required|string',
            'orders.*.keterangan'   => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        foreach ($request->orders as $item) {
            OrderPkb::where('id', $item['id'])->update([
                'status'     => $item['status'],
                'keterangan' => $item['keterangan'] ?? null,
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Perubahan status dan keterangan berhasil disimpan!',
        ], 200);
    }

    // 4. Tombol Hapus per baris
    public function destroy($id)
    {
        $order = OrderPkb::find($id);

        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan'], 404);
        }

        $order->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data order PKB berhasil dihapus!',
        ], 200);
    }

    // 5. Khusus Menu Halaman Samsat
    public function rekapSamsat(Request $request)
    {
        $query = OrderPkb::query();

        if ($request->filled('kantor_pos') && $request->kantor_pos !== 'Semua Kantor') {
            $query->where('kantor_pos', $request->kantor_pos);
        }

        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        $data = $query->orderBy('tanggal', 'desc')
                    ->orderBy('id', 'desc')
                    ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ], 200);
    }
}