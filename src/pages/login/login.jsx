import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useState } from "react";
import supabase from "../../supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [resetEmail, setResetEmail] = useState(""); // 新增重設密碼的 email
    const [resetMessage, setResetMessage] = useState(""); // 重設成功訊息
    const [resetError, setResetError] = useState(""); // 重設錯誤訊息
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submitLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        try {
            // validate
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                console.error("登入錯誤:", error.message);
                setErrorMsg("帳號或密碼錯誤，請重試或聯絡管理員Snan");
                return;
            }

            // 取得用戶資訊
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error("無法取得用戶資訊:", userError.message);
                setErrorMsg("無法取得用戶資訊，請聯絡管理員");
                return;
            }

            // look into current user
            const { data: userRoleData, error: roleError } = await supabase
                .from("users")
                .select("role")
                .eq("user_id", userData.user.id)
                .single();

            if (roleError) {
                console.error("無法取得用戶角色:", roleError.message);
                setErrorMsg("無法取得用戶角色，請聯絡管理員");
                return;
            }

            const userRole = userRoleData?.role || "user"; // 預設普通用戶

            // role page
            if (userRole === "admin") {
                navigate("/admin/monthly_record");
            } else {
                navigate("/checkin");
            }
        } catch (error) {
            console.error("登入失敗:", error.message);
            setErrorMsg("登入失敗，請稍後再試或聯絡管理員");
        }
    };


    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetMessage("");
        setResetError("");
        try {
            setLoading(true);
            // email is valid?
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('email')
                .eq('email', resetEmail)
                .maybeSingle();
            if (userError) {
                throw new Error(`查詢失敗：${userError.message}`);
            }
            if (!user) {
                setLoading(false);
                throw new Error('此 Email 不存在，請聯繫管理員！');
            }

            // const redirectTo = `${window.location.origin}/#/reset-password`; //本地端測試
            const redirectTo = `${window.location.origin}/CARICO_Working_Log/#/reset-password`; //正式機

            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo,
            });
            if (error) throw error;
            setResetMessage("已發送重設密碼連結，請檢查您的電子郵件！");
            setLoading(false);
        } catch (err) {
            setResetError("發送失敗：" + err.message);
            setLoading(false);
        }
    };

    return (
        <>
            <section className="mt-100">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-4">
                            <div className="login_card text-center py-5">
                                <img className="mx-auto" src={Logo} width="150" />
                                <p className="fs-5 text-white mt-4">登入</p>
                                {errorMsg && (
                                    <div className="alert alert-danger" role="alert">
                                        {errorMsg}
                                    </div>
                                )}
                                <form onSubmit={submitLogin}>
                                    <div className="login_input mx-auto">
                                        <div className="mb-3 text-start fw-lighter">
                                            <label htmlFor="staffNum" className="form-label text-white">
                                                員工帳號
                                            </label>
                                            <input
                                                type="email"
                                                name="staffNum"
                                                className="form-control"
                                                id="staffNum"
                                                placeholder="example@gmail.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3 text-start fw-lighter">
                                            <label htmlFor="password" className="form-label text-white">
                                                密碼
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="password"
                                                placeholder="請輸入密碼"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <button type="submit" className="btn btn-primary mt-4">
                                            登入
                                        </button>
                                    </div>
                                    {/* <button type="button" className="rounded-1"><Link to='/reset-password'>忘記密碼</Link></button> */}
                                </form>


                                {/* 忘記密碼表單 */}
                                <form onSubmit={handleResetPassword} className="p-3">
                                    <div className="mb-3 text-start fw-lighter">
                                        <label htmlFor="resetEmail" className="form-label text-white">
                                            忘記密碼？輸入電子郵件
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="resetEmail"
                                            placeholder="輸入您的電子郵件"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-light btn-sm">
                                        發送重設連結
                                        {
                                            loading ? <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div> : ''
                                        }

                                    </button>
                                </form>
                                {resetMessage && (
                                    <div className="alert alert-success mt-3" role="alert">
                                        {resetMessage}
                                    </div>
                                )}
                                {resetError && (
                                    <div className="alert alert-danger mt-3" role="alert">
                                        {resetError}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

