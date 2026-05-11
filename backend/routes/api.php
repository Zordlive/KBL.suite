<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\NetworkInventoryCheckController;
use App\Http\Controllers\Api\V1\NetworkSaleController;
use App\Http\Controllers\Api\V1\NetworkStockController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\SaleController;
use App\Http\Controllers\Api\V1\StockController;
use App\Http\Controllers\Api\V1\AccountBalanceController;
use App\Http\Controllers\Api\V1\UserController;

Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'me']);

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User management
    Route::get('admin/users', [UserController::class, 'index']);
    Route::put('admin/users/{user}/role', [UserController::class, 'updateRole']);
    Route::get('admin/stats', [\App\Http\Controllers\Api\V1\AdminController::class, 'stats']);
    Route::get('exchange-rate', [\App\Http\Controllers\Api\V1\AdminController::class, 'getExchangeRate']);
    Route::put('exchange-rate', [\App\Http\Controllers\Api\V1\AdminController::class, 'updateExchangeRate']);

    Route::get('users/pending-super-agents', [UserController::class, 'pendingSuperAgents'])->middleware('permission:approve super agents');
    Route::post('users/{user}/approve', [UserController::class, 'approve'])->middleware('permission:approve super agents');

    // Products
    Route::get('products', [ProductController::class, 'index'])->middleware('permission:view products');
    Route::post('products', [ProductController::class, 'store'])->middleware('permission:create products');
    Route::get('products/{product}', [ProductController::class, 'show'])->middleware('permission:view products');
    Route::put('products/{product}', [ProductController::class, 'update'])->middleware('permission:edit products');
    Route::delete('products/{product}', [ProductController::class, 'destroy'])->middleware('permission:delete products');

    // Stocks
    Route::apiResource('stocks', StockController::class);

    // Sales
    Route::get('sales', [SaleController::class, 'index'])->middleware('permission:view sales');
    Route::post('sales', [SaleController::class, 'store'])->middleware('permission:create sales');
    Route::get('sales/{sale}', [SaleController::class, 'show'])->middleware('permission:view sales');
    Route::put('sales/{sale}', [SaleController::class, 'update'])->middleware('permission:edit sales');
    Route::delete('sales/{sale}', [SaleController::class, 'destroy'])->middleware('permission:delete sales');
    Route::post('sales/{sale}/items', [SaleController::class, 'addItem']);
    Route::delete('sales/{sale}/items/{item}', [SaleController::class, 'removeItem']);

    // Stock module
    Route::get('stock-module/stocks', [NetworkStockController::class, 'index']);
    Route::put('stock-module/stocks/{network}', [NetworkStockController::class, 'update']);
    Route::get('stock-module/checks/today', [NetworkInventoryCheckController::class, 'today']);
    Route::post('stock-module/checks', [NetworkInventoryCheckController::class, 'store']);
    Route::put('stock-module/checks/{check}', [NetworkInventoryCheckController::class, 'update']);
    Route::get('stock-module/inventories/today', [NetworkInventoryCheckController::class, 'today']);
    Route::post('stock-module/inventories', [NetworkInventoryCheckController::class, 'store']);
    Route::get('stock-module/inventories/logs', [NetworkInventoryCheckController::class, 'logs']);
    Route::get('stock-module/sales', [NetworkSaleController::class, 'index']);
    Route::post('stock-module/sales', [NetworkSaleController::class, 'store']);
    Route::get('stock-module/summary', [NetworkSaleController::class, 'summary']);

    // Inventories
    Route::get('inventories', [InventoryController::class, 'index'])->middleware('permission:view inventory');
    Route::post('inventories', [InventoryController::class, 'store'])->middleware('permission:create inventory');
    Route::get('inventories/{inventory}', [InventoryController::class, 'show'])->middleware('permission:view inventory');
    Route::put('inventories/{inventory}', [InventoryController::class, 'update'])->middleware('permission:edit inventory');
    Route::delete('inventories/{inventory}', [InventoryController::class, 'destroy'])->middleware('permission:delete inventory');
    Route::post('inventories/{inventory}/items', [InventoryController::class, 'addItem']);
    Route::put('inventories/{inventory}/items/{item}', [InventoryController::class, 'updateItem']);

    // Account Balances
    Route::apiResource('account-balances', AccountBalanceController::class);
});
