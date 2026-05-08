<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NetworkInventoryLog extends Model
{
    protected $fillable = [
        'inventory_check_id',
        'user_id',
        'action',
        'previous_counted_quantity',
        'new_counted_quantity',
        'previous_difference',
        'new_difference',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'previous_counted_quantity' => 'integer',
        'new_counted_quantity' => 'integer',
        'previous_difference' => 'integer',
        'new_difference' => 'integer',
    ];

    public function inventoryCheck(): BelongsTo
    {
        return $this->belongsTo(NetworkInventoryCheck::class, 'inventory_check_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
