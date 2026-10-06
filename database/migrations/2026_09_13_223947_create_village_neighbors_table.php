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
        Schema::create('village_neighbors', function (Blueprint $table) {
            $table->id();
            $table->string('hex_id', 32)->index();
            $table->string('neighbor_hex_id', 32)->index();

            $table->unique(['hex_id', 'neighbor_hex_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('village_neighbors');
    }
};
