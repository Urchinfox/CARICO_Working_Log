// ResetPassword.js
import { useState, useEffect } from "react";
import supabase from "../../supabase";
import { useNavigate, useLocation } from "react-router-dom";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 檢查 URL 的 query 和 fragment
        const params = new URLSearchParams(location.search);
        let token = params.get('access_token');
        let fragmentParams;

        // 若 query 無 token，檢查 fragment
        if (!token) {
            const fragment = location.hash.substring(1); // 移除開頭的 #
            fragmentParams = new URLSearchParams(fragment);
            token = fragmentParams.get('access_token');
        }

        console.log('ResetPassword URL:', location.pathname + location.search + location.hash);
        console.log('Access Token:', token);

        if (!token) {
            setError('無效的重設密碼連結，缺少 access_token！請檢查郵件連結。');
            return;
        }

        // 檢查是否為 recovery 類型
        const isRecovery = fragmentParams && fragmentParams.get('type') === 'recovery';

        // 監聽 auth 事件
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth Event:', event, 'Session:', session);
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && isRecovery)) {
                setIsRecoveryMode(true);
                setError(''); // 清除錯誤訊息
            } else if (event === 'SIGNED_IN' && !isRecovery) {
                setError('無效的密碼重設狀態，請重新申請連結！');
            }
            // 忽略 INITIAL_SESSION
        });

        // 驗證 token
        const verifyToken = async () => {
            try {
                const { data: session, error } = await supabase.auth.setSession({
                    access_token: token,
                    refresh_token: fragmentParams ? fragmentParams.get('refresh_token') : null
                });
                if (error) throw error;
                console.log('Session:', session);
                // 若 session 有效且是 recovery，設置 isRecoveryMode
                if (isRecovery) {
                    setIsRecoveryMode(true);
                    setError(''); // 清除錯誤訊息
                }
            } catch (err) {
                setError(`驗證失敗：${err.message}`);
            }
        };

        verifyToken();

        // 清理監聽器
        return () => authListener.subscription.unsubscribe();
    }, [navigate, location.search, location.hash]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');

        if (!isRecoveryMode) {
            setError('請透過有效連結重設密碼！');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;
            setMsg('密碼已更新，請重新登入！');
            setTimeout(() => navigate('/'), 3000);
        } catch (err) {
            setError(`更新失敗：${err.message}`);
        }
    };

    return (
        <div className="container mt-3">
            <h2>重設密碼</h2>
            {isRecoveryMode ? (
                <form onSubmit={handleUpdatePassword}>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="輸入新密碼"
                        required
                    />
                    <button className="ms-2 rounded-2 bg-light p-1" type="submit">
                        更新密碼
                    </button>
                </form>
            ) : (
                <p>無法載入重設密碼表單，請檢查連結！</p>
            )}
            {msg && <p style={{ color: 'green' }}>{msg}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}