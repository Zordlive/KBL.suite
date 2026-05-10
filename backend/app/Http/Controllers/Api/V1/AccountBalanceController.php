<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AccountBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccountBalanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $balances = AccountBalance::where('user_id', Auth::id())
            ->latest('recorded_at')
            ->get()
            ->keyBy('account_name');

        return response()->json($balances);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'balances' => 'required|array',
            'balances.*.account_name' => 'required|string',
            'balances.*.fc_balance' => 'required|numeric|min:0',
            'balances.*.usd_balance' => 'required|numeric|min:0',
            'balances.*.time_slot' => 'required|in:Matin,Midi',
        ]);

        $recordedAt = now();

        foreach ($request->balances as $balanceData) {
            AccountBalance::create([
                'account_name' => $balanceData['account_name'],
                'fc_balance' => $balanceData['fc_balance'],
                'usd_balance' => $balanceData['usd_balance'],
                'time_slot' => $balanceData['time_slot'],
                'user_id' => Auth::id(),
                'recorded_at' => $recordedAt,
            ]);
        }

        return response()->json(['message' => 'Balances recorded successfully'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
