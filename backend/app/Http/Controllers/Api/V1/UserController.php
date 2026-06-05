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

    public function index(Request $request)
    {
        if (!$request->user()->hasRole('administrator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $users = User::with('roles')->get();

        return response()->json($users);
    }

    public function updateRole(Request $request, User $user)
    {
        if (!$request->user()->hasRole('administrator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'role' => 'required|in:agent,super_agent,administrator',
        ]);

        $role = $request->input('role');

        $user->syncRoles([$role]);
        $user->status = $role === 'super_agent' && $user->status === 'pending'
            ? 'pending'
            : 'active';
        $user->save();

        return response()->json($user->load('roles'));
    }

    public function updateStatus(Request $request, User $user)
    {
        if (!$request->user()->hasRole('administrator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:active,suspended,pending',
        ]);

        $user->status = $request->input('status');
        $user->save();

        return response()->json($user->load('roles'));
    }

    public function update(Request $request, User $user)
    {
        if (!$request->user()->hasRole('administrator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:agent,super_agent,administrator',
        ]);

        if ($request->filled('name')) {
            $user->name = $request->input('name');
        }

        if ($request->filled('email')) {
            $user->email = $request->input('email');
        }

        if ($request->filled('role')) {
            $user->syncRoles([$request->input('role')]);
        }

        $user->save();

        return response()->json($user->load('roles'));
    }

    public function destroy(Request $request, User $user)
    {
        if (!$request->user()->hasRole('administrator')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent deleting the authenticated user
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
