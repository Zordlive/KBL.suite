<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class NetworkInventoryCheck extends Model
{
    protected $fillable = [
        'network',
        'counted_quantity',
        'expected_quantity',
        'difference',
        'checked_at',
        'user_id',
        'resolved',
    ];

    protected $casts = [
        'counted_quantity' => 'integer',
        'expected_quantity' => 'integer',
        'difference' => 'integer',
        'checked_at' => 'date',
        'resolved' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(NetworkInventoryLog::class, 'inventory_check_id');
    }
}
