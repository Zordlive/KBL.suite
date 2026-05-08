<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('network_inventory_checks', function (Blueprint $table) {
            $table->enum('check_type', ['opening', 'evening'])->default('evening')->after('difference');
        });

        Schema::table('network_inventory_checks', function (Blueprint $table) {
            $table->dropUnique(['network', 'checked_at']);
            $table->unique(['network', 'checked_at', 'check_type']);
        });
    }

    public function down(): void
    {
        Schema::table('network_inventory_checks', function (Blueprint $table) {
            $table->dropUnique(['network', 'checked_at', 'check_type']);
            $table->unique(['network', 'checked_at']);
            $table->dropColumn('check_type');
        });
    }
};
