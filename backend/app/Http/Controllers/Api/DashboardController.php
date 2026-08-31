<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index()
    {
        // Ambil 5 order terbaru dari database
        $recentOrders = Order::latest()->take(5)->get();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data dashboard berhasil diambil',
            'data'    => [
                'summary' => [
                    'neraca_n2' => 128,
                    'backsheet' => 256,
                    'order'     => Order::count(),
                    'penjualan' => 87,
                ],
                'recent_orders' => $recentOrders,
            ],
        ], 200);
    }
}
