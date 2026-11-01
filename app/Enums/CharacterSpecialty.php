<?php

namespace App\Enums;

enum CharacterSpecialty: int
{
    case Hunting = 1;   // 狩猟：素材収集時間短縮
    case Gathering = 2; // 採集：レア獲得率増加
}
