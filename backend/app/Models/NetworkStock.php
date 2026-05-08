<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class NetworkStock extends Model
{
    protected $fillable = [
        'network',
        'quantity',
        'updated_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public const NETWORKS = ['Orange', 'Airtel', 'Vodacom'];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
