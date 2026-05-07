<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        return response()->json($request->user()->load('roles'));
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Votre compte doit être validé par un administrateur avant activation.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('roles'),
            'token' => $token,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'agent_number' => 'required|string|max:50|unique:users,agent_number',
            'gender' => 'required|in:male,female,other',
            'position' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:agent,super_agent',
        ]);

        $status = $request->role === 'super_agent' ? 'pending' : 'active';

        $user = User::create([
            'name' => $request->name,
            'agent_number' => $request->agent_number,
            'gender' => $request->gender,
            'position' => $request->position,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => $status,
        ]);

        $user->assignRole($request->role === 'agent' ? 'agent' : 'super_agent');

        if ($status === 'pending') {
            return response()->json([
                'message' => 'Votre compte Super Agent a été créé et attend la validation de l’administrateur.',
            ], 202);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('roles'),
            'token' => $token,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }
}
