@extends('emails.layout')
@section('contents')

    <p>恋バナchからの通知です</p>

    <p>[通知]<br />{!! $text !!}</p>

    <a href="{{route('index')}}" style="
        background:#f472b6;
        border-radius:3px;
        color:white;
        display:inline-block;
        text-decoration:none;
        padding: 8px 10px;
        line-height:1em;
        margin-top:15px;
        ">恋バナchへ</a>

@endsection






