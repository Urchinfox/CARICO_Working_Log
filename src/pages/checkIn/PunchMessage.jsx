import { useSelector } from "react-redux"
export default function PunchMsg({ punchMsgModaRef, closePunchMsgModal, punchStatus, punchErrorMsg, punchTime }) {
    const { name } = useSelector((state) => state.auth)
    const formatPunchTime = (time) => {
        if (!time) return '載入中...';
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} - ${hours}:${minutes}`;
    };
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
                    {/* <div className="modal-footer border-0">
                        <button type="button" className="btn btn-primary text-white">確定</button>
                    </div> */}
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