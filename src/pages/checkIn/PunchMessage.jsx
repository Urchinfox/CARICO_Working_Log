import { useSelector } from "react-redux"
import { formatPunchTime } from "./formatTime";

export default function PunchMsg({ punchMsgModaRef, closePunchMsgModal }) {
    const { name } = useSelector((state) => state.auth)
    const { punchStatus, punchErrorMsg, punchTime } = useSelector(state => state.punch);

    return (<>
        {punchStatus ? (<div className="modal fade" ref={punchMsgModaRef}>
            <div className="modal-dialog">
                <div className="modal-content border border-2 border-black r-24">
                    <div className="modal-header border-0 justify-content-between">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-check-circle fs-3 text-primary me-2"></i>
                            <h5 className="modal-title" >打卡成功!</h5>
                        </div>
                        <div>
                            <span>2秒前</span>
                            <button type="button" className="btn-close" onClick={closePunchMsgModal}></button>
                        </div>

                    </div>
                    <div className="modal-body fs-5 pb-5">{name} 已於 <span className="text-primary">{formatPunchTime(punchTime)}</span> 打卡</div>
                </div>
            </div>
        </div>) :
            <div className="modal fade" ref={punchMsgModaRef}>
                <div className="modal-dialog">
                    <div className="modal-content border border-2 border-black r-24">
                        <div className="modal-header border-0 justify-content-between">
                            <div className="d-flex align-items-center">
                                <i className="bi bi-exclamation-triangle fs-3 text-primary me-2"></i>
                                <h5 className="modal-title">打卡失敗!</h5>
                            </div>
                            <div>
                                <span>2秒前</span>
                                <button type="button" className="btn-close" onClick={closePunchMsgModal}></button>
                            </div>

                        </div>

                        <div className="modal-body fs-5 pb-5">{punchErrorMsg}</div>

                    </div>
                </div>
            </div>

        }

    </>)
}