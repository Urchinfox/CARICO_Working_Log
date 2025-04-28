import { useDispatch } from "react-redux"
import { setSelectedStaff } from "../slices/recordsSlice";
export default function FilterTime({ setStartDate, setEndDate, handleDateRangeSubmit, endDate, startDate, setSelectedName }) {
    const dispatch = useDispatch();
    return (<>
        <div className="border-primary summary-box r-24 bg-white">
            <h5 className="mb-3 text-primary">區間設定</h5>
            <div>

                <div className="date-range">
                    <form onSubmit={handleDateRangeSubmit}>
                        <div className="d-flex align-items-center justify-content-between flex-wrap my-4">
                            <div>
                                <input
                                    type="date"
                                    id="start"
                                    name="start"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)} />

                            </div>
                            <i className="bi bi-arrow-right-short fs-3 text-primary"></i>
                            <div>
                                <input
                                    type="date"
                                    id="end"
                                    name="end"
                                    className="form-control"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="mt-2">
                            <select className="form-select form-select-sm w-100  py-2" onChange={(e) => setSelectedName(e.target.value)}>
                                <option value='all'>全部員工</option>
                                <option value="黃偉宸">黃偉宸</option>
                                <option value="許之瑜">許之瑜</option>
                            </select>
                        </div>
                        <div className="text-end mt-2">
                            <button type="submit" className="p-1 fs-6 btn btn-sm btn-dark px-3 py-2 mt-2">
                                套用
                            </button>

                        </div>
                    </form>
                </div>



            </div>


        </div>
    </>)

}