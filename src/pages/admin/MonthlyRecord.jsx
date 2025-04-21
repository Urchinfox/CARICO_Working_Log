import { useSelector, useDispatch } from "react-redux";
import { setSelectedMonth, setEditingNoteId, setNoteInput, setFilterStaff, setSelectedStaff, setSelectedStatus, setEditingRecord, setSelectedWeekday } from "../../slices/recordsSlice";
import { useEffect, useRef, useState, useMemo } from "react";
import NoteModal from "../../components/NoteModal";
import { Modal } from "bootstrap";
import FilterStatusModal from "../../components/FilterStatusModal";
import StatisticsCard from "./StatisticsCard";

export default function MonthlyRecord() {
    const { monthlyRecords, selectedMonth, individual, selectedStaff, selectedStatus, selectedWeekday } = useSelector((state) => state.record);
    const addNoteModal = useRef();
    const filterStatusModal = useRef(null);
    const [dataCard, setDataCard] = useState({
        late: 0,
        earlyExit: 0,
        absence: 0,
        non_checkout: 0
    });

    const dispatch = useDispatch();


    const openNoteModal = () => {
        addNoteModal.current.show();
    }
    const closeNoteModal = () => {
        addNoteModal.current.hide();
    }

    const openFilterModal = () => {
        filterStatusModal.current.show();
    }

    const closeFilterModal = () => {
        filterStatusModal.current.hide();
    }

    //Modal
    useEffect(() => {
        addNoteModal.current = new Modal('#addNoteModal', { backdrop: 'static' })
        filterStatusModal.current = new Modal('#filterModal')
    }, [])

    const handleSelect = (name) => {
        const staffName = name;
        console.log(staffName)
        if (staffName === "all") {
            dispatch(setSelectedStaff("all"));
            dispatch(setFilterStaff([])); // empty individual
            // dispatch(setSelectedStatus('')); //empty status
        } else {
            const filterStaff = monthlyRecords.filter(item => item.name === staffName);
            dispatch(setSelectedStaff(staffName)); //select name
            dispatch(setFilterStaff(filterStaff)); //render
            dispatch(setSelectedStatus('')); //empty status
        }
    };

    //staff filter
    useEffect(() => {
        if (selectedStaff !== "all") {
            const filterStaff = monthlyRecords.filter(item => item.name === selectedStaff);
            dispatch(setFilterStaff(filterStaff));
        }
    }, [monthlyRecords, selectedStaff, dispatch]);

    const getWeekday = (date) => {
        const weekdays = [
            "日",
            "一",
            "二",
            "三",
            "四",
            "五",
            "六",
        ];
        return weekdays[new Date(date).getDay()];
    };

    const displayRecords = useMemo(() => {
        let records = selectedStaff === "all" ? monthlyRecords : individual;
        if (selectedStatus) {
            if (selectedStatus === "所有異常") {
                records = records.filter((item) => item.status !== "正常");
            } else {
                records = records.filter((item) => item.status.includes(selectedStatus));
            }
        }
        if (selectedWeekday.length > 0) {
            records = records.filter((item) =>
                selectedWeekday.includes(new Date(item.date).getDay())
            );
        }
        return records;
    }, [monthlyRecords, individual, selectedStaff, selectedStatus, selectedWeekday]);

    // const renderRecords = () => {

    //     let displayRecords = selectedStaff === "all" ? monthlyRecords : individual;
    //     if (selectedStatus) {
    //         if (selectedStatus === '所有異常') {
    //             displayRecords = displayRecords.filter(item => item.status !== '正常');
    //         } else {
    //             displayRecords = displayRecords.filter(item => item.status.includes(selectedStatus));
    //         }
    //     }

    //     if (selectedWeekday.length > 0) {
    //         displayRecords = displayRecords.filter((item) =>
    //             selectedWeekday.includes(new Date(item.date).getDay())
    //         );
    //     }

    //     return displayRecords;
    // }

    // const displayRecords = renderRecords();

    useEffect(() => {
        const stats = {
            late: displayRecords.filter((item) => item.status.includes("遲到")).length,
            earlyExit: displayRecords.filter((item) => item.status.includes("早退")).length,
            absence: displayRecords.filter((item) => item.status === "曠職").length,
            non_checkout: displayRecords.filter((item) =>
                item.status.includes("未打卡下班")
            ).length,
        };
        setDataCard(stats);
        console.log("Stats updated:", stats);
    }, [displayRecords]);


    return (<>
        <StatisticsCard dataCard={dataCard} />

        <div className="container">
            <h2>整月總覽</h2>

            <input
                type="month"
                value={selectedMonth}
                onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
                className="border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />


        </div>
        <section>
            <div>

                {/* <!-- 搜尋與按鈕 --> */}
                <div className="d-flex justify-content-between my-5 px-5">

                    <div className="d-flex align-items-center w-50">
                        <input type="text" className="form-control r-99 py-2 w-50" placeholder="🔍 搜尋" />
                        <button type="button" className="btn btn-dark border_2px d-flex align-items-center r-16 p-2 ms-2" onClick={openFilterModal}>
                            <i className="bi bi-filter-circle fs-4 me-1"></i>篩選
                        </button>

                        <div className="ms-3">
                            <span className={`me-3 badge text-bg-info position-relative ${selectedStaff !== 'all' ? 'd-inline-block' : 'd-none'}`}><i className="bi bi-x-circle position-absolute top-0 start-100 translate-middle text-secondary" style={{ cursor: 'pointer' }} onClick={() => handleSelect('all')}> </i>{selectedStaff}</span>

                            <span className={`me-3 badge text-bg-info position-relative ${selectedStatus !== '' ? 'd-inline-block' : 'd-none'}`}><i className="bi bi-x-circle position-absolute top-0 start-100 translate-middle text-secondary" style={{ cursor: 'pointer' }} onClick={() => dispatch(setSelectedStatus(''))}></i>{selectedStatus}</span>
                            {
                                selectedWeekday.map((day, index) => {
                                    return (
                                        <span key={index} className={`me-3 badge text-bg-info position-relative ${selectedWeekday.length > 0 ? 'd-inline-block' : 'd-none'}`}><i className="bi bi-x-circle position-absolute top-0 start-100 translate-middle text-secondary" style={{ cursor: 'pointer' }}
                                            onClick={() => dispatch(setSelectedWeekday(selectedWeekday.filter(d => d !== day)))
                                            } ></i>{day}</span>
                                    )
                                })
                            }

                        </div>


                    </div>


                </div>
                <FilterStatusModal close={closeFilterModal} handleSelect={handleSelect} />

            </div>

            <div className="px-5">
                <div className="table-responsive r-24 border_2px">
                    <table className="table table-bordered text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>員工</th>
                                <th>日期</th>
                                <th>打卡記錄</th>
                                <th>狀態</th>
                                <th>地點</th>
                                <th>備註</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7">無紀錄</td>
                                </tr>
                            ) : (
                                displayRecords.map((record, index) => (
                                    <tr key={`${record.user_id}-${record.date}`}>
                                        <td>{index + 1}</td>
                                        <td>{record.name}</td>
                                        <td>{record.date} ({getWeekday(record.date)})</td>
                                        <td className="nowrap">
                                            {record.check_in_time} — {record.check_out_time}
                                        </td>
                                        <td>
                                            <span className={`${record.status === '正常' ? 'status-normal' : 'status-abnormal'}`}>{record.status}</span>
                                        </td>
                                        <td>公司外</td>
                                        <td>
                                            {record.notes} <br />
                                            <button
                                                className="underline border-0 p-2 ms-2"
                                                onClick={() => {
                                                    openNoteModal()
                                                    dispatch(setEditingNoteId(`${record.user_id}-${record.date}`));
                                                    dispatch(setNoteInput(record.notes === "無" ? "" : record.notes));
                                                    dispatch(setEditingRecord(record));
                                                }}
                                            >編輯備註
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <NoteModal closeNoteModal={closeNoteModal} />
        </section>
    </>);


}