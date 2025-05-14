import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useState } from "react";
import supabase from "../../supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState(""); // 新增錯誤訊息狀態
    const navigate = useNavigate();

    const submitLogin = async (e) => {
        e.preventDefault();
        setErrorMsg(""); // 重置錯誤訊息
        try {
            // 認證
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

            // 查詢用戶角色
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

            // 根據角色導航
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
                                                placeholder="040"
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
                                    <button type="submit" className="btn btn-primary mt-4">
                                        登入
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

// import Logo from '../../assets/logo.png'
// import { useState } from "react"
// import supabase from "../../supabase";
// import { useNavigate } from "react-router-dom";


// export default function Login() {
//     const [loginForm, setLoginForm] = useState();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const navigate = useNavigate();

//     const submitLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const { data, error } = await supabase.auth.signInWithPassword({
//                 email,
//                 password,
//             });
//             if (error) {
//                 console.log('登入錯誤:', error.message);
//                 alert('帳號或密碼錯誤 請聯絡Daniel')
//                 return;
//             }

//             // get user information
//             const { data: userData, error: userError } = await supabase.auth.getUser();
//             if (userError) {
//                 console.log('failed to get user info:', userError.message);
//                 return;
//             }


//             // role validate
//             const { data: userRoleData, error: roleError } = await supabase
//                 .from('users')
//                 .select('role')
//                 .eq('user_id', userData.user.id)
//                 .single(); // withdraw 1 data only

//             if (roleError) {
//                 console.log('role error:', roleError.message);
//                 return;
//             }

//             const userRole = userRoleData?.role || 'user'; //default general user

//             // admin page or staff page
//             if (userRole === 'admin') {
//                 // direct to admin page
//                 navigate('/admin/monthly_record')

//             } else {
//                 // direct to staff page
//                 navigate('/checkin')

//             }

//         } catch (error) {
//             console.log('failure', error)
//         }

//     };

//     return (<>
//         <section className="mt-100">
//             <div className="container">
//                 <div className="row justify-content-center">
//                     <div className="col-lg-4">
//                         <div className="login_card text-center py-5">
//                             <img className="mx-auto" src={Logo} width="150" />
//                             <p className="fs-5 text-white mt-4">登入</p>
//                             <form onSubmit={submitLogin}>
//                                 <div className="login_input mx-auto">
//                                     <div className="mb-3 text-start fw-lighter">
//                                         <label htmlFor="staffNum" className="form-label text-white">員工帳號</label>
//                                         <input
//                                             type="email"
//                                             name="staffNum"
//                                             className="form-control"
//                                             id="staffNum"
//                                             placeholder="040"
//                                             onChange={(e) => setEmail(e.target.value)}
//                                         />
//                                     </div>
//                                     <div className="mb-3 text-start fw-lighter">
//                                         <label htmlFor="password" className="form-label text-white">密碼</label>
//                                         <input
//                                             type="password"
//                                             className="form-control"
//                                             id="password"
//                                             placeholder="請輸入密碼"
//                                             onChange={(e) => setPassword(e.target.value)}
//                                         />
//                                     </div>
//                                 </div>
//                                 <button type="submit" className="btn btn-primary mt-4">登入</button>
//                             </form>

//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </section>
//     </>)
// }