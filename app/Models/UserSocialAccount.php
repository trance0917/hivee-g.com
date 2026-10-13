<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use App\Models\Traits\SelectAccessorTrait;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserSocialAccount
 *
 * @property int $id
 * @property int $user_id
 * @property string $provider
 * @property string $provider_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property User $user
 * @package App\Models
 * @property-read mixed $provider_name
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount selectAccessor(array $keys, string $value = '')
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount whereProvider($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount whereProviderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSocialAccount whereUserId($value)
 * @mixin \Eloquent
 */
class UserSocialAccount extends Model
{
    use SelectAccessorTrait;
	protected $table = 'user_social_accounts';

	protected $casts = [
		'user_id' => 'int'
	];

	protected $fillable = [
		'user_id',
		'provider',
		'provider_id'
	];

    public const PROVIDERS = [
        'android' => 'Android',
        'ios' => 'iOS',
        'google' => 'Google',
        'twitter' => 'X',
        'line' => 'LINE',
        'tiktok' => 'TikTok',
        'apple' => 'Apple',
    ];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

    public function getProviderNameAttribute() { // provider_name
        return self::PROVIDERS[$this->provider] ?? null;
    }
}
