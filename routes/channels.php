<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// 個人チャット: 内部キャラクターIDを用い、その所有者だけに購読を許可する。
Broadcast::channel('chat.character.{characterId}', function ($user, $characterId): bool {
    if (!ctype_digit((string) $characterId)) {
        return false;
    }

    return \App\Models\Character::query()
        ->whereKey((int) $characterId)
        ->where('user_id', $user->id)
        ->exists();
});


Broadcast::channel('chat.village.{villageId}', function ($user, $villageId): bool {
    if (!ctype_digit((string) $villageId) || $user->active_character_id === null) {
        return false;
    }

    return \App\Models\Character::query()
        ->whereKey($user->active_character_id)
        ->where('user_id', $user->id)
        ->where('village_id', (int) $villageId)
        ->exists();
});
