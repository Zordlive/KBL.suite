<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $admin = User::factory()->create([
            'name' => 'Administrateur',
            'agent_number' => 'ADMIN-001',
            'gender' => 'other',
            'position' => 'Administrateur',
            'email' => 'admin@klb.suite',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $admin->assignRole('administrator');

        $agent = User::factory()->create([
            'name' => 'Agent Test',
            'agent_number' => 'AGENT-001',
            'gender' => 'male',
            'position' => 'Agent terrain',
            'email' => 'agent@klb.suite',
            'password' => bcrypt('password'),
            'status' => 'active',
        ]);
        $agent->assignRole('agent');
    }
}
