<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// 個人チャットはアカウント単位。キャラクターの選択状態に依存しない。
Broadcast::channel('chat.user.{userId}', function ($user, $userId): bool {
    return ctype_digit((string) $userId) && (int) $user->id === (int) $userId;
});

// 村チャットは妖精の滞在村ではなく、ユーザーの所属村の住民だけが購読できる。
Broadcast::channel('chat.village.{villageId}', function ($user, $villageId): bool {
    return ctype_digit((string) $villageId)
        && $user->village_id !== null
        && (int) $user->village_id === (int) $villageId;
});
