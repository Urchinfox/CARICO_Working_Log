import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/header/header"
import { useSelector, useDispatch } from "react-redux"
import { checkSession, roleValidate } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../components/DeleteModal";
import { Modal } from "bootstrap";
import AddModal from "../../components/AddModal";
import supabase from "../../supabase";


export default function AdminDashBoard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { role, loading } = useSelector((state) => state.auth)
    const [userData, setUserData] = useState([]);
    const [userTempData, setUserTempData] = useState({});

    const deleteStaffModal = useRef(null);
    const addStaffModal = useRef(null)

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
        deleteStaffModal.current = new Modal('#deleteStaffModal', { backdrop: 'static' });
        addStaffModal.current = new Modal('#addStaffModal', { backdrop: 'static' });

    }, [])


    useEffect(() => {
        dispatch(checkSession(navigate));
        dispatch(roleValidate());
    }, [navigate, dispatch])

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

    useEffect(() => {
        getUser();
    }, [])


    const [records, setRecords] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    // 查詢員工和打卡資料
    const fetchAttendance = async () => {
        try {
            // 查詢所有員工
            const { data: users, error: userError } = await supabase
                .from("users")
                .select("id, user_id, email, name"); // 根據你的表格結構調整

            if (userError) throw userError;

            // 查詢指定日期的打卡記錄
            const { data: attendanceRecords, error: attendanceError } = await supabase
                .from("attendance")
                .select("*")
                .eq("attendance_date", selectedDate);

            if (attendanceError) throw attendanceError;

            // 組合員工與打卡狀態
            const formattedRecords = users.map(user => {
                const record = attendanceRecords.find(r => r.user_id === user.user_id); // 使用 user_id 匹配
                if (!record) {
                    return {
                        user_id: user.user_id,
                        name: user.name || user.email,
                        check_in_time: "無",
                        check_out_time: "無",
                        status: "曠職",
                    };
                }
                return {
                    user_id: record.user_id,
                    name: user.name || user.email,
                    check_in_time: record.check_in_time
                        ? new Date(record.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "無",
                    check_out_time: record.check_out_time
                        ? new Date(record.check_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "無",
                    status: record.check_out_time ? record.status : "未打卡下班",
                };
            });

            setRecords(formattedRecords);
        } catch (error) {
            console.error("查詢失敗:", error.message);
        }
    };

    // 當日期變更或頁面載入時查詢
    useEffect(() => {
        if (role === "admin") {
            fetchAttendance();
        }
    }, [selectedDate, role]);




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


        <section>
            <div>
                <h2>老闆頁面 - 打卡記錄</h2>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
                <table>
                    <thead>
                        <tr>
                            <th>員工名稱</th>
                            <th>上班時間</th>
                            <th>下班時間</th>
                            <th>狀態</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => (
                            <tr key={record.user_id}>
                                <td>{record.name}</td>
                                <td>{record.check_in_time}</td>
                                <td>{record.check_out_time}</td>
                                <td>{record.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>


    </>)
}