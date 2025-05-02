import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../../components/header/header";
import { roleValidate } from "../../slices/authSlice";
import { useDispatch, useSelector } from "react-redux"
import { checkSession } from "../../slices/authSlice";
import PunchModal from "./PunchModal";
import { Modal } from "bootstrap";
import PunchMsg from "./PunchMessage";
import { fetchTodayRecord, setModalType, clearPunchStatus } from "../../slices/punchSlice";


export default function CheckIn() {

    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { clockInTime, clockOutTime, punchStatus, punchErrorMsg } = useSelector(state => state.punch)
    const { role, loading, name } = useSelector((state) => state.auth)
    const punchInOutModal = useRef(null);
    const punchInOutModalRef = useRef(null);
    const punchMsgModal = useRef(null)
    const punchMsgModaRef = useRef(null)


    useEffect(() => {
        if (punchInOutModalRef.current && punchMsgModaRef.current) {
            punchInOutModal.current = new Modal(punchInOutModalRef.current);
            punchMsgModal.current = new Modal(punchMsgModaRef.current);
        }
    }, [])

    useEffect(() => {
        dispatch(checkSession(navigate));
        dispatch(roleValidate());
        dispatch(fetchTodayRecord());

    }, [navigate, dispatch])

    const closePunchMsgModal = () => {
        punchMsgModal.current.hide();
    }

    const openPunchModal = (type) => {
        dispatch(setModalType(type))

        punchInOutModal.current.show();
    }
    const closePunchModal = () => {
        punchInOutModal.current.hide();
    }

    useEffect(() => {
        if (loading) {
            console.log('loading.....');
            return;
        }

        if (role === null) {
            console.log('Role not fetched yet');
            return;
        }

        if (role !== 'staff') {
            navigate('/')
        }

    }, [role, loading])



    useEffect(() => {
        if (punchStatus || punchErrorMsg) {
            punchInOutModal.current?.hide();
            punchMsgModal.current?.show();
            setTimeout(() => {
                punchMsgModal.current?.hide();
                dispatch(clearPunchStatus());
            }, 3000);
        }
    }, [punchStatus, punchErrorMsg, dispatch]);



    const getCurrentDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
    };

    return (<>
        <Navbar user={'staff'} />

        <section className="mt-100">
            <div className="container">

                <div className="row justify-content-center">
                    <div className="col-xl-4 col-lg-4 col-md-5 col-10">

                        <p className="text-center fs-5 border border-2 border-black py-2 px-3 r-99 d-inline-block">線上打卡系統</p>

                        <div className="card r-16 px-4 py-5 mt-3 border border-2 border-black">
                            <p className="fs-5 mb-2">{name}</p>
                            <p className="fs-6 text-secondary">{getCurrentDate()}</p>
                            <div className="mt-5">
                                <p className="fs-5 mb-3">上班時間: <span className="clock_status clock_status_delay">{clockInTime}</span></p>
                                <p className="fs-5">下班時間: <span className="clock_status clock_status_delay">{clockOutTime}</span></p>
                            </div>
                        </div>

                        {/* <!-- punch button --> */}
                        <div className="mt-5 text-center d-flex">

                            <button type="button" className={`btn btn_outline ${clockInTime === '00:00' ? 'btn_outline_default' : 'btn_outline_disabled'} r-16 me-2`} onClick={() => openPunchModal('punchin')}>
                                上班打卡
                            </button>
                            <button type="button" className={`btn btn_outline ${clockOutTime === '00:00' ? 'btn_outline_default' : 'btn_outline_disabled'} r-16 text-primary `} onClick={() => openPunchModal('punchout')}>
                                下班打卡
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </section>

        <PunchModal closePunchModal={closePunchModal} punchInOutModalRef={punchInOutModalRef} />
        <PunchMsg punchMsgModaRef={punchMsgModaRef} closePunchMsgModal={closePunchMsgModal} />

    </>)
}


