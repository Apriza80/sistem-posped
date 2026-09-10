<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BacksheetKurlog;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BacksheetKurlogController extends Controller
{
    // 1. Ambil daftar data + filter
    public function index(Request $request)
    {
        $query = BacksheetKurlog::query();

        // Filter Jenis Pembayaran
        if ($request->filled('jenis_pembayaran') && $request->jenis_pembayaran !== 'Semua') {
            $query->where('jenis_pembayaran', $request->jenis_pembayaran);
        }

        // Filter Kantor Pos
        if ($request->filled('kantor_pos') && $request->kantor_pos !== 'Semua Kantor') {
            $query->where('kantor_pos', $request->kantor_pos);
        }

        // Filter Tanggal
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        $data = $query->latest()->get()->map(function ($item) {
            $item->file_url = asset('storage/' . $item->file_path);
            return $item;
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    // 2. Upload file & simpan data
    public function store(Request $request)
    {
        $request->validate([
            'tanggal'          => 'required|date',
            'jenis_pembayaran' => 'required|in:Tunai,Non Tunai',
            'kantor_pos'       => 'nullable|string',
            'file'             => 'required|file|mimes:pdf,xlsx,xls|max:10240',
        ]);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension    = $uploadedFile->getClientOriginalExtension();

        $storedFileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
        $path = $uploadedFile->storeAs('backsheets/kurlog', $storedFileName, 'public');

        $kurlog = BacksheetKurlog::create([
            'tanggal'          => $request->tanggal,
            'jenis_pembayaran' => $request->jenis_pembayaran,
            'nama_file'        => $originalName,
            'file_path'        => $path,
            'kantor_pos'       => $request->kantor_pos ?? 'Kantor Pos Sidoarjo',
            'tipe_file'        => strtolower($extension),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Backsheet Kurlog berhasil diupload!',
            'data'    => $kurlog,
        ], 201);
    }


    // 4. Lihat file langsung di browser (Tombol Lihat)
    public function preview($id)
    {
        $kurlog = BacksheetKurlog::find($id);

        if (!$kurlog || !Storage::disk('public')->exists($kurlog->file_path)) {
            return response()->json(['status' => 'error', 'message' => 'File tidak ditemukan'], 404);
        }

        $fullPath = Storage::disk('public')->path($kurlog->file_path);

        return response()->file($fullPath);
    }

    // 5. Unduh file fisik langsung (Tombol Download)
    public function download($id)
    {
        $kurlog = BacksheetKurlog::find($id);

        if (!$kurlog || !Storage::disk('public')->exists($kurlog->file_path)) {
            return response()->json(['status' => 'error', 'message' => 'File tidak ditemukan'], 404);
        }

        $fullPath = Storage::disk('public')->path($kurlog->file_path);

        return response()->download($fullPath, $kurlog->nama_file);
    }

    // 3. Hapus data & file fisik
    public function destroy($id)
    {
        $kurlog = BacksheetKurlog::find($id);

        if (!$kurlog) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        if (Storage::disk('public')->exists($kurlog->file_path)) {
            Storage::disk('public')->delete($kurlog->file_path);
        }

        $kurlog->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'File Backsheet Kurlog berhasil dihapus',
        ]);
    }
}
