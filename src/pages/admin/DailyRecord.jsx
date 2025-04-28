import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEditingNoteId, setNoteInput, setEditingRecord, setDateRange, fetchAttendance, setStatusCard, setSelectedStaff, setFilterStaff } from "../../slices/recordsSlice";
import NoteModal from "../../components/NoteModal";
import { Modal } from "bootstrap";
import StatisticsCard from "./StatisticsCard";
import FilterTime from "../../components/FilterTime";

export default function DailyRecord() {
    const { dailyRecords, dateRange, loading, statusCard, dailySelectedStaff, dailyFilteredResult } = useSelector((state) => state.record);
    const dispatch = useDispatch();
    const addNoteModal = useRef(null);
    const [startDate, setStartDate] = useState(dateRange?.startDate ?? "");
    const [endDate, setEndDate] = useState(dateRange?.endDate ?? "");
    const [selectedName, setSelectedName] = useState('all')

    //init
    useEffect(() => {
        dispatch(setSelectedStaff({ name: "all", type: "daily" }));
        dispatch(setFilterStaff({ data: [], type: "daily" }));
    }, [dispatch]);

    useEffect(() => {
        addNoteModal.current = new Modal("#addNoteModal", { backdrop: "static" });
        if (!dateRange?.startDate || !dateRange?.endDate) {
            const today = new Date().toISOString().split("T")[0];
            const defaultRange = { startDate: today, endDate: today };
            dispatch(setDateRange(defaultRange));
            dispatch(fetchAttendance({ mode: "daily", dateRange: defaultRange }));
        }
        if (dailySelectedStaff === "all") {
            dispatch(setFilterStaff({ data: [], type: "daily" }));
        } else {
            dispatch(setFilterStaff({
                data: dailyRecords.filter(item => item.name === dailySelectedStaff),
                type: "daily"
            }));
        }
    }, [dispatch, dateRange, dailySelectedStaff, dailyRecords]);

    const openNoteModal = () => {
        addNoteModal.current.show();
    };

    const closeNoteModal = () => {
        addNoteModal.current.hide();
    };

    const handleDateRangeSubmit = (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            alert("請選擇開始和結束日期哦");
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            alert("結束日期不能早於開始日期哦");
            return;
        }
        const range = { startDate, endDate };
        dispatch(setDateRange(range));
        dispatch(fetchAttendance({ mode: "daily", dateRange: range }));
        dispatch(setSelectedStaff({ name: selectedName, type: 'daily' }))

    };
    const displayRecords = useMemo(() => {
        return dailySelectedStaff === "all"
            ? dailyRecords.filter(item => item.name !== "Snan")
            : dailyFilteredResult;
    }, [dailyRecords, dailyFilteredResult, dailySelectedStaff]);

    useEffect(() => {
        const stats = {
            late: displayRecords.filter((item) => item.status.includes("遲到")).length,
            earlyExit: displayRecords.filter((item) => item.status.includes("早退")).length,
            absence: displayRecords.filter((item) => item.status === "曠職").length,
            non_checkout: displayRecords.filter((item) =>
                item.status.includes("未打卡下班")
            ).length,
        };
        dispatch(setStatusCard(stats));
    }, [displayRecords]);

    const getWeekday = (date) => {
        const weekdays = [
            "日",
            "一",
            "二",
            "三",
            "四",
            "五",
            "六",
        ];
        return weekdays[new Date(date).getDay()];
    };



    return (
        <section>

            <div className="container-fluid">
                <div className="row">
                    <div className="col-4">
                        <FilterTime
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                            handleDateRangeSubmit={handleDateRangeSubmit}
                            startDate={startDate}
                            endDate={endDate}
                            setSelectedName={setSelectedName}
                        />
                    </div>
                    <div className="col-4 d-flex flex-column">
                        <div className="h-100">
                            <StatisticsCard dataCard={statusCard} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <p className="fs-4"> {startDate === endDate ? startDate : `${startDate} - ${endDate}`}</p>
            </div>

            {loading && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">載入中...</span>
                    </div>
                </div>
            )}

            <div className="table-responsive r-24 border_2px mt-5 mb-5">
                <table className="table table-bordered text-center align-middle">
                    <thead className="table-light">
                        <tr>
                            <th className="col-number">#</th>
                            <th className="col-name">員工</th>
                            <th className="col-date">日期</th>
                            <th className="col-time">打卡記錄</th>
                            <th className="col-status">狀態</th>
                            <th className="col-location">地點</th>
                            <th className="col-notes">備註</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayRecords.length === 0 ? (
                            <tr>
                                <td colSpan="7">無紀錄</td>
                            </tr>
                        ) : (
                            displayRecords.map((record, index) => (
                                <tr key={`${record.user_id}-${record.date}`}>
                                    <td>{index + 1}</td>
                                    <td>{record.name}</td>
                                    <td>{record.date} ({getWeekday(record.date)})</td>
                                    <td>
                                        {record.check_in_time} — {record.check_out_time}
                                    </td>
                                    <td>
                                        <span
                                            className={`${record.status === "正常"
                                                ? "status-normal"
                                                : "status-abnormal"
                                                }`}
                                        >
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>公司外</td>
                                    <td>
                                        {record.notes}{" "}
                                        <button
                                            className="underline border-0 p-2 ms-2"
                                            onClick={() => {
                                                openNoteModal();
                                                dispatch(
                                                    setEditingNoteId(
                                                        `${record.user_id}-${record.date}`
                                                    )
                                                );
                                                dispatch(
                                                    setNoteInput(
                                                        record.notes === "無" ? "" : record.notes
                                                    )
                                                );
                                                dispatch(setEditingRecord(record));
                                            }}
                                        >
                                            編輯
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <NoteModal closeNoteModal={closeNoteModal} />
        </section>
    );
}