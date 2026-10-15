@extends('emails.layout')
@section('contents')

    <h1>「恋バナch」へようこそ！☺️</h1>

    <p>会員登録完了🎉<br />ここは恋愛に関する熱い意見交換ができる場所🔥</p>
    <p>相談ができたり、アンケートができたり、男女それぞれの考え方を知って恋愛偏差値を高めていこう❤️</p>
    <p>気持ちよく利用してもらうため、公序良俗に反する書き込みは禁止だよ。<br />ルールを守って楽しんでね！</p>

    <a href="{{route('index')}}" style="
        background:#f472b6;
        border-radius:3px;
        color:white;
        display:inline-block;
        text-decoration:none;
        padding: 8px 10px;
        line-height:1em;
        ">恋バナchはこちら</a>

    <p class="text-sm text-slate-600">【重要】 健全なコミュニティ維持のため、誹謗中傷や脅迫となるコメントは厳禁です。利用規約をチェックしてね。</p>

    <a href="{{route('info.terms')}}" style="
        background:#f472b6;
        border-radius:3px;
        color:white;
        display:inline-block;
        text-decoration:none;
        padding: 6px 7px;
        line-height:1em;
        font-size:14px;
        ">利用規約はこちら</a>

@endsection






