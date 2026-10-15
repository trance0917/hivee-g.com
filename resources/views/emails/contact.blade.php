@extends('emails.layout')
@section('contents')

    <p>お問い合わせを承りました。</p>
    <p class="mt-[10px]">内容によってはご返信できない場合もありますが、通常2〜4営業日以内に担当よりご連絡いたします。あらかじめご了承ください。</p>

    <p>---- お問い合わせ情報 ----<br />
        氏名：{{ $contact_data['name'] }}<br />
        お問い合わせ内容：<br />
        {!! nl2br(e($contact_data['message'])) !!}<br />
    --------------------</p>
@endsection

