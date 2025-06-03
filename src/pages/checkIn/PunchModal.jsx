import { useSelector, useDispatch } from "react-redux";
import { handlePunch } from "../../slices/punchSlice";
import { formatPunchTime } from "./formatTime";

export default function PunchModal({ closePunchModal, punchInOutModalRef }) {
    const dispatch = useDispatch();
    const { modalType, punchTime, isLoading } = useSelector(state => state.punch);

    return (
        <div className="modal fade" ref={punchInOutModalRef}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{modalType === 'punchin' ? '上班打卡' : '下班打卡'}</h5>
                        <button type="button" className="btn-close" onClick={closePunchModal}></button>
                    </div>
                    <div className="modal-body">
                        <p>{formatPunchTime(punchTime)}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={closePunchModal}>取消</button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => dispatch(handlePunch(modalType === 'punchin' ? 'in' : 'out'))}
                            disabled={isLoading}
                        >
                            確定打卡
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}




