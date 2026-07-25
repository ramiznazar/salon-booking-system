<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\User;

class NotificationService
{
    public function notifyUser(int $userId, string $event, string $title, array $payload = [], string $channel = 'in_app'): NotificationLog
    {
        return NotificationLog::create([
            'user_id' => $userId,
            'channel' => $channel,
            'event'   => $event,
            'title'   => $title,
            'payload' => $payload,
            'read_at' => null,
            'sent_at' => now(),
        ]);
    }

    public function notifyVendor(\App\Models\Vendor $vendor, string $event, string $title, array $payload = []): NotificationLog
    {
        return $this->notifyUser($vendor->user_id, $event, $title, $payload, 'panel');
    }

    public function notifyAdmin(string $event, string $title, array $payload = []): void
    {
        $admins = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            $this->notifyUser($adminId, $event, $title, $payload, 'panel');
        }
    }

    public function getUnread(int $userId, int $limit = 20)
    {
        return NotificationLog::where('user_id', $userId)
            ->whereNull('read_at')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getPaginated(int $userId, int $perPage = 30)
    {
        return NotificationLog::where('user_id', $userId)
            ->latest()
            ->paginate($perPage);
    }

    public function unreadCount(int $userId): int
    {
        return NotificationLog::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    public function markRead(int $userId): void
    {
        NotificationLog::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function newOrdersCount(int $vendorUserId): int
    {
        return NotificationLog::where('user_id', $vendorUserId)
            ->where('event', 'new_order')
            ->whereNull('read_at')
            ->count();
    }

    public function markOrdersSeen(int $vendorUserId): void
    {
        NotificationLog::where('user_id', $vendorUserId)
            ->where('event', 'new_order')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
