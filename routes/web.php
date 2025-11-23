<?php

use Illuminate\Support\Facades\Route;

// Catch all routes and serve React app
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

