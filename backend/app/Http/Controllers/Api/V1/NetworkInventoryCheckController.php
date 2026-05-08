<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NetworkInventoryCheck;
use App\Models\NetworkInventoryLog;
use App\Models\NetworkStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;

class NetworkInventoryCheckController extends Controller
{
    public function today()
    {
        $today = now()->toDateString();
        $checks = NetworkInventoryCheck::with(['user', 'logs.user'])
            ->whereDate('checked_at', $today)
            ->get();

        return Response::json(['checks' => $checks]);
    }

    public function logs()
    {
        $logs = NetworkInventoryLog::with(['user', 'inventoryCheck'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return Response::json(['logs' => $logs]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'checks' => 'required|array|size:3',
            'checks.*.network' => 'required|in:Orange,Airtel,Vodacom',
            'checks.*.counted_quantity' => 'required|integer|min:0',
        ]);

        $current = now();
        $windowStart = now()->setTime(19, 0);
        $windowEnd = now()->setTime(21, 30);

        if (! $current->between($windowStart, $windowEnd)) {
            return Response::json([
                'message' => 'L’inventaire ne peut être validé qu’entre 19h00 et 21h30.',
            ], 403);
        }

        $today = now()->toDateString();
        $existing = NetworkInventoryCheck::whereDate('checked_at', $today)->exists();

        if ($existing) {
            return Response::json([
                'message' => 'Un inventaire a déjà été enregistré aujourd’hui.',
            ], 422);
        }

        $networks = array_column($request->input('checks'), 'network');
        if (count(array_unique($networks)) !== count($networks)) {
            return Response::json([
                'message' => 'Chaque réseau doit être fourni une seule fois.',
            ], 422);
        }

        $created = [];
        foreach ($request->input('checks') as $checkData) {
            $stock = NetworkStock::firstOrCreate([
                'network' => $checkData['network'],
            ], [
                'quantity' => 0,
                'updated_by' => Auth::id(),
            ]);

            $expected = $stock->quantity;
            $difference = $checkData['counted_quantity'] - $expected;

            $record = NetworkInventoryCheck::create([
                'network' => $checkData['network'],
                'counted_quantity' => $checkData['counted_quantity'],
                'expected_quantity' => $expected,
                'difference' => $difference,
                'checked_at' => $today,
                'user_id' => Auth::id(),
                'resolved' => $difference === 0,
            ]);

            $stock->update([
                'quantity' => $checkData['counted_quantity'],
                'updated_by' => Auth::id(),
            ]);

            NetworkInventoryLog::create([
                'inventory_check_id' => $record->id,
                'user_id' => Auth::id(),
                'action' => 'created',
                'previous_counted_quantity' => null,
                'new_counted_quantity' => $record->counted_quantity,
                'previous_difference' => null,
                'new_difference' => $record->difference,
                'metadata' => [
                    'expected_quantity' => $expected,
                    'stock_before' => $expected,
                ],
            ]);

            $created[] = $record;
        }

        return Response::json(['checks' => $created], 201);
    }

    public function update(Request $request, NetworkInventoryCheck $check)
    {
        if (! $request->user()->hasRole('administrator')) {
            return Response::json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'counted_quantity' => 'required|integer|min:0',
        ]);

        $stock = NetworkStock::where('network', $check->network)->first();

        if (! $stock) {
            $stock = NetworkStock::create([
                'network' => $check->network,
                'quantity' => 0,
                'updated_by' => Auth::id(),
            ]);
        }

        $previousCounted = $check->counted_quantity;
        $previousDifference = $check->difference;
        $newCounted = $request->input('counted_quantity');
        $expected = $check->expected_quantity;
        $difference = $newCounted - $expected;

        $check->update([
            'counted_quantity' => $newCounted,
            'difference' => $difference,
            'resolved' => $difference === 0,
        ]);

        $stock->update([
            'quantity' => $newCounted,
            'updated_by' => Auth::id(),
        ]);

        NetworkInventoryLog::create([
            'inventory_check_id' => $check->id,
            'user_id' => Auth::id(),
            'action' => 'corrected',
            'previous_counted_quantity' => $previousCounted,
            'new_counted_quantity' => $newCounted,
            'previous_difference' => $previousDifference,
            'new_difference' => $difference,
            'metadata' => [
                'expected_quantity' => $expected,
                'stock_before' => $stock->quantity,
            ],
        ]);

        return Response::json(['check' => $check]);
    }
}
