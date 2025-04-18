import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate, setEditingNoteId, setNoteInput, updateNote, setEditingRecord } from "../../slices/recordsSlice";
import NoteModal from "../../components/NoteModal";
import { useEffect, useRef } from "react";
import { Modal } from "bootstrap";

export default function DailyRecord() {
    const { dailyRecords, selectedDate, editingNoteId, noteInput } = useSelector((state) => state.record);
    const dispatch = useDispatch();
    const addNoteModal = useRef(null);

    const openNoteModal = () => {
        addNoteModal.current.show();
    }
    const closeNoteModal = () => {
        addNoteModal.current.hide();
    }

    useEffect(() => {
        addNoteModal.current = new Modal('#addNoteModal', { backdrop: 'static' });
    }, [])

    return (
        <section>
            <div>
                <h2>單日查詢</h2>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => dispatch(setSelectedDate(e.target.value))}
                />

                {/* <table>
                    <thead>
                        <tr>
                            <th>員工名稱</th>
                            <th>上班時間</th>
                            <th>下班時間</th>
                            <th>狀態</th>
                            <th>備注</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dailyRecords.length === 0 ? (
                            <tr>
                                <td colSpan="6">無紀錄</td>
                            </tr>
                        ) : dailyRecords.map(record => (
                            <tr key={record.user_id}>
                                <td>{record.name}</td>
                                <td>{record.check_in_time}</td>
                                <td>{record.check_out_time}</td>
                                <td>{record.status}</td>
                                <td>
                                    {editingNoteId === `${record.user_id}-${record.date}` ? (
                                        <input
                                            type="text"
                                            value={noteInput}
                                            onChange={(e) => dispatch(setNoteInput(e.target.value))}
                                            placeholder="輸入備注"
                                        />
                                    ) : (
                                        record.notes
                                    )}
                                </td>
                                <td>
                                    {editingNoteId === `${record.user_id}-${record.date}` ? (
                                        <>
                                            <button
                                                className="btn btn-success btn-sm me-1"
                                                onClick={() => dispatch(updateNote({ record, newNote: noteInput, date: record.date }))}
                                            >
                                                儲存
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => {
                                                    dispatch(setEditingNoteId(null));
                                                    dispatch(setNoteInput(""));
                                                }}
                                            >
                                                取消
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                dispatch(setEditingNoteId(`${record.user_id}-${record.date}`));
                                                dispatch(setNoteInput(record.notes === "無" ? "" : record.notes));
                                            }}
                                        >
                                            編輯備注
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                        }

                    </tbody>
                </table> */}
            </div>



            <div className="px-5">
                <div className="table-responsive r-24 border_2px">
                    <table className="table table-bordered text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>員工</th>
                                <th>日期</th>
                                <th>打卡記錄</th>
                                <th>狀態</th>
                                <th>地點</th>
                                <th>備註</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7">無紀錄</td>
                                </tr>
                            ) : (
                                dailyRecords.map((record, index) => (
                                    <tr key={`${record.user_id}-${record.date}`}>
                                        <td>{index + 1}</td>
                                        <td>{record.name}</td>
                                        <td>{record.date}</td>
                                        <td className="nowrap">
                                            {record.check_in_time} — {record.check_out_time}
                                        </td>
                                        <td>
                                            <span className={`${record.status === '正常' ? 'status-normal' : 'status-abnormal'}`}>{record.status}</span>
                                        </td>
                                        <td>公司外</td>
                                        <td>
                                            {record.notes} <br />
                                            <button
                                                className="underline border-0 p-2 ms-2"
                                                onClick={() => {
                                                    openNoteModal()
                                                    dispatch(setEditingNoteId(`${record.user_id}-${record.date}`));
                                                    dispatch(setNoteInput(record.notes === "無" ? "" : record.notes));
                                                    dispatch(setEditingRecord(record));
                                                }}
                                            >編輯備註
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {/* <tr>
                            <td>1</td>
                            <td>許之瑜 <br /><small className="small-block">040</small></td>
                            <td>2025/2/17</td>
                            <td className="nowrap">08:57 AM — 06:02 PM</td>
                            <td><span className="status-normal">正常</span></td>
                            <td>公司外</td>
                            <td>請病假/生理假 <button className="underline border-0 p-2 ms-2" data-bs-toggle="modal"
                                data-bs-target="#noteModal">新增備註</button></td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>許之瑜 <br /><small className="small-block">040</small></td>
                            <td>2025/2/17</td>
                            <td className="nowrap">08:57 AM — 06:02 PM</td>
                            <td><span className="status-normal">正常</span></td>
                            <td>公司外</td>
                            <td>請病假/生理假 <button className="underline border-0 p-2 ms-2" data-bs-toggle="modal"
                                data-bs-target="#noteModal">新增備註</button></td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>許之瑜 <br /><small className="small-block">040</small></td>
                            <td>2025/2/17</td>
                            <td className="nowrap">08:57 AM — 06:02 PM</td>
                            <td><span className="status-abnormal">異常:遲到</span></td>
                            <td>公司外</td>
                            <td>請病假/生理假 <button className="underline border-0 p-2 ms-2" data-bs-toggle="modal"
                                data-bs-target="#noteModal">新增備註</button></td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>許之瑜 <br /><small className="small-block">040</small></td>
                            <td>2025/2/17</td>
                            <td className="nowrap">08:57 AM — 06:02 PM</td>
                            <td><span className="status-abnormal">異常:未打卡</span></td>
                            <td>公司外</td>
                            <td>請病假/生理假 <button className="underline border-0 p-2 ms-2" data-bs-toggle="modal"
                                data-bs-target="#noteModal">新增備註</button></td>
                        </tr> */}
                        </tbody>
                    </table>
                </div>
            </div>
            <NoteModal closeNoteModal={closeNoteModal} />

        </section>
    );
}