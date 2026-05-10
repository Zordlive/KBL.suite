<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountBalance extends Model
{
    protected $fillable = [
        'account_name',
        'fc_balance',
        'usd_balance',
        'time_slot',
        'user_id',
        'recorded_at',
    ];

    protected $casts = [
        'fc_balance' => 'decimal:2',
        'usd_balance' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
