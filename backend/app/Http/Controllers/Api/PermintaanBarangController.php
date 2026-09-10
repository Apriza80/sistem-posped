<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PermintaanBarang;
use App\Models\Barang; // Memanggil model Barang untuk ambil satuan otomatis
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PermintaanBarangController extends Controller
{
    // 1. Ambil riwayat permintaan barang (dengan filter pencarian)
    public function index(Request $request)
    {
        $query = PermintaanBarang::query();

        // Petugas biasa hanya bisa melihat data kantornya sendiri
        if ($request->user()->role === 'petugas') {
            $query->where('nama_kantor', $request->user()->kantor);
        }

        // Fitur pencarian "Cari riwayat permintaan barang..."
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'like', "%{$search}%")
                ->orWhere('nama_kantor', 'like', "%{$search}%")
                ->orWhere('status', 'like', "%{$search}%");
            });
        }

        $data = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ], 200);
    }

    // 2. Simpan order permintaan barang
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tanggal'     => 'required|date',
            'nama_barang' => 'required|string|max:255',
            'jumlah'      => 'required|integer|min:1',
            'satuan'      => 'nullable|string|max:30',
        ], [
            'tanggal.required'     => 'Tanggal permintaan wajib diisi.',
            'nama_barang.required' => 'Nama barang wajib dipilih.',
            'jumlah.required'      => 'Jumlah order wajib diisi.',
            'jumlah.min'           => 'Jumlah order minimal 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        // Ambil satuan dari master barang jika tidak dikirim dari form
        $satuan = $request->satuan;
        if (!$satuan) {
            $barang = Barang::where('nama_barang', $request->nama_barang)->first();
            $satuan = $barang ? $barang->satuan : 'Pcs';
        }

        $order = PermintaanBarang::create([
            'tanggal'     => $request->tanggal,
            'nama_kantor' => $user->kantor ?? 'Kantor Pos Sidoarjo',
            'petugas'     => $user->name,
            'nama_barang' => $request->nama_barang,
            'jumlah'      => $request->jumlah,
            'satuan'      => $satuan,
            'status'      => 'Order',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Permintaan barang berhasil dikirim!',
            'data'    => $order,
        ], 201);
    }

    // 3. Update status atau data order (Edit)
    public function update(Request $request, $id)
    {
        $order = PermintaanBarang::find($id);

        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        $order->update($request->only(['tanggal', 'nama_barang', 'jumlah', 'satuan', 'status', 'keterangan']));

        return response()->json([
            'status'  => 'success',
            'message' => 'Data permintaan barang berhasil diperbarui!',
            'data'    => $order,
        ], 200);
    }

    // 4. Hapus data order
    public function destroy($id)
    {
        $order = PermintaanBarang::find($id);

        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        $order->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Permintaan barang berhasil dihapus!',
        ], 200);
    }
}