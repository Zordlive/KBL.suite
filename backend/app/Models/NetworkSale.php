<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class NetworkSale extends Model
{
    protected $fillable = [
        'user_id',
        'client_type',
        'client_name',
        'client_phone',
        'network',
        'quantity',
        'purchase_type',
        'payment_method',
        'stock_before',
        'stock_after',
        'sale_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'stock_before' => 'integer',
        'stock_after' => 'integer',
        'sale_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
