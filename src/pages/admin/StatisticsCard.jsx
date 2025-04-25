export default function StatisticsCard({ dataCard }) {
    return (
        <div className="container-fluid mt-2">
            <div className="row">
                <div className="col-4">
                    <div className="border-primary summary-box r-24 bg-white">
                        <h5 className="mb-3 text-primary">區間設定</h5>
                        <div>

                            {/* <button
                                    type="button"
                                    className="btn btn-light border_2px dropdown-toggle py-2 px-3 ms-2"
                                    data-bs-toggle="dropdown"
                                >
                                    選擇日期區間
                                </button> */}
                            <div className="date-range">
                                <form className="d-flex align-items-center flex-wrap">
                                    <div>
                                        <input
                                            type="date"
                                            id="start"
                                            name="start"
                                            className="form-control"
                                        // value={''}
                                        />

                                    </div>
                                    <i className="bi bi-arrow-right-short fs-3 text-primary"></i>
                                    <div>
                                        <input
                                            type="date"
                                            id="end"
                                            name="end"
                                            className="form-control"
                                        // value={''}
                                        />

                                    </div>
                                    {/* <button type="submit" className="btn btn-sm btn-dark w-100">
                                            查詢
                                        </button> */}
                                </form>
                            </div>



                        </div>

                        <div className="mt-2">
                            <select className="form-select form-select-sm w-100 py-2" >
                                <option defaultChecked=''>選擇員工</option>
                                <option value="1">黃偉宸</option>
                                <option value="2">許之瑜</option>
                            </select>
                        </div>
                    </div>

                </div>

                <div className="col-4">

                    <div className="summary-box r-24 bg-white">
                        <h5>異常紀錄</h5>
                        <div className="d-flex mt-5 justify-content-between">

                            <div>
                                <span className="text-secondary fs-6">遲到</span>
                                <br />
                                <h4 className="fw-light num">{dataCard.late}</h4>
                            </div>
                            <div className="ms-3">
                                <span className="text-secondary fs-6">早退</span>
                                <br />
                                <h4 className="fw-light num">{dataCard.earlyExit}</h4>
                            </div>
                            <div className="ms-3">
                                <span className="text-secondary fs-6">曠職</span>
                                <br />
                                <h4 className="fw-light num">{dataCard.absence}</h4>
                            </div>
                            <div className="ms-3">
                                <span className="text-secondary fs-6">未打下班卡</span>
                                <br />
                                <h4 className="fw-light num">{dataCard.non_checkout}</h4>
                            </div>

                        </div>
                    </div>

                </div>



            </div>

        </div>


    )
}