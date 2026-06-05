<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\NetworkSale;
use App\Models\NetworkStock;
use App\Models\NetworkInventoryCheck;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;

class NetworkSaleController extends Controller
{
    public function index(Request $request)
    {
        $query = NetworkSale::with('user');

        if ($request->filled('network')) {
            $query->where('network', $request->input('network'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('sale_date', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('sale_date', '<=', $request->input('date_to'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($builder) use ($search) {
                $builder->where('client_name', 'like', "%{$search}%")
                    ->orWhere('client_phone', 'like', "%{$search}%")
                    ->orWhere('network', 'like', "%{$search}%")
                    ->orWhere('purchase_type', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 10);
        $sales = $query->orderByDesc('sale_date')->paginate($perPage);

        return Response::json($sales);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_type' => 'required|string|max:100',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:50',
            'network' => 'required|in:Orange,Airtel,Vodacom',
            'quantity' => 'required|integer|min:1',
            'purchase_type' => 'required|string|max:100',
            'payment_method' => 'required|string|max:100',
        ]);

        $stock = NetworkStock::firstOrCreate([
            'network' => $data['network'],
        ], [
            'quantity' => 0,
            'updated_by' => Auth::id(),
        ]);

        $stockBefore = $stock->quantity;

        if ($data['quantity'] > $stockBefore) {
            return Response::json([
                'message' => 'Quantité insuffisante dans le stock pour ce réseau.',
            ], 422);
        }

        $stockAfter = $stockBefore - $data['quantity'];

        $sale = NetworkSale::create([
            'user_id' => Auth::id(),
            'client_type' => $data['client_type'],
            'client_name' => $data['client_name'],
            'client_phone' => $data['client_phone'],
            'network' => $data['network'],
            'quantity' => $data['quantity'],
            'purchase_type' => $data['purchase_type'],
            'payment_method' => $data['payment_method'],
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'sale_date' => now(),
        ]);

        $stock->update([
            'quantity' => $stockAfter,
            'updated_by' => Auth::id(),
        ]);

        return Response::json(['sale' => $sale], 201);
    }

    public function summary()
    {
        $today = now()->toDateString();
        $sales = NetworkSale::whereDate('sale_date', $today)->get();
        $checks = NetworkInventoryCheck::whereDate('checked_at', $today)->get();

        $networkSales = [];
        foreach (NetworkStock::NETWORKS as $network) {
            $networkSales[$network] = $sales->where('network', $network)->sum('quantity');
        }

        return Response::json([
            'total_sales' => $sales->count(),
            'total_quantity' => $sales->sum('quantity'),
            'anomalies' => $checks->where('difference', '!=', 0)->count(),
            'inventory_gaps' => $checks->where('difference', '!=', 0)->values(),
            'network_sales' => $networkSales,
        ]);
    }

    public function show($id)
    {
        $sale = NetworkSale::with('user')->findOrFail($id);
        return Response::json($sale);
    }

    public function update(Request $request, $id)
    {
        $sale = NetworkSale::findOrFail($id);

        $data = $request->validate([
            'client_name' => 'sometimes|string|max:255',
            'client_phone' => 'sometimes|string|max:50',
            'quantity' => 'sometimes|integer|min:1',
            'payment_method' => 'sometimes|string|max:100',
            'stock_before' => 'sometimes|integer|min:0',
            'stock_after' => 'sometimes|integer|min:0',
        ]);

        $sale->update($data);

        return Response::json($sale->fresh());
    }
