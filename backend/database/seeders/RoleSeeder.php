<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'view products',
            'create products',
            'edit products',
            'delete products',
            'view sales',
            'create sales',
            'edit sales',
            'delete sales',
            'view inventory',
            'create inventory',
            'edit inventory',
            'delete inventory',
            'approve super agents',
            'manage users',
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permission]);
        }

        $administrator = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'administrator']);
        $administrator->givePermissionTo($permissions);

        $superAgent = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super_agent']);
        $superAgent->givePermissionTo([
            'view products',
            'create products',
            'view sales',
            'create sales',
            'view inventory',
            'create inventory',
        ]);

        $agent = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'agent']);
        $agent->givePermissionTo([
            'view products',
            'create products',
            'view sales',
            'create sales',
        ]);
    }
}
