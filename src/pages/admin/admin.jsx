import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/header/header"
import { useSelector, useDispatch } from "react-redux"
import { checkSession, roleValidate } from "../../slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../../supabase";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { fetchAttendance, setSelectedDate, setSelectedMonth } from "../../slices/recordsSlice";


export default function AdminDashBoard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { role, loading } = useSelector((state) => state.auth)
    const [userData, setUserData] = useState([]);
    const [userTempData, setUserTempData] = useState({});
    const pathName = useLocation();
    const [dateTab, setDateTab] = useState('/admin/daily_record');




    useEffect(() => {
        setDateTab(pathName.pathname)
    }, [pathName.pathname])



    // id validate effect
    useEffect(() => {
        dispatch(checkSession(navigate));
        dispatch(roleValidate());
    }, [navigate, dispatch])

    // id permission effect
    useEffect(() => {
        if (loading) {
            console.log('loading.....');
            return;
        }

        if (role === null) {
            console.log('Role not fetched yet');
            return;
        }

        if (role !== 'admin') {
            navigate('/')
        }

    }, [role, loading, navigate])


    const getUser = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, user_id, email, role, created_at,name');

            setUserData(data)

            if (error) {
                throw error
            }

        } catch (error) {
            console.error('Error fetching users:', error.message)
        }
    }

    //getuser effect
    useEffect(() => {
        getUser();
    }, [])

    const {
        selectedDate,
        selectedMonth,
        dateRange: { startDate, endDate },
    } = useSelector((state) => state.record);


    useEffect(() => {
        if (role === "admin") {
            dispatch(fetchAttendance({ mode: 'daily', selectedDate, selectedMonth }))
            dispatch(fetchAttendance({ mode: "monthly", selectedDate, selectedMonth }));
        }
    }, [selectedDate, selectedMonth, role, dispatch])


    return (<>
        <Navbar user={'admin'} />



        <div className="container-fluid mt-5">
            <div className="mb-3">
                <Link
                    className={`btn btn-light r-99 border_2px py-2 px-3 ${dateTab === "/admin/monthly_record" ? "active" : ""
                        }`}
                    to="monthly_record"
                >
                    整月總覽
                </Link>
                <Link
                    className={`btn btn-light r-99 border_2px py-2 px-3 ms-2 ${dateTab === "/admin/daily_record" ? "active" : ""
                        }`}
                    to="daily_record"
                >
                    指定日期
                </Link>

            </div>

            {/* <!-- 月份選擇與標題 --> */}
            {/* <div className="">
                {
                    dateTab === "/admin/monthly_record" ? (<div className="d-flex align-items-center">
                        <button
                            className="btn btn-light border border-black p-1"
                            onClick={() =>
                                dateTab === "/admin/monthly_record" ? goToPreviousMonth() : goToPreviousDate()
                            }
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        <h4 className="mx-3 mb-0">
                            {dateTab === "/admin/monthly_record" ? selectedMonth : selectedDate}
                        </h4>
                        <button
                            className="btn btn-light border border-black p-1"
                            onClick={() =>
                                dateTab === "/admin/monthly_record" ? goToNextMonth() : goToNextDate()
                            }
                        // go to next function should be move -> pending
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>

                    </div>) : (<div>
                        <h4 className="mx-3 mb-0">
                            {startDate} - {endDate}
                        </h4>
                    </div>)
                }

            </div> */}


            <Outlet />
        </div>









    </>)
}