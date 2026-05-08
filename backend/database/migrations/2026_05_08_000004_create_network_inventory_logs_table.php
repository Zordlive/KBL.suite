<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_check_id')->constrained('network_inventory_checks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action');
            $table->integer('previous_counted_quantity')->nullable();
            $table->integer('new_counted_quantity')->nullable();
            $table->integer('previous_difference')->nullable();
            $table->integer('new_difference')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_inventory_logs');
    }
};
