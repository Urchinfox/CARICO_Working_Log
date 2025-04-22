import { useEffect, useState } from "react";
import Navbar from "../../../components/header/header";
import supabase from "../../../supabase";
import DeleteModal from "../../../components/DeleteModal";
import AddModal from "../../../components/AddModal";
import { useRef } from "react";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkSession, roleValidate } from "../../../slices/authSlice";


export default function StaffList({ close }) {
    const [userData, setUserData] = useState([]);
    const [userTempData, setUserTempData] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { role, loading } = useSelector((state) => state.auth)


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
    return (<>
        <Navbar user={'admin'} />
        <DeleteModal closeModal={closeModal} userTempData={userTempData} getUser={getUser} />
        <AddModal closeModal={closeModal} getUser={getUser} />
        <button type="button" className="btn btn-light r-16 border_2px" onClick={() => openModal('add')}>創建員工帳號</button>

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
    </>)
}