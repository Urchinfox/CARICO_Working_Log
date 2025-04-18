import { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { setSelectedStatus, } from "../slices/recordsSlice";

export default function FilterStatusModal({ close, handleSelect }) {
    const [staffName, setStaffName] = useState('');
    const [status, setStatus] = useState('');
    const dispatch = useDispatch();
    const filterSubmit = () => {
        if (staffName) {
            handleSelect(staffName)
        }
        if (status) {
            dispatch(setSelectedStatus(status));
        }
        close();
    }


    return (<>
        <div className="modal fade" id="filterModal">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content p-4 rounded-4">
                    <div className="modal-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <p className="mb-0 text-secondary">選擇<span className="text-danger">異常</span>類別 *選填*</p>

                            <button type="button" className="btn-close" onClick={close} ></button>
                        </div>

                        <div className="d-flex gap-2 mb-4 flex-wrap">
                            <button type="button" className={`btn filter-btn ${status === '遲到' ? 'active' : ''}`} onClick={() => setStatus('遲到')} >遲到</button>
                            <button type="button" className={`btn filter-btn ${status === '早退' ? 'active' : ''}`} onClick={() => setStatus('早退')} >早退</button>
                            <button type="button" className={`btn filter-btn ${status === '未打下班卡' ? 'active' : ''}`} onClick={() => setStatus('未打下班卡')}>未打卡</button>
                            <button type="button" className={`btn filter-btn ${status === '曠職' ? 'active' : ''}`} onClick={() => setStatus('曠職')}>曠職</button>
                            <button type="button" className={`btn filter-btn ${status === '所有異常' ? 'active' : ''}`} onClick={() => setStatus('所有異常')}>所有異常</button>
                        </div>


                        <div className="mb-4">
                            <p className="mb-0 text-secondary mb-4">選擇員工 *選填*</p>
                            <select className="form-select custom-select py-3" onChange={(e) => setStaffName(e.target.value)}>
                                <option value='default' disabled={staffName ? true : false} >選擇員工</option>
                                <option value="許之瑜">許之瑜</option>
                                <option value="黃偉宸">黃偉宸</option>
                            </select>
                        </div>

                        <div className="text-center">
                            <button type="button" className="btn confirm-btn w-100 py-3" onClick={filterSubmit}>確認</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
}