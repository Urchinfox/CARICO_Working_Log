import { Link } from "react-router-dom"
import Logo from '../../assets/logo.png'
import { useState } from "react"
import supabase from "../../supabase";
import { useNavigate } from "react-router-dom";


export default function Login() {
    const [loginForm, setLoginForm] = useState();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const submitLogin = async (e) => {
        e.preventDefault();
        console.log(e)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                console.log('登入錯誤:', error.message);
                alert('帳號或密碼錯誤 請聯絡Daniel')
                return;
            } else {
                console.log('登入成功:', data);
            }

            // get user information
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.log('failed to get user info:', userError.message);
                return;
            }

            console.log('user info:', userData.user);

            // role validate
            const { data: userRoleData, error: roleError } = await supabase
                .from('users')
                .select('role')
                .eq('user_id', userData.user.id)
                .single(); // withdraw 1 data only

            if (roleError) {
                console.log('role error:', roleError.message);
                return;
            }

            const userRole = userRoleData?.role || 'user'; //default general user
            console.log('role:', userRole);

            // admin page or staff page
            if (userRole === 'admin') {
                // direct to admin page
                navigate('/admin')

            } else {
                // direct to staff page
                navigate('/checkin')

            }

        } catch (error) {
            console.log('failure', error)
        }

    };

    return (<>
        <section className="mt-100">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-4">
                        <div className="login_card text-center py-5">
                            <img className="mx-auto" src={Logo} width="150" />
                            <p className="fs-5 text-white mt-4">登入</p>
                            {/* <div className="d-flex justify-content-center">
                                <a className="tab tab_active" href="#">員工</a>
                                <a className="tab tab_default" href="#">管理者</a>
                            </div> */}
                            <div className="login_input mx-auto">
                                <div className="mb-3 text-start fw-lighter">
                                    <label htmlFor="staffNum" className="form-label text-white">員工帳號</label>
                                    <input type="email" name="staffNum" className="form-control" id="staffNum" placeholder="040"
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3 text-start fw-lighter">
                                    <label htmlFor="password" name="password" className="form-label text-white">密碼</label>
                                    <input type="password" className="form-control" id="password" placeholder="請輸入密碼" onChange={(e) => setPassword(e.target.value)} />
                                </div>
                            </div>
                            <Link to='/' className="btn btn-primary mt-4" onClick={submitLogin}>登入</Link>

                        </div>

                    </div>
                </div>
            </div>
        </section>
    </>)
}