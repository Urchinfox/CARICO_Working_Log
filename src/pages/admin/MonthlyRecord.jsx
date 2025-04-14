import { useSelector, useDispatch } from "react-redux";
import { setSelectedMonth, setEditingNoteId, setNoteInput, updateNote } from "../../slices/recordsSlice";

export default function MonthlyRecord() {
    const { monthlyRecords, selectedMonth, editingNoteId, noteInput } = useSelector((state) => state.record);
    const dispatch = useDispatch();
    return (
        <section>
            <div>
                <h2>打卡記錄 - 整月</h2>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
                />
                <table>
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>員工名稱</th>
                            <th>上班時間</th>
                            <th>下班時間</th>
                            <th>狀態</th>
                            <th>備注</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyRecords.length === 0 ? (
                            <tr>
                                <td colSpan="6">無紀錄</td>
                            </tr>
                        ) : monthlyRecords.map(record => (
                            <tr key={`${record.user_id}-${record.date}`}>
                                <td>{record.date}</td>
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
                        ))}

                    </tbody>
                </table>
            </div>
        </section>
    );


}