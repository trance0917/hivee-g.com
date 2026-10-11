<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

#[Signature('project:dump')]
#[Description('指定フォルダをZIP化して保存する')]
class ProjectDump extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $timestamp = now()->format('Ymd_His');
        $zip_path = storage_path("project-dump_{$timestamp}.zip");

        $cmd = [
            'zip', '-r', $zip_path,
            'app/', 'bootstrap/', 'config/', 'database/', 'public/', 'resources/', 'routes/',
            '.env', 'composer.json', 'package.json', 'vite.config.js',
        ];

        // LaravelのProcessファサードでスッキリ実行
        $result = Process::run($cmd);

        if ($result->failed()) {
            $this->error('ZIP作成失敗: '.$result->errorOutput());

            return self::FAILURE;
        }

        chmod($zip_path, 0777);
        $this->info("✅ 作成成功: $zip_path");
        $this->info(now()->format('Ymd_His'));

        return self::SUCCESS;
    }
}
