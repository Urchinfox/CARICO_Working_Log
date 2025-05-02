import { useSelector, useDispatch } from "react-redux";
import { setSelectedMonth, setEditingNoteId, setNoteInput, setFilterStaff, setSelectedStaff, setSelectedStatus, setEditingRecord, setSelectedWeekday, setStatusCard } from "../../slices/recordsSlice";
import { useEffect, useRef, useState, useMemo } from "react";
import NoteModal from "../../components/NoteModal";
import { Modal } from "bootstrap";
import FilterStatusModal from "../../components/FilterStatusModal";
import StatisticsCard from "./StatisticsCard";

export default function MonthlyRecord() {
    const { monthlyRecords, selectedMonth, monthlyFilteredResult, monthlySelectedStaff, selectedStatus, selectedWeekday, loading, statusCard } = useSelector((state) => state.record);
    const addNoteModal = useRef();
    const filterStatusModal = useRef();


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

    //init 
    useEffect(() => {
        addNoteModal.current = new Modal("#addNoteModal", { backdrop: "static" });
        filterStatusModal.current = new Modal("#filterModal");
        dispatch(setSelectedStaff({ name: "all", type: "monthly" }));
        dispatch(setFilterStaff({ data: [], type: "monthly" }));
    }, [dispatch]);

    const handleSelect = (name) => {
        const staffName = name;
        if (staffName === "all") {
            dispatch(setSelectedStaff({ name: "all", type: 'monthly' }));
            dispatch(setFilterStaff({ data: [], type: "monthly" }));// empty monthlyFilteredResult
            // dispatch(setSelectedStatus('')); //empty status
        } else {
            const filterStaff = monthlyRecords.filter(item => item.name === staffName);
            dispatch(setSelectedStaff({ name: staffName, type: 'monthly' })); //select name
            dispatch(setFilterStaff({ data: filterStaff, type: 'monthly' })); //render
            dispatch(setSelectedStatus('')); //empty status
        }

    };

    //staff filter
    useEffect(() => {
        if (monthlySelectedStaff !== "all") {
            const filterStaff = monthlyRecords.filter(item => item.name === monthlySelectedStaff);
            // 僅當 monthlyFilteredResult 不匹配時更新
            if (JSON.stringify(filterStaff) !== JSON.stringify(monthlyFilteredResult)) {
                dispatch(setFilterStaff({ data: filterStaff, type: "monthly" }));
            }
        }
    }, [monthlyRecords, monthlySelectedStaff, monthlyFilteredResult, dispatch]);

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
        let records = monthlySelectedStaff === "all" ? monthlyRecords.filter(item => item.name !== 'Snan') : monthlyFilteredResult
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
    }, [monthlyRecords, monthlyFilteredResult, monthlySelectedStaff, selectedStatus, selectedWeekday]);


    // filter status 
    useEffect(() => {
        const stats = {
            late: displayRecords.filter((item) => item.status.includes("遲到")).length,
            earlyExit: displayRecords.filter((item) => item.status.includes("早退")).length,
            absence: displayRecords.filter((item) => item.status === "曠職").length,
            non_checkout: displayRecords.filter((item) =>
                item.status.includes("未打卡下班")
            ).length,
        };
        dispatch(setStatusCard(stats));
        console.log("Stats updated:", stats);
    }, [displayRecords]);



    const goToPreviousMonth = () => {
        const [year, month] = selectedMonth.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        date.setMonth(date.getMonth() - 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        dispatch(setSelectedMonth(newMonth));
    };

    const goToNextMonth = () => {
        const [year, month] = selectedMonth.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        date.setMonth(date.getMonth() + 1);
        const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        dispatch(setSelectedMonth(newMonth));
    };


    return (<>
        <div className="container-fluid mt-5">
            <div className="d-flex align-items-center">
                <button
                    className="btn btn-light border border-black p-1 me-3"
                    onClick={goToPreviousMonth}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
                    className=" border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
                <button
                    className="btn btn-light border border-black p-1 ms-3"
                    onClick={goToNextMonth}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>

            </div>
        </div>
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-4">
                    <StatisticsCard dataCard={statusCard} />

                </div>
            </div>
        </div>


        <section className="mt-5">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-3">
                        <input type="text" className="form-control r-99 py-2 w-100" placeholder="🔍 搜尋 - 有需要再開發" disabled />

                    </div>
                    <div className="col-9 d-flex align-items-center">
                        <div>
                            <button type="button" className="btn btn-dark border_2px r-16 p-2 ms-2" onClick={openFilterModal}>
                                <i className="bi bi-filter-circle fs-4 me-1"></i>篩選
                            </button>
                        </div>
                        <div className="ms-3">
                            <span className={`me-3 filter_chip fs-5 r-16 p-2 position-relative ${monthlySelectedStaff !== 'all' ? 'd-inline-block' : 'd-none'}`}><i className="bi bi-x-circle position-absolute top-0 start-100 translate-middle text-secondary" style={{ cursor: 'pointer' }} onClick={() => handleSelect('all')}> </i>{monthlySelectedStaff}</span>

                            <span className={`me-3 filter_chip  fs-5 r-16 p-2 position-relative ${selectedStatus !== '' ? 'd-inline-block' : 'd-none'}`}><i className="bi bi-x-circle position-absolute top-0 start-100 translate-middle text-secondary" style={{ cursor: 'pointer' }} onClick={() => dispatch(setSelectedStatus(''))}></i>{selectedStatus}</span>
                            {
                                selectedWeekday.map((day, index) => {
                                    return (
                                        <span key={index} className={`me-3 filter_chip r-16 p-2 position-relative ${selectedWeekday.length > 0 ? 'd-inline-block' : 'd-none'}`}><i className="bi bi-x-circle position-absolute top-0 start-100 translate-middle text-secondary" style={{ cursor: 'pointer' }}
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
        </section>
        {loading && (
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">載入中...</span>
                </div>
            </div>
        )}

        <section>

            <div className="py-5">
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
                            {displayRecords.length === 0 ? (
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
                                            <div className="mb-1">
                                                {record.notes}
                                            </div>
                                            <div>
                                                <button
                                                    className="bg-transparent  border-0 p-2 ms-2 "
                                                    style={{ fontSize: '12px' }}
                                                    onClick={() => {
                                                        openNoteModal()
                                                        dispatch(setEditingNoteId(`${record.user_id}-${record.date}`));
                                                        dispatch(setNoteInput(record.notes === "無" ? "" : record.notes));
                                                        dispatch(setEditingRecord(record));
                                                    }}
                                                ><u>編輯備註</u>
                                                </button>

                                            </div>
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