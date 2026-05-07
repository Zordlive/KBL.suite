<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function approve(User $user): bool
    {
        return $user->hasRole('administrator');
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole('administrator');
    }
}