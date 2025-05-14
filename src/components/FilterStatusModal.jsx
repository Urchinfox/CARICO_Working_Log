import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { setSelectedStatus, setSelectedWeekday, fetchStaffList } from "../slices/recordsSlice";

export default function FilterStatusModal({ close, handleSelect }) {
    const [staffName, setStaffName] = useState('');
    const [status, setStatus] = useState('');
    const [weekday, setWeekday] = useState([]);
    const { staffList } = useSelector(state => state.record)

    const dispatch = useDispatch();
    const filterSubmit = () => {
        if (staffName) {
            handleSelect(staffName)
        }
        if (status) {
            dispatch(setSelectedStatus(status));
        }
        if (weekday) {
            dispatch(setSelectedWeekday(weekday))
        }
        close();
        setWeekday([]);
        setStatus('');
        setStaffName('');
    }

    const toggleWeekday = (day) => {
        setWeekday((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const clearWeekdays = () => {
        setWeekday([]);
    };

    useEffect(() => {
        dispatch(fetchStaffList())
    }, [])


    return (<>
        <div className="modal fade" id="filterModal">
            {JSON.stringify(staffList)}
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
                            <button type="button" className={`btn filter-btn ${status === '未打卡下班' ? 'active' : ''}`} onClick={() => setStatus('未打卡下班')}>未打卡</button>
                            <button type="button" className={`btn filter-btn ${status === '曠職' ? 'active' : ''}`} onClick={() => setStatus('曠職')}>曠職</button>
                            <button type="button" className={`btn filter-btn ${status === '所有異常' ? 'active' : ''}`} onClick={() => setStatus('所有異常')}>所有異常</button>
                        </div>


                        <div className="mb-4">
                            <p className="mb-0 text-secondary mb-2">選擇星期 *選填*</p>
                            <div className="d-flex gap-2 flex-wrap">
                                <button
                                    type="button"
                                    className={`btn filter-btn ${weekday.length === 0 ? "active" : ""}`}
                                    onClick={clearWeekdays}
                                >
                                    全部
                                </button>
                                <button
                                    type="button"
                                    className={`btn filter-btn ${weekday.includes(1) ? "active" : ""}`}
                                    onClick={() => toggleWeekday(1)}
                                >
                                    一
                                </button>
                                <button
                                    type="button"
                                    className={`btn filter-btn ${weekday.includes(2) ? "active" : ""}`}
                                    onClick={() => toggleWeekday(2)}
                                >
                                    二
                                </button>
                                <button
                                    type="button"
                                    className={`btn filter-btn ${weekday.includes(3) ? "active" : ""}`}
                                    onClick={() => toggleWeekday(3)}
                                >
                                    三
                                </button>
                                <button
                                    type="button"
                                    className={`btn filter-btn ${weekday.includes(4) ? "active" : ""}`}
                                    onClick={() => toggleWeekday(4)}
                                >
                                    四
                                </button>
                                <button
                                    type="button"
                                    className={`btn filter-btn ${weekday.includes(5) ? "active" : ""}`}
                                    onClick={() => toggleWeekday(5)}
                                >
                                    五
                                </button>
                                <button
                                    type="button"
                                    className={`btn filter-btn ${weekday.includes(6) ? "active" : ""}`}
                                    onClick={() => toggleWeekday(6)}
                                    disabled
                                >
                                    六
                                </button>
                                <button
                                    type="button"
                                    className={`btn filter-btn ${weekday.includes(0) ? "active" : ""}`}
                                    onClick={() => toggleWeekday(0)}
                                    disabled
                                >
                                    日
                                </button>
                            </div>
                        </div>


                        <div className="mb-4">
                            <p className="mb-0 text-secondary mb-4">選擇員工 *選填*</p>
                            <select className="form-select custom-select py-3" value={staffName}
                                onChange={(e) => setStaffName(e.target.value)}>
                                <option value='default' disabled={!!staffName} >選擇員工</option>
                                {
                                    staffList.map((name, index) => {
                                        return (
                                            <option key={index} value={name}>{name}</option>
                                        )
                                    })
                                }
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