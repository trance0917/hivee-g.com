<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding:10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f1f5f9;
            color: #020617;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 18px 15px 15px;
            border-radius: 8px;
        }
        h1 {
            font-size: 18px;
            margin-bottom: 16px;
        }
        p {
            margin:0.8em 0;
            line-height: 1.6;
            font-size: 16px;
        }

        p.text-sm {
            line-height: 1.6;
            font-size: 14px;
        }
        ul{
            list-style-type:none;
            padding:0;
            margin:0;
        }
        ul>li{
            margin-bottom:8px;
            line-height: 1.5;
        }
        ul>li:last-child{
            margin-bottom:0;
        }
        .footer {
            margin-top: 24px;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
        @media (max-width: 600px) {
            .container {
                padding: 15px 10px 10px;
            }
        }

        .text-slate-600{
            color:#475569;
        }
    </style>
</head>
<body>
<div class="container">
    <div style="margin-bottom:20px;text-align:center;"><a href="{{env('APP_URL')}}"><img width="180" src="{{ $message->embed(public_path('/assets/images/logo.svg')) }}"></a></div>

    @yield('contents')

    <p style="margin-bottom:0;"><a style="color:#f472b6;text-decoration:underline;" href="{{env('APP_URL')}}">{{env('APP_URL')}}</a></p>
</div>


<div class="footer">
    &copy; {{ date('Y') }} 恋バナch. All rights reserved.
</div>
</div>
</body>
</html>
