<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_stocks', function (Blueprint $table) {
            $table->id();
            $table->enum('network', ['Orange', 'Airtel', 'Vodacom']);
            $table->integer('quantity')->default(0);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique('network');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_stocks');
    }
};
