import { useNavigate } from 'react-router-dom';
import { authApi, setAuth } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function SocialLogin() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleGoogleLogin = async () => {
        // Trigger Vercel Redeploy - Real Google Login Implementation
        try {
            // Load Google Script if not present
            if (!(window as any).google?.accounts) {
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
                showToast('Configuration missing: VITE_GOOGLE_CLIENT_ID', 'error');
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
                            showToast(e.message || 'Google登录失败', 'error');
                        }
                    }
                },
            });

            client.requestCode();

        } catch (e: any) {
            console.error(e);
            showToast('无法连接Google服务', 'error');
        }
    };

    const handleAppleLogin = () => {
        showToast('Apple ID 登录即将推出', 'info');
    };

    const handleWeChatLogin = () => {
        // Mock WeChat Login QR Code Modal
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;';
        modal.innerHTML = `
            <div style="background:white;padding:40px;border-radius:28px;text-align:center;width:340px;box-shadow:0 20px 50px rgba(0,0,0,0.2);">
                <div style="width:64px;height:64px;background:#07C160;border-radius:18px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(7,193,96,0.2);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M8.618 10.957c-.439 0-.825.334-.825.795 0 .463.386.848.825.848.441 0 .826-.385.826-.848 0-.461-.385-.795-.826-.795zm9.68 4.793c-.387 0-.709.309-.709.682 0 .374.322.682.709.682.388 0 .71-.308.71-.682 0-.373-.322-.682-.71-.682zm-4.739.025c-.388 0-.71.309-.71.682 0 .374.322.682.71.682.387 0 .709-.308.709-.682 0-.373-.322-.682-.709-.682zM24 14.864c0-3.354-3.328-6.072-7.434-6.072-.801 0-1.57.106-2.302.301.768-3.033 3.424-5.32 6.578-5.32C26.062 3.773 30 6.64 30 10.165c0 2.226-1.572 4.195-3.992 5.328l1.01 2.508-3.353-1.674c-1.373.49-2.859.738-4.398.738h-.469c.848-1.077 3.39-4.226 5.202-2.201zM8.563 1.708c-4.724 0-8.563 3.328-8.563 7.411 0 2.392 1.442 4.512 3.665 5.824l-1.01 2.973 3.823-1.928c1.344.438 2.51.642 3.354.642 4.722 0 8.562-3.328 8.562-7.411 0-4.083-3.84-7.511-8.562-7.511z" /></svg>
                </div>
                <h3 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#111827;">微信扫码登录</h3>
                <p style="margin:0 0 25px;font-size:14px;color:#6b7280;">请使用微信扫描下方二维码</p>
                <div style="width:200px;height:200px;background:#f9fafb;margin:0 auto;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px;border:2px solid #f3f4f6;border-radius:16px;">
                    [ 二维码区域 ]
                </div>
                <button id="close-wx-modal" style="margin-top:30px;width:100%;padding:14px;background:#f3f4f6;border:none;border-radius:14px;cursor:pointer;font-weight:700;color:#4b5563;transition:all 0.2s;">取消</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('close-wx-modal')?.addEventListener('mouseover', function () {
            this.style.background = '#e5e7eb';
        });
        document.getElementById('close-wx-modal')?.addEventListener('mouseout', function () {
            this.style.background = '#f3f4f6';
        });

        document.getElementById('close-wx-modal')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    };

    return (
        <div className="mt-10">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-400 font-semibold uppercase tracking-wider text-xs">
                        快捷登录
                    </span>
                </div>
            </div>

            <div className="mt-8 flex justify-around px-4">
                <div className="flex flex-col items-center group">
                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        className="w-14 h-14 flex items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
                        title="Google 登录"
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#DB4437" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </button>
                    <span className="mt-2 text-xs text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Google</span>
                </div>

                <div className="flex flex-col items-center group">
                    <button
                        onClick={handleAppleLogin}
                        type="button"
                        className="w-14 h-14 flex items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
                        title="Apple ID 登录"
                    >
                        <svg className="h-6 w-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.062 13.136c.01 3.12 2.723 4.156 2.75 4.168-.024.08-.432 1.48-1.42 2.924-.853 1.246-1.74 2.484-3.132 2.51-1.364.024-1.804-.805-3.367-.805-1.564 0-2.05.783-3.344.832-1.343.05-2.324-1.344-3.184-2.585-1.758-2.54-3.1-7.173-1.282-10.32 1.05-1.815 1.914-2.955 3.39-2.977 1.12-.02 2.17.755 2.857.755.684 0 1.956-.94 3.287-.806.558.024 2.13.228 3.14 1.7-.083.05-1.87 1.087-1.845 3.205zM14.475 3.65c.602-.73 1.01-1.745.898-2.762-.873.035-1.928.583-2.553 1.312-.56.643-1.05 1.68-.92 2.673.974.075 1.965-.487 2.575-1.223z" />
                        </svg>
                    </button>
                    <span className="mt-2 text-xs text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Apple ID</span>
                </div>

                <div className="flex flex-col items-center group">
                    <button
                        onClick={handleWeChatLogin}
                        type="button"
                        className="w-14 h-14 flex items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300"
                        title="微信登录"
                    >
                        <svg className="h-6 w-6 text-[#07C160]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.618 10.957c-.439 0-.825.334-.825.795 0 .463.386.848.825.848.441 0 .826-.385.826-.848 0-.461-.385-.795-.826-.795zm9.68 4.793c-.387 0-.709.309-.709.682 0 .374.322.682.709.682.388 0 .71-.308.71-.682 0-.373-.322-.682-.71-.682zm-4.739.025c-.388 0-.71.309-.71.682 0 .374.322.682.71.682.387 0 .709-.308.709-.682 0-.373-.322-.682-.709-.682zM24 14.864c0-3.354-3.328-6.072-7.434-6.072-.801 0-1.57.106-2.302.301.768-3.033 3.424-5.32 6.578-5.32C26.062 3.773 30 6.64 30 10.165c0 2.226-1.572 4.195-3.992 5.328l1.01 2.508-3.353-1.674c-1.373.49-2.859.738-4.398.738h-.469c.848-1.077 3.39-4.226 5.202-2.201zM8.563 1.708c-4.724 0-8.563 3.328-8.563 7.411 0 2.392 1.442 4.512 3.665 5.824l-1.01 2.973 3.823-1.928c1.344.438 2.51.642 3.354.642 4.722 0 8.562-3.328 8.562-7.411 0-4.083-3.84-7.511-8.562-7.511z" />
                        </svg>
                    </button>
                    <span className="mt-2 text-xs text-gray-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">微信</span>
                </div>
            </div>
        </div>
    );
}
