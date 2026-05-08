<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NetworkInventoryCheck;
use App\Models\NetworkStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;

class NetworkStockController extends Controller
{
    public function index()
    {
        $stockRecords = NetworkStock::all();

        if ($stockRecords->isEmpty()) {
            foreach (NetworkStock::NETWORKS as $network) {
                NetworkStock::create([
                    'network' => $network,
                    'quantity' => 0,
                    'updated_by' => Auth::id(),
                ]);
            }

            $stockRecords = NetworkStock::all();
        }

        $today = now()->toDateString();
        $todayChecks = NetworkInventoryCheck::with('user')->whereDate('checked_at', $today)->get();
        $discrepancies = $todayChecks->filter(fn ($check) => $check->difference !== 0)->values();
        $inventoryCompleted = $todayChecks->count() === count(NetworkStock::NETWORKS);
        $currentTime = now();
        $windowStart = now()->copy()->setTime(19, 0);
        $windowEnd = now()->copy()->setTime(21, 30);
        $canSubmitInventory = $currentTime->between($windowStart, $windowEnd) && ! $inventoryCompleted;

        return Response::json([
            'stocks' => $stockRecords,
            'todayChecks' => $todayChecks,
            'discrepancies' => $discrepancies,
            'inventoryStatus' => [
                'completed' => $inventoryCompleted,
                'canSubmit' => $canSubmitInventory,
                'cutoffStart' => '19:00',
                'cutoffEnd' => '21:30',
                'lastInventory' => NetworkInventoryCheck::with('user')
                    ->whereDate('checked_at', '<', $today)
                    ->orderByDesc('checked_at')
                    ->get(),
            ],
        ]);
    }

    public function update(Request $request, string $network)
    {
        if (! $request->user()->hasRole('administrator')) {
            return Response::json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $stock = NetworkStock::where('network', $network)->firstOrFail();
        $stock->update([
            'quantity' => $request->input('quantity'),
            'updated_by' => Auth::id(),
        ]);

        return Response::json(['stock' => $stock]);
    }
}
