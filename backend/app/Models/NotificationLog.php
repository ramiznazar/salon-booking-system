<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = ['user_id', 'channel', 'event', 'title', 'payload', 'sent_at', 'read_at'];
    protected $casts = ['payload' => 'array', 'sent_at' => 'datetime', 'read_at' => 'datetime'];
}
