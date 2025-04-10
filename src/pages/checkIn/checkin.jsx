import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../../supabase";
import Navbar from "../../components/header/header";
import { roleValidate } from "../../slices/authSlice";
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { checkSession } from "../../slices/authSlice";




export default function CheckIn() {

    const navigate = useNavigate()
    const dispatch = useDispatch();
    // const [userInfo, setUserInfo] = useState()
    const { role, loading, name } = useSelector((state) => state.auth)
    const [clockInTime, setClockInTime] = useState("00:00");
    const [clockOutTime, setClockOutTime] = useState("00:00");


    useEffect(() => {
        dispatch(checkSession(navigate));
        dispatch(roleValidate());
    }, [navigate])

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

    const handlePunch = async (type) => {
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
                    alert("你今天已經打過上班卡了！");
                    return;
                }
                const { error } = await supabase.from("attendance").insert({
                    user_id: userId,
                    check_in_time: now,
                    attendance_date: today,
                    status: new Date(now).getHours() > 9 ? "遲到" : "正常",
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
                console.log("打卡成功，上班記錄:", newRecord);
            } else if (type === "out") {
                if (!existingRecord) {
                    alert("請先打上班卡！");
                    return;
                }
                if (existingRecord.check_out_time) {
                    alert("你今天已經打過下班卡了！");
                    return;
                }
                const workHours = (new Date(now) - new Date(existingRecord.check_in_time)) / 3600000;
                const expectedOutTime = new Date(new Date(existingRecord.check_in_time).getTime() + 9 * 3600000);
                const status = new Date(now) < expectedOutTime ? "早退" : existingRecord.status;

                const { error } = await supabase
                    .from("attendance")
                    .update({
                        check_out_time: now,
                        work_hours: workHours.toFixed(2),
                        status: status,
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
                console.log("打卡成功，下班記錄:", updatedRecord);
            }
            alert(`成功打卡 (${type === "in" ? "上班" : "下班"})`);
        } catch (error) {
            console.error("打卡失敗:", error.message);
            alert("打卡失敗，請稍後再試！");
        }
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
                            <p className="fs-6 text-secondary">2025/02/08</p>
                            <div className="mt-5">
                                <p className="fs-5 mb-3">上班時間: <span className="clock_status clock_status_delay">{clockInTime}</span></p>
                                <p className="fs-5">下班時間: <span className="clock_status clock_status_delay">{clockOutTime}</span></p>
                            </div>
                        </div>


                        <button type="button" className="btn btn-primary" onClick={() => handlePunch('in')}>Punch In</button>
                        <button type="button" className="btn btn-secondary" onClick={() => handlePunch('out')}>Punch Out</button>

                        {/* <!-- Modal 按鈕 --> */}
                        <div className="mt-5 text-center d-flex">
                            <button type="button" className="btn btn_outline btn_outline_disabled r-16 me-2" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                上班打卡
                            </button>
                            <button type="button" className="btn btn_outline btn_outline_default r-16 text-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                下班打卡
                            </button>
                        </div>
                        {/* <!-- Modal 按鈕 End--> */}



                    </div>
                </div>

            </div>
        </section>

        {/* <!-- Modal 元件 clock in --> */}
        <div className="modal fade" id="exampleModal" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content border border-2 border-black r-24">
                    <div className="modal-header border-0 justify-content-between">
                        {/* <!-- header left --> */}
                        <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle fs-3 text-primary me-2"></i>
                            <h5 className="modal-title" id="exampleModalLabel">打卡成功!</h5>
                        </div>
                        {/* <!-- header right --> */}
                        <div>
                            <span>2秒前</span>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                    </div>
                    <div className="modal-body fs-5">040 許之瑜 已於 <span className="text-primary"> 8:59:21</span> 打卡</div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-primary text-white" data-bs-dismiss="modal">確定</button>
                    </div>
                </div>
            </div>
        </div>
    </>)
}