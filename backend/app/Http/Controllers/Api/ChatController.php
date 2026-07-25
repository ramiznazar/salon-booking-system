<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    // ─── Customer: start or retrieve a conversation with a vendor ───────────
    public function startOrGet(Request $request, $vendorId)
    {
        $user = Auth::user();
        $vendor = Vendor::findOrFail($vendorId);

        $conversation = Conversation::firstOrCreate(
            ['user_id' => $user->id, 'vendor_id' => $vendor->id],
            ['last_message_at' => now()]
        );

        return response()->json(['data' => $this->formatConversation($conversation->load(['vendor', 'user']))]);
    }

    // ─── Customer: list my conversations ────────────────────────────────────
    public function myConversations(Request $request)
    {
        $user = Auth::user();

        $conversations = Conversation::where('user_id', $user->id)
            ->with(['vendor', 'messages' => fn($q) => $q->latest()->limit(1)])
            ->withCount(['messages as unread_count' => fn($q) => $q
                ->where('sender_type', 'vendor')
                ->whereNull('read_at')])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn($c) => $this->formatConversation($c));

        return response()->json(['data' => $conversations]);
    }

    // ─── Customer: get messages in a conversation ────────────────────────────
    public function messages(Request $request, $conversationId)
    {
        $user = Auth::user();
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Mark vendor messages as read
        Message::where('conversation_id', $conversation->id)
            ->where('sender_type', 'vendor')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()->orderBy('created_at')->get()->map(fn($m) => $this->formatMessage($m));

        return response()->json(['data' => $messages]);
    }

    // ─── Customer: send a message ────────────────────────────────────────────
    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'body'      => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:2048',
        ]);
        $user = Auth::user();
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_type'     => 'user',
            'sender_id'       => $user->id,
            'body'            => $request->body ?? '',
            'image_url'       => $request->image_url,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json(['data' => $this->formatMessage($message)], 201);
    }

    // ─── Customer: clear all messages in a conversation ──────────────────────
    public function clearMessages(Request $request, $conversationId)
    {
        $user = Auth::user();
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        Message::where('conversation_id', $conversation->id)->delete();
        $conversation->update(['last_message_at' => null]);

        return response()->json(['data' => ['cleared' => true]]);
    }

    // ─── Vendor: list all conversations ─────────────────────────────────────
    public function vendorConversations(Request $request)
    {
        $vendor = Auth::user()->vendor;

        $conversations = Conversation::where('vendor_id', $vendor->id)
            ->with(['user', 'messages' => fn($q) => $q->latest()->limit(1)])
            ->withCount(['messages as unread_count' => fn($q) => $q
                ->where('sender_type', 'user')
                ->whereNull('read_at')])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn($c) => $this->formatConversation($c));

        return response()->json(['data' => $conversations]);
    }

    // ─── Vendor: get messages in a conversation ──────────────────────────────
    public function vendorMessages(Request $request, $conversationId)
    {
        $vendor = Auth::user()->vendor;
        $conversation = Conversation::where('id', $conversationId)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        // Mark user messages as read
        Message::where('conversation_id', $conversation->id)
            ->where('sender_type', 'user')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()->orderBy('created_at')->get()->map(fn($m) => $this->formatMessage($m));

        return response()->json(['data' => $messages]);
    }

    // ─── Vendor: send a reply ────────────────────────────────────────────────
    public function vendorSendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'body'      => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:2048',
        ]);
        $vendor = Auth::user()->vendor;
        $conversation = Conversation::where('id', $conversationId)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_type'     => 'vendor',
            'sender_id'       => $vendor->id,
            'body'            => $request->body ?? '',
            'image_url'       => $request->image_url,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json(['data' => $this->formatMessage($message)], 201);
    }

    // ─── Vendor: clear all messages in a conversation ────────────────────────
    public function vendorClearMessages(Request $request, $conversationId)
    {
        $vendor = Auth::user()->vendor;
        $conversation = Conversation::where('id', $conversationId)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        Message::where('conversation_id', $conversation->id)->delete();
        $conversation->update(['last_message_at' => null]);

        return response()->json(['data' => ['cleared' => true]]);
    }

    // ─── Unread count for vendor badge ───────────────────────────────────────
    public function vendorUnreadCount(Request $request)
    {
        $vendor = Auth::user()->vendor;
        $count = Message::whereHas('conversation', fn($q) => $q->where('vendor_id', $vendor->id))
            ->where('sender_type', 'user')
            ->whereNull('read_at')
            ->count();

        return response()->json(['data' => ['unread' => $count]]);
    }

    // ─── Unread count for customer badge ─────────────────────────────────────
    public function myUnreadCount(Request $request)
    {
        $user = Auth::user();
        $count = Message::whereHas('conversation', fn($q) => $q->where('user_id', $user->id))
            ->where('sender_type', 'vendor')
            ->whereNull('read_at')
            ->count();

        return response()->json(['data' => ['unread' => $count]]);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    private function formatConversation(Conversation $c): array
    {
        $last = $c->messages->sortByDesc('created_at')->first();
        return [
            'id'              => $c->id,
            'user'            => $c->user ? ['id' => $c->user->id, 'name' => $c->user->name] : null,
            'vendor'          => $c->vendor ? ['id' => $c->vendor->id, 'name' => $c->vendor->name, 'logo_url' => $c->vendor->logo_url] : null,
            'last_message'    => $last ? ['body' => $last->body, 'image_url' => $last->image_url, 'sender_type' => $last->sender_type, 'created_at' => $last->created_at] : null,
            'unread_count'    => (int) ($c->unread_count ?? 0),
            'last_message_at' => $c->last_message_at,
            'created_at'      => $c->created_at,
        ];
    }

    private function formatMessage(Message $m): array
    {
        return [
            'id'          => $m->id,
            'sender_type' => $m->sender_type,
            'sender_id'   => $m->sender_id,
            'body'        => $m->body,
            'image_url'   => $m->image_url,
            'read_at'     => $m->read_at,
            'created_at'  => $m->created_at,
        ];
    }
}
