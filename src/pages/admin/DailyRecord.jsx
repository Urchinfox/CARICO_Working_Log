import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEditingNoteId, setNoteInput, setEditingRecord, setDateRange, fetchAttendance, setStatusCard, setSelectedStaff, setFilterStaff } from "../../slices/recordsSlice";
import NoteModal from "../../components/NoteModal";
import { Modal } from "bootstrap";
import StatisticsCard from "./StatisticsCard";

export default function DailyRecord() {
    const { dailyRecords, dateRange, loading, statusCard, dailySelectedStaff, dailyFilteredResult } = useSelector((state) => state.record);
    const dispatch = useDispatch();
    const addNoteModal = useRef(null);
    const [startDate, setStartDate] = useState(dateRange?.startDate ?? "");
    const [endDate, setEndDate] = useState(dateRange?.endDate ?? "");

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
    };

    useEffect(() => {
        const stats = {
            late: dailyRecords.filter((item) => item.status.includes("遲到")).length,
            earlyExit: dailyRecords.filter((item) => item.status.includes("早退")).length,
            absence: dailyRecords.filter((item) => item.status === "曠職").length,
            non_checkout: dailyRecords.filter((item) =>
                item.status.includes("未打卡下班")
            ).length,
        };
        dispatch(setStatusCard(stats));
    }, [dailyRecords]);

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

    const displayRecords = useMemo(() => {
        return dailySelectedStaff === "all"
            ? dailyRecords.filter(item => item.name !== "Snan")
            : dailyFilteredResult;
    }, [dailyRecords, dailyFilteredResult, dailySelectedStaff]);

    return (
        <section>
            {JSON.stringify(dailySelectedStaff)}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <p className="fs-4"> {startDate === endDate ? startDate : `${startDate} - ${endDate}`}</p>
                </div>

                <div>

                    <button
                        type="button"
                        className="btn btn-light border_2px dropdown-toggle py-2 px-3 ms-2"
                        data-bs-toggle="dropdown"
                    >
                        選擇日期區間
                    </button>
                    <div className="dropdown-menu p-3 date-range">
                        <form onSubmit={handleDateRangeSubmit}>
                            <label htmlFor="start" className="mb-2">從：</label>
                            <input
                                type="date"
                                id="start"
                                name="start"
                                className="form-control mb-2"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <label htmlFor="end" className="mb-2">到：</label>
                            <input
                                type="date"
                                id="end"
                                name="end"
                                className="form-control mb-2"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <button type="submit" className="btn btn-sm btn-dark w-100">
                                查詢
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <StatisticsCard dataCard={statusCard} />

            {loading && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">載入中...</span>
                    </div>
                </div>
            )}
            <select className="form-select form-select-sm w-25" onChange={(e) => dispatch(setSelectedStaff({ name: e.target.value, type: 'daily' }))}>
                <option defaultValue='all'>選擇員工</option>
                <option value="黃偉宸">黃偉宸</option>
                <option value="許之瑜">許之瑜</option>
            </select>

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