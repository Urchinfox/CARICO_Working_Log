import Logo from '../../assets/logo.png'
import { handleLogout } from '../../slices/authSlice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (<>

        <nav className="navbar navbar-dark px-lg-3">
            <div className="container-fluid">
                <div className="border border-2 border-black r-99 d-flex align-items-center justify-content-between w-100 px-5">

                    <div className="d-flex align-items-center">
                        <div className="navbar-brand" href="#">
                            <img src={Logo} alt="" width="150" height="auto" />
                        </div>
                        {
                            user === 'staff' ? (<p className="d-none d-lg-block fs-5">您好! 040 許之瑜</p>
                            ) : (<p className="d-none d-lg-block fs-5">線上打卡管理系統</p>
                            )
                        }
                    </div>

                    <button className="border-0" type='button' onClick={() => dispatch(handleLogout(navigate))}>登出</button>
                </div>
            </div>
        </nav>


    </>)
}