<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NeracaN2Controller;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

// Endpoint Privat (wajib membawa Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Endpoint Dashboard POSPED
Route::get('/dashboard', [DashboardController::class, 'index']);

// Endpoint Modul Neraca N2
    Route::get('/neraca-n2', [NeracaN2Controller::class, 'index']);
    Route::post('/neraca-n2', [NeracaN2Controller::class, 'store']);
    Route::get('/neraca-n2/{id}', [NeracaN2Controller::class, 'show']);
