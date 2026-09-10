<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NeracaN2Controller;
use App\Http\Controllers\Api\KantorCabangController;
use App\Http\Controllers\Api\BacksheetPospayController;
use App\Http\Controllers\Api\BacksheetKurlogController;
use App\Http\Controllers\Api\BacksheetRemittanceController;
use App\Http\Controllers\Api\BacksheetCoreGiroController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BarangController;
use App\Http\Controllers\Api\OrderPkbController;
use App\Http\Controllers\Api\OrderMateraiController;
use App\Http\Controllers\Api\OrderPerangkoController;
use App\Http\Controllers\Api\PermintaanBarangController;

/*
|--------------------------------------------------------------------------
| Endpoint Publik (Tanpa Token)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Endpoint Privat (Wajib Membawa Bearer Token Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth & User Profile
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard POSPED
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Kelola Kantor Cabang (CRUD Otomatis: index, store, update, destroy)
    Route::apiResource('kantor-cabang', KantorCabangController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('barangs', BarangController::class);

    // Modul Neraca N2
    Route::get('/neraca-n2', [NeracaN2Controller::class, 'index']);
    Route::post('/neraca-n2', [NeracaN2Controller::class, 'store']);
    Route::get('/neraca-n2/{id}', [NeracaN2Controller::class, 'show']);
    Route::put('/neraca-n2/{id}', [NeracaN2Controller::class, 'update']);
    Route::delete('/neraca-n2/{id}', [NeracaN2Controller::class, 'destroy']);

    // Modul Backsheet Pospay
    Route::get('/backsheet-pospay', [BacksheetPospayController::class, 'index']);
    Route::post('/backsheet-pospay', [BacksheetPospayController::class, 'store']);
    Route::delete('/backsheet-pospay/{id}', [BacksheetPospayController::class, 'destroy']);   
    // Tambahan untuk Lihat dan Download
    Route::get('/backsheet-pospay/{id}/preview', [BacksheetPospayController::class, 'preview']);
    Route::get('/backsheet-pospay/{id}/download', [BacksheetPospayController::class, 'download']);

   // Modul Order PKB & Riwayat
    Route::get('/order-pkb', [OrderPkbController::class, 'index']);
    Route::post('/order-pkb', [OrderPkbController::class, 'store']);
    Route::post('/order-pkb/bulk-update', [OrderPkbController::class, 'updateBulk']);
    Route::delete('/order-pkb/{id}', [OrderPkbController::class, 'destroy']);

    // Modul Halaman Samsat
    Route::get('/samsat/rekap-pkb', [OrderPkbController::class, 'rekapSamsat']);

    // Modul Order Materai
    Route::get('/order-materai', [OrderMateraiController::class, 'index']);
    Route::post('/order-materai', [OrderMateraiController::class, 'store']);

    // Modul Order Perangko
    Route::apiResource('order-perangko', OrderPerangkoController::class);

    // Modul Kelola Master Barang
    Route::apiResource('barang', BarangController::class);


    // Modul Permintaan Barang (Per7)
    Route::apiResource('permintaan-barang', PermintaanBarangController::class);

    // Modul Backsheet Kurlog
    Route::get('/backsheet-kurlog', [BacksheetKurlogController::class, 'index']);
    Route::post('/backsheet-kurlog', [BacksheetKurlogController::class, 'store']);
    Route::delete('/backsheet-kurlog/{id}', [BacksheetKurlogController::class, 'destroy']);
    Route::get('/backsheet-kurlog/{id}/preview', [BacksheetKurlogController::class, 'preview']);
    Route::get('/backsheet-kurlog/{id}/download', [BacksheetKurlogController::class, 'download']);

    // Modul Backsheet Remittance
    Route::get('/backsheet-remittance', [BacksheetRemittanceController::class, 'index']);
    Route::post('/backsheet-remittance', [BacksheetRemittanceController::class, 'store']);
    Route::delete('/backsheet-remittance/{id}', [BacksheetRemittanceController::class, 'destroy']);
    Route::get('/backsheet-remittance/{id}/preview', [BacksheetRemittanceController::class, 'preview']);
    Route::get('/backsheet-remittance/{id}/download', [BacksheetRemittanceController::class, 'download']);

    // Modul Backsheet Core Giro
    Route::get('/backsheet-core-giro', [BacksheetCoreGiroController::class, 'index']);
    Route::post('/backsheet-core-giro', [BacksheetCoreGiroController::class, 'store']);
    Route::delete('/backsheet-core-giro/{id}', [BacksheetCoreGiroController::class, 'destroy']);
    Route::get('/backsheet-core-giro/{id}/preview', [BacksheetCoreGiroController::class, 'preview']);
    Route::get('/backsheet-core-giro/{id}/download', [BacksheetCoreGiroController::class, 'download']);
});