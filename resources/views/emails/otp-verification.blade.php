<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - PU Catalyst</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0a0a0f;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            height: 60px;
        }
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            margin-top: 10px;
        }
        h1 {
            color: #ffffff;
            text-align: center;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #a0a0a0;
            text-align: center;
            margin-bottom: 30px;
        }
        .otp-container {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .otp-label {
            color: #a0a0a0;
            font-size: 14px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 12px;
            font-family: 'Courier New', monospace;
        }
        .expiry {
            color: #ff6b6b;
            font-size: 14px;
            margin-top: 15px;
        }
        .message {
            color: #c0c0c0;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .warning {
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 8px;
            padding: 15px;
            color: #ff6b6b;
            font-size: 13px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <div class="logo-text">🚀 PU Catalyst</div>
        </div>
        
        <h1>Verify Your Email</h1>
        <p class="subtitle">Enter this code to verify your email address</p>
        
        <p class="message">
            Hi {{ $userName }},<br><br>
            Thank you for registering with PU Catalyst! To complete your registration and access your account, please use the verification code below:
        </p>
        
        <div class="otp-container">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-code">{{ $otp }}</div>
            <div class="expiry">⏰ This code expires in {{ $expiryMinutes }} minutes</div>
        </div>
        
        <p class="message">
            Enter this code on the verification page to confirm your email address and start your journey with PU Catalyst.
        </p>
        
        <div class="warning">
            ⚠️ If you didn't create an account with PU Catalyst, please ignore this email. Someone may have entered your email address by mistake.
        </div>
        
        <div class="footer">
            <p>© {{ date('Y') }} PU Catalyst. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
