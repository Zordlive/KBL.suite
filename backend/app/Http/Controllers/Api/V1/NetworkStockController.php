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
        $openingChecks = $todayChecks->where('check_type', 'opening')->values();
        $eveningChecks = $todayChecks->where('check_type', 'evening')->values();
        $discrepancies = $todayChecks->filter(fn ($check) => $check->difference !== 0)->values();
        $openingCompleted = $openingChecks->count() === count(NetworkStock::NETWORKS);
        $eveningCompleted = $eveningChecks->count() === count(NetworkStock::NETWORKS);
        $currentTime = now();
        $morningStart = now()->copy()->setTime(7, 0);
        $morningEnd = now()->copy()->setTime(13, 0);
        $eveningStart = now()->copy()->setTime(19, 0);
        $eveningEnd = now()->copy()->setTime(21, 30);
        $canSubmitOpening = $currentTime->between($morningStart, $morningEnd) && ! $openingCompleted;
        $canSubmitInventory = $currentTime->between($eveningStart, $eveningEnd) && ! $eveningCompleted;

        $previousEveningChecks = NetworkInventoryCheck::with('user')
            ->where('check_type', 'evening')
            ->whereDate('checked_at', '<', $today)
            ->orderByDesc('checked_at')
            ->get();

        return Response::json([
            'stocks' => $stockRecords,
            'todayChecks' => $todayChecks,
            'openingChecks' => $openingChecks,
            'eveningChecks' => $eveningChecks,
            'discrepancies' => $discrepancies,
            'inventoryStatus' => [
                'opening' => [
                    'completed' => $openingCompleted,
                    'canSubmit' => $canSubmitOpening,
                    'cutoffStart' => '07:00',
                    'cutoffEnd' => '13:00',
                ],
                'evening' => [
                    'completed' => $eveningCompleted,
                    'canSubmit' => $canSubmitInventory,
                    'cutoffStart' => '19:00',
                    'cutoffEnd' => '21:30',
                ],
                'lastEveningChecks' => $previousEveningChecks,
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
