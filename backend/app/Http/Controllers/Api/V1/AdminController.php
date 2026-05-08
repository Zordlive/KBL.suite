<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NetworkInventoryCheck;
use App\Models\NetworkSale;
use App\Models\NetworkStock;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class AdminController extends Controller
{
    public function stats(Request $request)
    {
        if (! $request->user()->hasRole('administrator')) {
            return Response::json(['message' => 'Unauthorized'], 403);
        }

        $today = now()->toDateString();

        $stockRecords = NetworkStock::all();
        $todaySales = NetworkSale::whereDate('sale_date', $today)->get();
        $todayChecks = NetworkInventoryCheck::whereDate('checked_at', $today)->get();

        $networkSales = [];
        foreach (NetworkStock::NETWORKS as $network) {
            $networkSales[$network] = $todaySales->where('network', $network)->sum('quantity');
        }

        return Response::json([
            'user_stats' => [
                'administrators' => User::role('administrator')->count(),
                'agents' => User::role('agent')->where('status', 'active')->count(),
                'super_agents' => User::role('super_agent')->where('status', 'active')->count(),
                'pending_super_agents' => User::role('super_agent')->where('status', 'pending')->count(),
                'total_users' => User::count(),
            ],
            'stock_stats' => [
                'networks' => $stockRecords->map(fn ($stock) => [
                    'network' => $stock->network,
                    'quantity' => $stock->quantity,
                ]),
                'total_units' => $stockRecords->sum('quantity'),
            ],
            'sales_stats' => [
                'today_sales' => $todaySales->count(),
                'today_quantity' => $todaySales->sum('quantity'),
                'network_sales' => $networkSales,
            ],
            'inventory_stats' => [
                'today_discrepancies' => $todayChecks->where('difference', '!=', 0)->count(),
                'today_checks' => $todayChecks->count(),
            ],
        ]);
    }
}
