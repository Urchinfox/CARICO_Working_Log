export default function StatisticsCard({ dataCard }) {
    return (

        <div className="summary-box r-24 bg-white h-100">
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
    )
}