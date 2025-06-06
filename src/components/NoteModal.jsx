// import { useSelector, useDispatch } from "react-redux";
// import { setEditingNoteId, setNoteInput, setEditingRecord, updateNote } from "../slices/recordsSlice";

// export default function NoteModal({ closeNoteModal }) {
//     const { noteInput, editingRecord } = useSelector((state) => state.record);
//     const dispatch = useDispatch();

//     return (
//         <div
//             className="modal fade"
//             id="addNoteModal"
//         >
//             <div className="modal-dialog">
//                 <div className="modal-content">
//                     <div className="modal-header">
//                         <h5 className="modal-title" id="noteModalLabel">
//                             編輯備註
//                         </h5>
//                         <button
//                             type="button"
//                             className="btn-close"
//                             onClick={() => {
//                                 closeNoteModal()
//                                 dispatch(setEditingNoteId(null));
//                                 dispatch(setNoteInput(""));
//                                 dispatch(setEditingRecord(null));
//                             }}
//                         ></button>
//                     </div>
//                     <div className="modal-body">
//                         <textarea
//                             className="form-control"
//                             rows="3"
//                             value={noteInput}
//                             onChange={(e) => dispatch(setNoteInput(e.target.value))}
//                             placeholder="請輸入備註..."
//                         />
//                     </div>
//                     <div className="modal-footer">
//                         <button
//                             type="button"
//                             className="btn btn-outline-dark border_2px"
//                             onClick={() => {
//                                 closeNoteModal()
//                                 dispatch(setEditingNoteId(null));
//                                 dispatch(setNoteInput(""));
//                                 dispatch(setEditingRecord(null));
//                             }}
//                         >
//                             取消
//                         </button>
//                         <button
//                             type="button"
//                             className="btn btn-dark"
//                             data-bs-dismiss="modal"
//                             onClick={() => {
//                                 if (editingRecord) {
//                                     dispatch(
//                                         updateNote({
//                                             record: editingRecord,
//                                             newNote: noteInput,
//                                             date: editingRecord.date,
//                                         })
//                                     );
//                                 }
//                             }}
//                         >
//                             儲存
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }



import { useSelector, useDispatch } from "react-redux";
import { setEditingNoteId, setNoteInput, setEditingRecord, updateNote } from "../slices/recordsSlice";

export default function NoteModal({ closeNoteModal }) {
    const { noteInput, editingRecord, error } = useSelector((state) => state.record);
    const dispatch = useDispatch();

    const handleSave = async () => {
        if (editingRecord) {
            try {
                await dispatch(
                    updateNote({
                        record: editingRecord,
                        newNote: noteInput,
                        date: editingRecord.date,
                    })
                ).unwrap(); // 使用 unwrap 捕獲錯誤
                closeNoteModal();
                dispatch(setEditingNoteId(null));
                dispatch(setNoteInput(""));
                dispatch(setEditingRecord(null));
            } catch (err) {
                alert(`儲存備注失敗：${err.message || '未知錯誤'}`);
            }
        }
    };

    return (
        <div className="modal fade" id="addNoteModal">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="noteModalLabel">
                            編輯備註
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => {
                                closeNoteModal();
                                dispatch(setEditingNoteId(null));
                                dispatch(setNoteInput(""));
                                dispatch(setEditingRecord(null));
                            }}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <textarea
                            className="form-control"
                            rows="3"
                            value={noteInput}
                            onChange={(e) => dispatch(setNoteInput(e.target.value))}
                            placeholder="請輸入備註..."
                        />
                        {error && <div className="text-danger mt-2">{error}</div>}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-dark border_2px"
                            onClick={() => {
                                closeNoteModal();
                                dispatch(setEditingNoteId(null));
                                dispatch(setNoteInput(""));
                                dispatch(setEditingRecord(null));
                            }}
                        >
                            取消
                        </button>
                        <button
                            type="button"
                            className="btn btn-dark"
                            onClick={handleSave}
                        >
                            儲存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}