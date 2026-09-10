<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BacksheetCoreGiro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BacksheetCoreGiroController extends Controller
{
    // 1. Ambil daftar data + filter
    public function index(Request $request)
    {
        $query = BacksheetCoreGiro::query();

        if ($request->filled('kantor_pos') && $request->kantor_pos !== 'Semua Kantor') {
            $query->where('kantor_pos', $request->kantor_pos);
        }

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
            'tanggal'    => 'required|date',
            'kantor_pos' => 'nullable|string',
            'file'       => 'required|file|mimes:pdf,xlsx,xls|max:10240',
        ]);

        $uploadedFile = $request->file('file');
        $originalName = $uploadedFile->getClientOriginalName();
        $extension    = $uploadedFile->getClientOriginalExtension();

        $storedFileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $extension;
        $path = $uploadedFile->storeAs('backsheets/core_giro', $storedFileName, 'public');

        $coreGiro = BacksheetCoreGiro::create([
            'tanggal'    => $request->tanggal,
            'nama_file'  => $originalName,
            'file_path'  => $path,
            'kantor_pos' => $request->kantor_pos ?? 'Kantor Pos Sidoarjo',
            'tipe_file'  => strtolower($extension),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Backsheet Core Giro berhasil diupload!',
            'data'    => $coreGiro,
        ], 201);
    }

    // 3. Hapus data & file fisik
    public function destroy($id)
    {
        $coreGiro = BacksheetCoreGiro::find($id);

        if (!$coreGiro) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        if (Storage::disk('public')->exists($coreGiro->file_path)) {
            Storage::disk('public')->delete($coreGiro->file_path);
        }

        $coreGiro->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'File Backsheet Core Giro berhasil dihapus',
        ]);
    }

    // 4. Buka file langsung (Lihat)
    public function preview($id)
    {
        $cgs = BacksheetCoreGiro::find($id);

        if (!$cgs || !Storage::disk('public')->exists($cgs->file_path)) {
            return response()->json(['status' => 'error', 'message' => 'File tidak ditemukan'], 404);
        }

        return response()->file(Storage::disk('public')->path($cgs->file_path));
    }

    // 5. Unduh file langsung (Download)
    public function download($id)
    {
        $cgs = BacksheetCoreGiro::find($id);

        if (!$cgs || !Storage::disk('public')->exists($cgs->file_path)) {
            return response()->json(['status' => 'error', 'message' => 'File tidak ditemukan'], 404);
        }

        return response()->download(Storage::disk('public')->path($cgs->file_path), $cgs->nama_file);
    }
}