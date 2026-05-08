<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('client_type');
            $table->string('client_name');
            $table->string('client_phone');
            $table->enum('network', ['Orange', 'Airtel', 'Vodacom']);
            $table->integer('quantity');
            $table->string('purchase_type');
            $table->string('payment_method');
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->timestamp('sale_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_sales');
    }
};
