import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEditingNoteId, setNoteInput, setEditingRecord, setDateRange, fetchAttendance } from "../../slices/recordsSlice";
import NoteModal from "../../components/NoteModal";
import { Modal } from "bootstrap";

export default function DailyRecord() {
    const { dailyRecords, dateRange, loading } = useSelector((state) => state.record);
    const dispatch = useDispatch();
    const addNoteModal = useRef(null);
    const [startDate, setStartDate] = useState(dateRange?.startDate ?? "");
    const [endDate, setEndDate] = useState(dateRange?.endDate ?? "");
    const [today, setToday] = useState();

    useEffect(() => {
        addNoteModal.current = new Modal("#addNoteModal", { backdrop: "static" });

        //default the day
        if (!dateRange?.startDate || !dateRange?.endDate) {
            const today = new Date().toISOString().split("T")[0];
            const defaultRange = {
                startDate: today,
                endDate: today,
            };
            dispatch(setDateRange(defaultRange));
            dispatch(fetchAttendance({ mode: "daily", dateRange: defaultRange }));
        }
    }, [dispatch, dateRange]);

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

    return (
        <section>

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

            {loading && (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">載入中...</span>
                    </div>
                </div>
            )}
            <div className="table-responsive r-24 border_2px">
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
                        {dailyRecords.length === 0 ? (
                            <tr>
                                <td colSpan="7">無紀錄</td>
                            </tr>
                        ) : (
                            dailyRecords
                                .filter((item) => item.name !== "Snan")
                                .map((record, index) => (
                                    <tr key={`${record.user_id}-${record.date}`}>
                                        <td>{index + 1}</td>
                                        <td>{record.name}</td>
                                        <td>{record.date}</td>
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