SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `characters` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'キャラクター内部ID（DB内の関連付け用）',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '所有ユーザーID（users.id）',
  `village_id` bigint(20) unsigned NOT NULL COMMENT '妖精の滞在村ID（villages.id）。ユーザー所属村users.village_idとは別',
  `slot` tinyint(3) unsigned NOT NULL DEFAULT '1' COMMENT 'キャラクター枠番号（1～3）。枠解放・範囲検証はアプリ側で判定',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '表示キャラクター名（変更可能）',
  `specialty` tinyint(3) unsigned NOT NULL COMMENT '得意分野：1=狩猟、2=採集',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'キャラクター画像のパス。NULLなら既定画像',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '作成日時',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '更新日時',
  PRIMARY KEY (`id`),
  UNIQUE KEY `characters_user_slot_unique` (`user_id`,`slot`),
  KEY `characters_village_id_foreign` (`village_id`),
  CONSTRAINT `characters_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `characters_village_id_foreign` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_bans` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '茶禁レコードID',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '発言禁止の対象アカウントID（キャラクター変更後も禁止）',
  `moderator_user_id` bigint(20) unsigned DEFAULT NULL COMMENT '茶禁を登録した管理者ID。自動判定ならNULL',
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '茶禁理由（管理用）',
  `expires_at` datetime DEFAULT NULL COMMENT '茶禁終了日時。NULLは無期限。早期解除は現在日時に更新',
  `created_at` timestamp NULL DEFAULT NULL COMMENT '茶禁登録日時',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT '最終更新日時（解除操作による期限変更時も更新）',
  PRIMARY KEY (`id`),
  KEY `chat_bans_moderator_user_id_foreign` (`moderator_user_id`),
  KEY `cb_active_user_idx` (`user_id`,`expires_at`),
  CONSTRAINT `chat_bans_moderator_user_id_foreign` FOREIGN KEY (`moderator_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chat_bans_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'チャットID。最新50件や過去履歴のカーソル取得に使用',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '送信アカウントID（users.id）。茶禁・権限チェック用',
  `sender_user_text_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '送信時点のユーザー公開IDの控え',
  `type` tinyint(3) unsigned NOT NULL COMMENT '1=滞在村、2=所属村、3=全体、4=DM、5=都道府県、6=同盟、7=周囲3マス、8=周囲6マス',
  `target_id` bigint(20) unsigned DEFAULT NULL COMMENT 'チャット範囲のID（滞在村・所属村・都道府県・同盟）。DM・全体・周辺はNULL',
  `recipient_user_id` bigint(20) unsigned DEFAULT NULL COMMENT 'DMの受信アカウントID。宛先キャラクターの所有者（type=4のみ）',
  `recipient_user_text_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DM送信時点の宛先ユーザー公開IDの控え',
  `origin_h3` char(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '周辺チャット送信時のH3セルID（固定解像度の16進表記）',
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'チャット本文。最大文字数は送信APIで検証',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '送信元IPアドレス（IPv4・IPv6対応、運営確認用）',
  `user_agent` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '送信時のUser-Agent（運営確認用。APIレスポンスには原則含めない）',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '送信受付日時（履歴表示・並び替えに利用）',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT 'メッセージ最終更新日時',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '管理削除日時。NULLは通常表示',
  PRIMARY KEY (`id`),
  KEY `chat_messages_user_id_foreign` (`user_id`),
  KEY `chat_messages_recipient_user_id_foreign` (`recipient_user_id`),
  KEY `cm_scope_latest_idx` (`type`,`target_id`,`id`),
  KEY `cm_h3_latest_idx` (`type`,`origin_h3`,`id`),
  KEY `cm_dm_inbox_idx` (`type`,`recipient_user_id`,`id`),
  KEY `cm_dm_outbox_idx` (`type`,`user_id`,`id`),
  CONSTRAINT `chat_messages_recipient_user_id_foreign` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chat_messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '通知のユニークID',
  `user_id` bigint(20) unsigned NOT NULL,
  `notification_type` int(11) NOT NULL COMMENT '通知タイプ',
  `related_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_id` bigint(20) unsigned DEFAULT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '何かしらのデータ',
  `read_at` timestamp NULL DEFAULT NULL COMMENT '既読日時（nullなら未読）',
  `notified_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '通知日時',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_related_type_related_id_index` (`related_type`,`related_id`),
  KEY `notifications_user_id_read_at_notified_at_index` (`user_id`,`read_at`,`notified_at`),
  KEY `notifications_notification_type_index` (`notification_type`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `prefectures` (
  `id` smallint(5) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `view_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `furigana` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_sort` smallint(6) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `telescope_entries` (
  `sequence` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `family_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `should_display_on_index` tinyint(1) NOT NULL DEFAULT '1',
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`sequence`),
  UNIQUE KEY `telescope_entries_uuid_unique` (`uuid`),
  KEY `telescope_entries_batch_id_index` (`batch_id`),
  KEY `telescope_entries_family_hash_index` (`family_hash`),
  KEY `telescope_entries_created_at_index` (`created_at`),
  KEY `telescope_entries_type_should_display_on_index_index` (`type`,`should_display_on_index`)
) ENGINE=InnoDB AUTO_INCREMENT=458670 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `telescope_entries_tags` (
  `entry_uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`entry_uuid`,`tag`),
  KEY `telescope_entries_tags_tag_index` (`tag`),
  CONSTRAINT `telescope_entries_tags_entry_uuid_foreign` FOREIGN KEY (`entry_uuid`) REFERENCES `telescope_entries` (`uuid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `telescope_monitoring` (
  `tag` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `terrains` (
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `movement_cost` decimal(4,2) NOT NULL DEFAULT '1.00',
  `can_pass` tinyint(1) NOT NULL DEFAULT '1',
  `is_developable` tinyint(1) DEFAULT NULL,
  `default_resources` json DEFAULT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#3b82f6',
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_social_accounts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ソーシャルログインプロバイダ名',
  `provider_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'プロバイダ側のユーザーID',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_social_accounts_provider_provider_id_unique` (`provider`,`provider_id`),
  KEY `user_social_accounts_user_id_foreign` (`user_id`),
  CONSTRAINT `user_social_accounts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '公開ID（文字列）',
  `village_id` bigint(20) unsigned DEFAULT NULL COMMENT 'ユーザーの所属村ID（villages.id）。妖精の滞在村とは別',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'アバター画像のパス',
  `x_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'X(旧Twitter)のID',
  `instagram_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'InstagramのID',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `api_token` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'API用トークン',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT '削除日時',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_text_id_unique` (`text_id`),
  UNIQUE KEY `users_api_token_unique` (`api_token`),
  KEY `users_village_id_foreign` (`village_id`),
  CONSTRAINT `users_village_id_foreign` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `village_neighbors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hex_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `neighbor_hex_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `village_neighbors_hex_id_neighbor_hex_id_unique` (`hex_id`,`neighbor_hex_id`),
  KEY `village_neighbors_hex_id_index` (`hex_id`),
  KEY `village_neighbors_neighbor_hex_id_index` (`neighbor_hex_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15545 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `villages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hex_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `terrain_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'plain',
  `level` int(10) unsigned NOT NULL DEFAULT '1',
  `points` bigint(20) unsigned NOT NULL DEFAULT '0',
  `can_pass` tinyint(1) DEFAULT NULL,
  `is_developable` tinyint(1) DEFAULT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `prefecture_id` smallint(5) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `villages_hex_id_unique` (`hex_id`),
  KEY `villages_terrain_code_foreign` (`terrain_code`),
  KEY `villages_hex_id_index` (`hex_id`),
  KEY `villages_prefecture_id_foreign` (`prefecture_id`),
  CONSTRAINT `villages_prefecture_id_foreign` FOREIGN KEY (`prefecture_id`) REFERENCES `prefectures` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `villages_terrain_code_foreign` FOREIGN KEY (`terrain_code`) REFERENCES `terrains` (`code`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3385 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
