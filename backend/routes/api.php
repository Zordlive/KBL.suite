<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\SaleController;
use App\Http\Controllers\Api\V1\StockController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'me']);

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User management
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

    // Inventories
    Route::get('inventories', [InventoryController::class, 'index'])->middleware('permission:view inventory');
    Route::post('inventories', [InventoryController::class, 'store'])->middleware('permission:create inventory');
    Route::get('inventories/{inventory}', [InventoryController::class, 'show'])->middleware('permission:view inventory');
    Route::put('inventories/{inventory}', [InventoryController::class, 'update'])->middleware('permission:edit inventory');
    Route::delete('inventories/{inventory}', [InventoryController::class, 'destroy'])->middleware('permission:delete inventory');
    Route::post('inventories/{inventory}/items', [InventoryController::class, 'addItem']);
    Route::put('inventories/{inventory}/items/{item}', [InventoryController::class, 'updateItem']);
});
