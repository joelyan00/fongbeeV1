import { useNavigate } from 'react-router-dom';
import { authApi, setAuth } from '../services/api';

export default function SocialLogin() {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        // Trigger Vercel Redeploy - Real Google Login Implementation
        try {
            // Load Google Script if not present
            if (!(window as any).google) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://accounts.google.com/gsi/client';
                    script.onload = resolve;
                    script.onerror = () => reject(new Error('Google SDK load failed'));
                    document.head.appendChild(script);
                });
            }

            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            if (!clientId) {
                alert('Configuration missing: VITE_GOOGLE_CLIENT_ID');
                return;
            }

            const client = (window as any).google.accounts.oauth2.initCodeClient({
                client_id: clientId,
                scope: 'email profile openid',
                ux_mode: 'popup',
                callback: async (response: any) => {
                    if (response.code) {
                        try {
                            const res = await authApi.googleLogin({ code: response.code });
                            if (res.token) {
                                setAuth(res.token, res.user);
                                navigate('/'); // Redirect to home
                            }
                        } catch (e: any) {
                            console.error('Google Login Error:', e);
                            alert(e.message || 'Google登录失败');
                        }
                    }
                },
            });

            client.requestCode();

        } catch (e: any) {
            console.error(e);
            alert('无法连接Google服务');
        }
    };

    const handleWeChatLogin = () => {
        // Mock WeChat Login QR Code Modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;';
        modal.innerHTML = `
            <div style="background:white;padding:30px;border-radius:12px;text-align:center;width:300px;box-shadow:0 10px 25px rgba(0,0,0,0.1);">
                <h3 style="margin:0 0 20px;font-size:18px;font-weight:bold;color:#333;">微信扫码登录</h3>
                <div style="width:200px;height:200px;background:#f5f5f5;margin:0 auto;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px;border:1px dashed #ddd;">
                    [ 模拟二维码区域 ]
                </div>
                <p style="margin:15px 0 0;font-size:13px;color:#666;">请使用微信扫描上方二维码</p>
                <button id="close-wx-modal" style="margin-top:20px;width:100%;padding:10px;background:#f5f5f5;border:none;border-radius:6px;cursor:pointer;font-weight:bold;color:#666;">取消</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-wx-modal')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    };

    return (
        <div className="mt-8">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                        快捷登录
                    </span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </button>

                <button
                    onClick={handleWeChatLogin}
                    type="button"
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                    <svg className="h-5 w-5 mr-2 text-[#07C160]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.618 10.957c-.439 0-.825.334-.825.795 0 .463.386.848.825.848.441 0 .826-.385.826-.848 0-.461-.385-.795-.826-.795zm9.68 4.793c-.387 0-.709.309-.709.682 0 .374.322.682.709.682.388 0 .71-.308.71-.682 0-.373-.322-.682-.71-.682zm-4.739.025c-.388 0-.71.309-.71.682 0 .374.322.682.71.682.387 0 .709-.308.709-.682 0-.373-.322-.682-.709-.682zM24 14.864c0-3.354-3.328-6.072-7.434-6.072-.801 0-1.57.106-2.302.301.768-3.033 3.424-5.32 6.578-5.32C26.062 3.773 30 6.64 30 10.165c0 2.226-1.572 4.195-3.992 5.328l1.01 2.508-3.353-1.674c-1.373.49-2.859.738-4.398.738h-.469c.848-1.077 3.39-4.226 5.202-2.201zM8.563 1.708c-4.724 0-8.563 3.328-8.563 7.411 0 2.392 1.442 4.512 3.665 5.824l-1.01 2.973 3.823-1.928c1.344.438 2.51.642 3.354.642 4.722 0 8.562-3.328 8.562-7.411 0-4.083-3.84-7.511-8.562-7.511z" />
                    </svg>
                    微信
                </button>
            </div>
        </div>
    );
}
