<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_inventory_checks', function (Blueprint $table) {
            $table->id();
            $table->enum('network', ['Orange', 'Airtel', 'Vodacom']);
            $table->integer('counted_quantity');
            $table->integer('expected_quantity');
            $table->integer('difference');
            $table->date('checked_at');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('resolved')->default(false);
            $table->timestamps();
            $table->unique(['network', 'checked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_inventory_checks');
    }
};
