<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function pendingSuperAgents()
    {
        $users = User::role('super_agent')
            ->where('status', 'pending')
            ->get();

        return response()->json($users);
    }

    public function approve(User $user)
    {
        if (!$user->hasRole('super_agent')) {
            return response()->json(['message' => 'Utilisateur non trouvé ou pas un Super Agent.'], 404);
        }

        $user->status = 'active';
        $user->approved_at = now();
        $user->save();

        return response()->json($user->load('roles'));
    }
}
