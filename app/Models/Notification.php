<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Class Notification
 *
 * @property int $id
 * @property int $user_id
 * @property int $notification_type
 * @property string|null $related_type
 * @property int|null $related_id
 * @property string|null $value
 * @property bool $is_read
 * @property Carbon $notified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property User $user
 * @package App\Models
 * @property-read mixed $formatted_message
 * @property-read Model|\Eloquent|null $related
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereNotificationType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereNotifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereRelatedId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereRelatedType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereValue($value)
 * @mixin \Eloquent
 */
class Notification extends Model
{
	protected $table = 'notifications';

	protected $casts = [
		'user_id' => 'int',
		'notification_type' => 'int',
		'related_id' => 'int',
		'read_at' => 'datetime:y-m-d H:i:s',
		'notified_at' => 'datetime:y-m-d H:i:s',
	];

	protected $fillable = [
		'user_id',
		'notification_type',
		'related_type',
		'related_id',
		'value',
		'read_at',
		'notified_at'
	];


    public const NOTIFICATION_TYPE_WELCOME = 100;

    protected $appends = ['formatted_message'];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

    public function related(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'related_type', 'related_id');
    }

    public function getFormattedMessageAttribute() //formatted_message
    {
        if ($this->notification_type === self::NOTIFICATION_TYPE_WELCOME) {
            return 'Hiveeへようそこ！';
        }

        return "新しい通知が届きました。";
    }
}
