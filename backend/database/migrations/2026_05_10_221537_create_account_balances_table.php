<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('account_balances', function (Blueprint $table) {
            $table->id();
            $table->string('account_name');
            $table->decimal('fc_balance', 15, 2)->default(0);
            $table->decimal('usd_balance', 15, 2)->default(0);
            $table->enum('time_slot', ['Matin', 'Midi'])->default('Matin');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('recorded_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_balances');
    }
};
