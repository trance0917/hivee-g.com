<?php

namespace App\Enums;

/**
 * hivee のチャット区分。
 * カラーリングは React で管理し、DB には色を保存しない。
 */
enum ChatMessageType: int
{
    case VillageLocal = 1;    // なし: 現在いる村
    case VillageMember = 2;   // #: 所属する村
    case Global = 3;          // $$: 全体
    case Direct = 4;          // @: 個人
    case Prefecture = 5;      // $: 所属都道府県
    case Alliance = 6;        // ##: 村の同盟
    case Nearby3 = 7;        // !: 周囲3マス
    case Nearby6 = 8;        // !!: 周囲6マス

    public function radius(): ?int
    {
        return match ($this) {
            self::Nearby3 => 3,
            self::Nearby6 => 6,
            default => null,
        };
    }
}
