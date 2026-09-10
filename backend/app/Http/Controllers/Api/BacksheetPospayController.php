<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\BacksheetPospay;

class BacksheetPospayController extends Controller
{
    public function index(Request $request)
    {

        $query = BacksheetPospay::query();

        if ($request->filled('kantor_pos') && $request->kantor_pos !== 'Semua Kantor') {
            $query->where('kantor_pos', $request->kantor_pos);
        }

        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        // Urutkan dari data yang paling baru diupload
        $data = $query->latest()->get()->map(function ($item) {
            // Tambahkan URL publik langsung agar frontend bisa unduh/lihat
            $item->file_url = asset('storage/' . $item->file_path);
            return $item;
        });

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);


    }

    // 2. Simpan file yang di-upload dari frontend
    public function store(Request $request)
    {
        // Validasi input
        $request->validate([
            'tanggal'    => 'required|date',
            'kantor_pos' => 'nullable|string',
            'file'       => 'required|file|mimes:pdf,xlsx,xls|max:10240', // Maksimal 10MB
        ]);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension    = $uploadedFile->getClientOriginalExtension();

        // Buat nama file unik saat disimpan ke storage untuk cegah bentrok
        $storedFileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
        $path = $uploadedFile->storeAs('backsheets', $storedFileName, 'public');

        // Simpan metadata file ke database
        $backsheet = BacksheetPospay::create([
            'tanggal'    => $request->tanggal,
            'nama_file'  => $originalName,
            'file_path'  => $path,
            'kantor_pos' => $request->kantor_pos ?? 'Kantor Pos Sidoarjo', // Default jika tidak dikirim dari session
            'tipe_file'  => strtolower($extension),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Backsheet berhasil diupload!',
            'data'    => $backsheet,
        ], 201);
    }


    // 4. Endpoint untuk LIHAT berkas langsung di tab baru (Preview)
    public function preview($id)
    {
        $backsheet = BacksheetPospay::find($id);

        if (!$backsheet || !Storage::disk('public')->exists($backsheet->file_path)) {
            return response()->json(['status' => 'error', 'message' => 'File tidak ditemukan'], 404);
        }

        $fullPath = Storage::disk('public')->path($backsheet->file_path);
        
        // Membuka file langsung di browser (inline)
        return response()->file($fullPath);
    }



    // Tambahkan di dalam class BacksheetPospayController
    public function download($id)
    {
        $backsheet = BacksheetPospay::find($id);

        if (!$backsheet || !Storage::disk('public')->exists($backsheet->file_path)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'File tidak ditemukan di server.',
            ], 404);
        }

        $filePath = Storage::disk('public')->path($backsheet->file_path);

        // Mengunduh langsung dengan nama asli file saat diunggah
        return response()->download($filePath, $backsheet->nama_file);
    }

    // 3. Hapus data sekaligus file fisik di folder storage
    public function destroy($id)
    {
        $backsheet = BacksheetPospay::find($id);

        if (!$backsheet) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        // Hapus file fisik dari storage jika ada
        if (Storage::disk('public')->exists($backsheet->file_path)) {
            Storage::disk('public')->delete($backsheet->file_path);
        }

        // Hapus data dari tabel database
        $backsheet->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'File backsheet berhasil dihapus',
        ]);
    }

}