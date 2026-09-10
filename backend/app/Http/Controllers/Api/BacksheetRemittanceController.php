<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BacksheetRemittance;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BacksheetRemittanceController extends Controller
{
    // 1. Ambil daftar data + filter
    public function index(Request $request)
    {
        $query = BacksheetRemittance::query();

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
        $path = $uploadedFile->storeAs('backsheets/remittance', $storedFileName, 'public');

        $remittance = BacksheetRemittance::create([
            'tanggal'    => $request->tanggal,
            'nama_file'  => $originalName,
            'file_path'  => $path,
            'kantor_pos' => $request->kantor_pos ?? 'Kantor Pos Sidoarjo',
            'tipe_file'  => strtolower($extension),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Backsheet Remittance berhasil diupload!',
            'data'    => $remittance,
        ], 201);
    }


    // 4. Lihat file langsung di tab baru browser (Preview)
    public function preview($id)
    {
        $remittance = BacksheetRemittance::find($id);

        if (!$remittance || !Storage::disk('public')->exists($remittance->file_path)) {
            return response()->json(['status' => 'error', 'message' => 'File tidak ditemukan'], 404);
        }

        $fullPath = Storage::disk('public')->path($remittance->file_path);

        return response()->file($fullPath);
    }

    // 5. Unduh file fisik langsung (Download)
    public function download($id)
    {
        $remittance = BacksheetRemittance::find($id);

        if (!$remittance || !Storage::disk('public')->exists($remittance->file_path)) {
            return response()->json(['status' => 'error', 'message' => 'File tidak ditemukan'], 404);
        }

        $fullPath = Storage::disk('public')->path($remittance->file_path);

        return response()->download($fullPath, $remittance->nama_file);
    }

    // 3. Hapus data & file fisik
    public function destroy($id)
    {
        $remittance = BacksheetRemittance::find($id);

        if (!$remittance) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Data tidak ditemukan',
            ], 404);
        }

        if (Storage::disk('public')->exists($remittance->file_path)) {
            Storage::disk('public')->delete($remittance->file_path);
        }

        $remittance->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'File Backsheet Remittance berhasil dihapus',
        ]);
    }
}
