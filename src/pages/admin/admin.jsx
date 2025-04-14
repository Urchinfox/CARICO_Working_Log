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
import { fetchAttendance, updateNote, setSelectedDate, setSelectedMonth, setEditingNoteId, setNoteInput } from "../../slices/recordsSlice";


export default function AdminDashBoard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { role, loading } = useSelector((state) => state.auth)
    const [userData, setUserData] = useState([]);
    const [userTempData, setUserTempData] = useState({});
    const pathName = useLocation();
    const deleteStaffModal = useRef(null);
    const addStaffModal = useRef(null)
    const [dateTab, setDateTab] = useState('/admin/daily_record');

    const openModal = (type, userTempData) => {
        if (type === 'add') {
            addStaffModal.current.show();
        } else if (type === 'delete') {
            setUserTempData(userTempData)
            deleteStaffModal.current.show();
        }
    }
    const closeModal = (type) => {
        if (type === 'add') {
            addStaffModal.current.hide();
        } else if (type === 'delete') {
            deleteStaffModal.current.hide();
        }
    }

    useEffect(() => {
        setDateTab(pathName.pathname)
    }, [pathName.pathname])


    //button modal effect
    useEffect(() => {
        deleteStaffModal.current = new Modal('#deleteStaffModal', { backdrop: 'static' });
        addStaffModal.current = new Modal('#addStaffModal', { backdrop: 'static' });
    }, [])

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
        dailyRecords,
        monthlyRecords,
        selectedDate,
        selectedMonth,
        editingNoteId,
        noteInput,
        recordLoading,
        error,
    } = useSelector((state) => state.record);


    useEffect(() => {
        if (role === "admin") {
            dispatch(fetchAttendance({ mode: 'daily', selectedDate, selectedMonth }))
            dispatch(fetchAttendance({ mode: "monthly", selectedDate, selectedMonth }));
        }
    }, [selectedDate, selectedMonth, role, dispatch])

    return (<>
        <Navbar user={'admin'} />
        <DeleteModal closeModal={closeModal} userTempData={userTempData} getUser={getUser} />
        <AddModal closeModal={closeModal} getUser={getUser} />
        <table className="styled-table">
            <thead>
                <tr>
                    <th>姓名</th>
                    <th>帳號</th>
                    <th>權限</th>
                    <th>操作</th>

                </tr>
            </thead>
            <tbody>
                {
                    userData.map(item => {
                        return (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>{item.role}</td>
                                <td><button type="button" disabled={item.name === 'Snan'} onClick={() => openModal('delete', item)}>刪除</button></td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>

        <button type="button" className="btn btn-light" onClick={() => openModal('add')}>新增員工帳號</button>


        <ul className="nav nav-pills">
            <li className="nav-item">
                <Link className={`nav-link ${pathName.pathname === "/admin/daily_record" ? 'active' : ''}`} to='daily_record' >單日查詢</Link>
            </li>
            <li className="nav-item">
                <Link className={`nav-link  ${pathName.pathname === "/admin/monthly_record" ? 'active' : ''}`} to="monthly_record" >單月查詢</Link>
            </li>

        </ul>


        <div className="container">
            <Outlet />
        </div>



    </>)
}