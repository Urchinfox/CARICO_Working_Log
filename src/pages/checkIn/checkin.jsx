import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../../supabase";
import Navbar from "../../components/header/header";
import { roleValidate } from "../../slices/authSlice";
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { checkSession } from "../../slices/authSlice";
import PunchModal from "./PunchModal";
import { Modal } from "bootstrap";
import PunchMsg from "./PunchMessage";


export default function CheckIn() {

    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { role, loading, name } = useSelector((state) => state.auth)
    const [clockInTime, setClockInTime] = useState("00:00");
    const [clockOutTime, setClockOutTime] = useState("00:00");
    const punchInOutModal = useRef(null);
    const punchInOutModalRef = useRef(null);
    const punchMsgModal = useRef(null)
    const punchMsgModaRef = useRef(null)
    const [punchStatus, setPunchStatus] = useState(false);
    const [modalType, setModalType] = useState('')
    const [punchErrorMsg, setPunchErrorMsg] = useState('');
    const [punchTime, setPunchTime] = useState(null); // 新增狀態

    useEffect(() => {
        if (punchInOutModalRef.current && punchMsgModaRef.current) {
            punchInOutModal.current = new Modal(punchInOutModalRef.current);
            punchMsgModal.current = new Modal(punchMsgModaRef.current);
        }
    }, [])

    useEffect(() => {
        dispatch(checkSession(navigate));
        dispatch(roleValidate());
    }, [navigate])

    const openPunchMsgModal = () => {

        punchMsgModal.current.show();
        setTimeout(() => {
            closePunchMsgModal();
            setPunchStatus(false); // 清除狀態
            setPunchErrorMsg(""); // 清除錯誤訊息
        }, 3000);
    }

    const closePunchMsgModal = () => {
        punchMsgModal.current.hide();
    }

    const openPunchModal = (type) => {
        setModalType(type)
        setPunchTime(new Date());

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


    const fetchTodayRecord = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("請先登入！");
            const userId = user.id;
            const today = new Date().toISOString().split("T")[0];

            const { data: record, error } = await supabase
                .from("attendance")
                .select("*")
                .eq("user_id", userId)
                .eq("attendance_date", today)
                .single();

            if (error && error.code !== "PGRST116") throw error;

            if (record) {
                setClockInTime(new Date(record.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                setClockOutTime(
                    record.check_out_time
                        ? new Date(record.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "00:00"
                );
            } else {
                setClockInTime("00:00");
                setClockOutTime("00:00");
            }
        } catch (error) {
            console.error("查詢打卡記錄失敗:", error.message);
        }
    };

    useEffect(() => {
        fetchTodayRecord();
    }, []);

    // const handlePunch = async (type) => {
    //     try {
    //         const { data: { user }, error: authError } = await supabase.auth.getUser();
    //         if (authError || !user) throw new Error("請先登入！");
    //         const userId = user.id;

    //         const now = new Date().toISOString();
    //         const today = new Date().toISOString().split("T")[0];

    //         const { data: existingRecord, error: fetchError } = await supabase
    //             .from("attendance")
    //             .select("*")
    //             .eq("user_id", userId)
    //             .eq("attendance_date", today)
    //             .single();

    //         if (fetchError && fetchError.code !== "PGRST116") {
    //             throw fetchError;
    //         }

    //         if (type === "in") {
    //             if (existingRecord) {
    //                 alert("你今天已經打過上班卡了！");
    //                 return;
    //             }
    //             const { error } = await supabase.from("attendance").insert({
    //                 user_id: userId,
    //                 check_in_time: now,
    //                 attendance_date: today,
    //                 status: new Date(now).getHours() > 9 ? "遲到" : "正常",
    //             });
    //             if (error) throw error;
    //             setClockInTime(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    //             const { data: newRecord, error: fetchNewError } = await supabase
    //                 .from("attendance")
    //                 .select("*")
    //                 .eq("user_id", userId)
    //                 .eq("attendance_date", today)
    //                 .single();
    //             if (fetchNewError) throw fetchNewError;
    //             console.log("打卡成功，上班記錄:", newRecord);
    //         } else if (type === "out") {
    //             if (!existingRecord) {
    //                 alert("請先打上班卡！");
    //                 return;
    //             }
    //             if (existingRecord.check_out_time) {
    //                 alert("你今天已經打過下班卡了！");
    //                 return;
    //             }
    //             const workHours = (new Date(now) - new Date(existingRecord.check_in_time)) / 3600000;
    //             const expectedOutTime = new Date(new Date(existingRecord.check_in_time).getTime() + 9 * 3600000);
    //             const status = new Date(now) < expectedOutTime ? "早退" : existingRecord.status;

    //             const { error } = await supabase
    //                 .from("attendance")
    //                 .update({
    //                     check_out_time: now,
    //                     work_hours: workHours.toFixed(2),
    //                     status: status,
    //                 })
    //                 .eq("user_id", userId)
    //                 .eq("attendance_date", today);
    //             if (error) throw error;
    //             setClockOutTime(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    //             const { data: updatedRecord, error: fetchUpdatedError } = await supabase
    //                 .from("attendance")
    //                 .select("*")
    //                 .eq("user_id", userId)
    //                 .eq("attendance_date", today)
    //                 .single();
    //             if (fetchUpdatedError) throw fetchUpdatedError;
    //             console.log("打卡成功，下班記錄:", updatedRecord);
    //         }
    //         alert(`成功打卡 (${type === "in" ? "上班" : "下班"})`);
    //     } catch (error) {
    //         console.error("打卡失敗:", error.message);
    //         alert("打卡失敗，請稍後再試！");
    //     }
    // };

    async function handlePunch(type) {
        closePunchModal();
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("請先登入！");
            const userId = user.id;

            const now = new Date().toISOString();
            const today = new Date().toISOString().split("T")[0];

            const { data: existingRecord, error: fetchError } = await supabase
                .from("attendance")
                .select("*")
                .eq("user_id", userId)
                .eq("attendance_date", today)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                throw fetchError;
            }

            if (type === "in") {
                if (existingRecord) {
                    setPunchErrorMsg('你今天已經打過上班卡了！')
                    openPunchMsgModal()
                    return;
                }
                const nowDate = new Date(now);
                const isLate = nowDate.getHours() > 9 || (nowDate.getHours() === 9 && nowDate.getMinutes() > 0);
                const status = isLate ? "遲到" : "正常";

                const { error } = await supabase.from("attendance").insert({
                    user_id: userId,
                    check_in_time: now,
                    attendance_date: today,
                    status,
                });
                if (error) throw error;
                setClockInTime(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                const { data: newRecord, error: fetchNewError } = await supabase
                    .from("attendance")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("attendance_date", today)
                    .single();
                if (fetchNewError) throw fetchNewError;
                setPunchStatus(true); // 打卡成功
                setPunchTime(new Date(now)); // 更新 punchTime 為實際打卡時間
                openPunchMsgModal()
                console.log("打卡成功，上班記錄:", newRecord);

            } else if (type === "out") {
                if (!existingRecord) {
                    setPunchErrorMsg('請先打上班卡！');
                    openPunchMsgModal();
                    // alert("請先打上班卡！");
                    return;
                }
                if (existingRecord.check_out_time) {
                    setPunchErrorMsg('你今天已經打過下班卡了！');
                    openPunchMsgModal();
                    // alert("你今天已經打過下班卡了！");
                    return;
                }
                const nowDate = new Date(now);
                const checkInDate = new Date(existingRecord.check_in_time);
                const workHours = (nowDate - checkInDate) / 3600000;
                const expectedOutTime = new Date(checkInDate.getTime() + 9 * 3600000);
                const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
                const expectedMinutes = expectedOutTime.getHours() * 60 + expectedOutTime.getMinutes();
                const status = nowMinutes < expectedMinutes ? "早退" : existingRecord.status;

                const { error } = await supabase
                    .from("attendance")
                    .update({
                        check_out_time: now,
                        work_hours: workHours.toFixed(2),
                        status,
                    })
                    .eq("user_id", userId)
                    .eq("attendance_date", today);
                if (error) throw error;
                setClockOutTime(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                const { data: updatedRecord, error: fetchUpdatedError } = await supabase
                    .from("attendance")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("attendance_date", today)
                    .single();
                if (fetchUpdatedError) throw fetchUpdatedError;
                setPunchStatus(true); // 打卡成功
                setPunchTime(new Date(now)); // 更新 punchTime 為實際打卡時間
                openPunchMsgModal();
                console.log("打卡成功，下班記錄:", updatedRecord);
            }
            // alert(`成功打卡 (${type === "in" ? "上班" : "下班"})`);
        } catch (error) {
            console.error("打卡失敗:", error.message);
            setPunchErrorMsg('打卡失敗，請稍後再試！')
            setPunchStatus(false);
            openPunchMsgModal(); // 確保失敗時顯示訊息

        }
    }

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

        <PunchModal closePunchModal={closePunchModal} handlePunch={handlePunch} modalType={modalType} punchInOutModalRef={punchInOutModalRef} punchTime={punchTime} />
        <PunchMsg punchMsgModaRef={punchMsgModaRef} closePunchMsgModal={closePunchMsgModal} punchStatus={punchStatus} punchErrorMsg={punchErrorMsg} punchTime={punchTime} />

    </>)
}