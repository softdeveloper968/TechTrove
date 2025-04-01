// CaptchaComponent.tsx
import React, { useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

interface CaptchaComponentProps {
    onVerify: (token: string) => void;
}

const CloudflareCaptcha: React.FC<CaptchaComponentProps> = ({ onVerify }) => {
    const turnstileRef = useRef<any>(null);
    const captchaKey = process.env.REACT_APP_CAPTCHA_KEY ?? "";
    const handleSuccess = (token: string) => {
        onVerify(token);
    };

    return (
        <div>
            <Turnstile
                siteKey={captchaKey}
                onSuccess={handleSuccess}
                ref={turnstileRef}
            />
        </div>
    );
};

export default CloudflareCaptcha;
