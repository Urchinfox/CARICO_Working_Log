import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/header/header"
import { useSelector, useDispatch } from "react-redux"
import { checkSession, roleValidate } from "../../slices/authSlice";
import { useLocation, useNavigate } from "react-router-dom";
import DeleteModal from "../../components/DeleteModal";
import { Modal } from "bootstrap";
import AddModal from "../../components/AddModal";
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
    // const deleteStaffModal = useRef(null);
    // const addStaffModal = useRef(null)
    const [dateTab, setDateTab] = useState('/admin/daily_record');

    // const openModal = (type, userTempData) => {
    //     if (type === 'add') {
    //         addStaffModal.current.show();
    //     } else if (type === 'delete') {
    //         setUserTempData(userTempData)
    //         deleteStaffModal.current.show();
    //     }
    // }
    // const closeModal = (type) => {
    //     if (type === 'add') {
    //         addStaffModal.current.hide();
    //     } else if (type === 'delete') {
    //         deleteStaffModal.current.hide();
    //     }
    // }

    useEffect(() => {
        setDateTab(pathName.pathname)
    }, [pathName.pathname])


    //button modal effect
    // useEffect(() => {
    //     deleteStaffModal.current = new Modal('#deleteStaffModal', { backdrop: 'static' });
    //     addStaffModal.current = new Modal('#addStaffModal', { backdrop: 'static' });
    // }, [])

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
    } = useSelector((state) => state.record);


    useEffect(() => {
        if (role === "admin") {
            dispatch(fetchAttendance({ mode: 'daily', selectedDate, selectedMonth }))
            dispatch(fetchAttendance({ mode: "monthly", selectedDate, selectedMonth }));
        }
    }, [selectedDate, selectedMonth, role, dispatch])

    const goToPreviousMonth = () => {
        const [year, month] = selectedMonth.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        date.setMonth(date.getMonth() - 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        dispatch(setSelectedMonth(newMonth));
    };

    const goToNextMonth = () => {
        const [year, month] = selectedMonth.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        date.setMonth(date.getMonth() + 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        dispatch(setSelectedMonth(newMonth));
    };

    const goToPreviousDate = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        const newDate = date.toISOString().split("T")[0];
        dispatch(setSelectedDate(newDate));
    };

    const goToNextDate = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        const newDate = date.toISOString().split("T")[0];
        dispatch(setSelectedDate(newDate));
    };


    return (<>
        <Navbar user={'admin'} />
        {/* <DeleteModal closeModal={closeModal} userTempData={userTempData} getUser={getUser} />
        <AddModal closeModal={closeModal} getUser={getUser} /> */}


        <div className="container-fluid mt-5">
            {/* <!-- 月份選擇與標題 --> */}
            <div className="d-flex align-items-center">
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
                >
                    <i className="bi bi-chevron-right"></i>
                </button>

                <Link
                    className={`btn btn-light r-99 border_2px py-2 px-3 ms-4 ${dateTab === "/admin/monthly_record" ? "active" : ""
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


            <Outlet />
        </div>









    </>)
}