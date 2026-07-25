<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;

class CartService
{
    public function getOrCreate(int $userId): Cart
    {
        return Cart::firstOrCreate(['user_id' => $userId]);
    }

    public function addItem(int $userId, array $data): CartItem
    {
        $cart = $this->getOrCreate($userId);
        $item = CartItem::firstOrNew([
            'cart_id' => $cart->id,
            'product_id' => $data['product_id'],
        ]);
        $item->vendor_id = $data['vendor_id'];
        $item->quantity = ($item->exists ? $item->quantity : 0) + ($data['quantity'] ?? 1);
        $item->save();
        return $item;
    }

    public function removeItem(int $userId, int $cartItemId): void
    {
        $cart = $this->getOrCreate($userId);
        CartItem::where('id', $cartItemId)->where('cart_id', $cart->id)->delete();
    }

    public function clearCart(int $userId): void
    {
        $cart = Cart::where('user_id', $userId)->first();
        if ($cart) {
            $cart->items()->delete();
        }
    }
}
