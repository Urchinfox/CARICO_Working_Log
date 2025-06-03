import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../supabase";

export const recordsSlice = createSlice({
    name: 'record',
    initialState: {
        dailyRecords: [],
        monthlyRecords: [],
        // selectedDate: new Date().toISOString().split("T")[0],
        dateRange: { startDate: "", endDate: "" },

        selectedMonth: new Date().toISOString().slice(0, 7),
        editingNoteId: null,
        noteInput: "",
        loading: false,
        error: null,
        monthlyFilteredResult: [],   //deal with filtered result for monthly records
        dailyFilteredResult: [],   //deal with filtered result for daily records
        dailySelectedStaff: "all",
        monthlySelectedStaff: "all",
        selectedStatus: '',
        selectedWeekday: [],
        editingRecord: null,
        statusCard: {
            late: 0,
            earlyExit: 0,
            absence: 0,
            non_checkout: 0
        },
        staffList: [] //for select 
    },
    reducers: {
        setSelectedDate(state, action) {
            state.selectedDate = action.payload;
        },
        setSelectedMonth(state, action) {
            state.selectedMonth = action.payload;
        },
        setEditingNoteId(state, action) {
            state.editingNoteId = action.payload;
        },
        setNoteInput(state, action) {
            state.noteInput = action.payload;
        },
        setFilterStaff(state, action) {
            const { data, type } = action.payload;
            if (type === 'monthly') {
                state.monthlyFilteredResult = data;
            } else if (type === 'daily') {
                state.dailyFilteredResult = data;
            }
        },
        setSelectedStaff(state, action) {
            const { name, type } = action.payload
            if (type === 'monthly') {
                state.monthlySelectedStaff = name;
            } else if (type === 'daily') {
                state.dailySelectedStaff = name;
            }
        },
        setSelectedStatus(state, action) {
            state.selectedStatus = action.payload;
        },
        setSelectedWeekday(state, action) {
            state.selectedWeekday = action.payload;
        },
        setEditingRecord(state, action) {
            state.editingRecord = action.payload;
        },
        setDateRange(state, action) {
            state.dateRange = action.payload;
        },
        setStatusCard(state, action) {
            state.statusCard = action.payload
        }
    },
    extraReducers: (build) => {
        build
            .addCase(fetchAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttendance.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.mode === "daily") {
                    state.dailyRecords = action.payload.records;
                } else {
                    state.monthlyRecords = action.payload.records;
                }
            })
            .addCase(fetchAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(updateNote.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateNote.fulfilled, (state) => {
                state.loading = false;
                state.editingNoteId = null;
                state.noteInput = "";
            })
            .addCase(updateNote.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '更新備註失敗';
            })
            .addCase(fetchStaffList.pending, (state, action) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStaffList.fulfilled, (state, action) => {
                state.loading = false;
                state.staffList = action.payload;
            })
            .addCase(fetchStaffList.rejected, (state, action) => {
                state.loading = false;
                state.error = state.error.message;
            })
    }
})


// export const fetchAttendance = createAsyncThunk(
//     "record/fetchAttendance",
//     async ({ mode, dateRange, selectedMonth }, { getState }) => {
//         const { data: users, error: userError } = await supabase
//             .from("users")
//             .select("id, user_id, email, name");
//         if (userError) throw userError;

//         let attendanceRecords;
//         if (mode === "daily") {
//             const { startDate, endDate } = dateRange;
//             if (!startDate || !endDate) {
//                 return { mode, records: [] };
//             }
//             const { data, error } = await supabase
//                 .from("attendance")
//                 .select("*")
//                 .gte("attendance_date", startDate)
//                 .lte("attendance_date", endDate)
//                 .order("attendance_date", { ascending: true });
//             if (error) throw error;
//             attendanceRecords = data || [];
//         } else if (mode === "monthly") {
//             const startOfMonth = `${selectedMonth}-01`;
//             const endOfMonth = new Date(
//                 selectedMonth.slice(0, 4),
//                 selectedMonth.slice(5, 7),
//                 0
//             )
//                 .toISOString()
//                 .split("T")[0];
//             const { data, error } = await supabase
//                 .from("attendance")
//                 .select("*")
//                 .gte("attendance_date", startOfMonth)
//                 .lte("attendance_date", endOfMonth);
//             if (error) throw error;
//             attendanceRecords = data || [];
//         }

//         const calculateStatus = (checkIn, checkOut, recordDate) => {
//             const checkInTime = checkIn ? new Date(checkIn) : null;
//             const checkOutTime = checkOut ? new Date(checkOut) : null;
//             const nineAM = checkInTime
//                 ? new Date(checkInTime).setHours(9, 0, 0, 0)
//                 : new Date(recordDate).setHours(9, 0, 0, 0);

//             const now = new Date();
//             const today = now.toISOString().split("T")[0];
//             const sixPM = new Date(recordDate);
//             sixPM.setHours(18, 0, 0, 0);

//             if (recordDate > today) {
//                 return "無";
//             }

//             let status = [];
//             if (!checkInTime && !checkOutTime) {
//                 if (recordDate === today && now < sixPM) {
//                     return "無";
//                 }
//                 return "曠職";
//             }

//             if (checkInTime && !checkOutTime) status.push("未打卡下班");
//             if (checkInTime && checkInTime > nineAM) status.push("遲到");
//             if (checkInTime && checkOutTime) {
//                 const workDurationMs = checkOutTime - checkInTime;
//                 const workDurationHours = workDurationMs / (1000 * 60 * 60);
//                 if (workDurationHours < 9) status.push("早退");
//             }
//             if (status.length === 0 && checkInTime <= nineAM && checkOutTime) {
//                 const workDurationMs = checkOutTime - checkInTime;
//                 const workDurationHours = workDurationMs / (1000 * 60 * 60);
//                 if (workDurationHours >= 9) return "正常";
//             }
//             return status.length > 0 ? status.join(" ") : "正常";
//         };

//         let formattedRecords = [];
//         if (mode === "daily") {
//             const { startDate, endDate } = dateRange;
//             if (!startDate || !endDate) {
//                 return { mode, records: [] };
//             }

//             // generate date range
//             const start = new Date(startDate);
//             const end = new Date(endDate);
//             const dateRangeArray = [];
//             for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
//                 dateRangeArray.push(d.toISOString().split("T")[0]);
//             }

//             formattedRecords = users.flatMap((user) => {
//                 const userRecords = attendanceRecords.filter(
//                     (item) => item.user_id === user.user_id
//                 );
//                 return dateRangeArray.map((day) => {
//                     const record = userRecords.find((r) => r.attendance_date === day);
//                     return {
//                         user_id: user.user_id,
//                         name: user.name || user.email,
//                         check_in_time: record?.check_in_time
//                             ? new Date(record.check_in_time).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                             })
//                             : "無",
//                         check_out_time: record?.check_out_time
//                             ? new Date(record.check_out_time).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                             })
//                             : "無",
//                         status: calculateStatus(record?.check_in_time, record?.check_out_time, day),
//                         date: day,
//                         notes: record?.notes || "無",
//                         id: record?.id || null,
//                     };
//                 });
//             });
//         } else if (mode === "monthly") {
//             const daysInMonth = new Date(
//                 selectedMonth.slice(0, 4),
//                 selectedMonth.slice(5, 7),
//                 0
//             ).getDate();
//             const dateRange = Array.from({ length: daysInMonth }, (_, i) => {
//                 const day = (i + 1).toString().padStart(2, "0");
//                 return `${selectedMonth}-${day}`;
//             });

//             formattedRecords = users.flatMap((user) => {
//                 const userRecords = attendanceRecords.filter(
//                     (item) => item.user_id === user.user_id
//                 );
//                 return dateRange.map((day) => {
//                     const record = userRecords.find((r) => r.attendance_date === day);
//                     return {
//                         user_id: user.user_id,
//                         name: user.name || user.email,
//                         check_in_time: record?.check_in_time
//                             ? new Date(record.check_in_time).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                             })
//                             : "無",
//                         check_out_time: record?.check_out_time
//                             ? new Date(record.check_out_time).toLocaleTimeString([], {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                             })
//                             : "無",
//                         status: calculateStatus(record?.check_in_time, record?.check_out_time, day),
//                         date: day,
//                         notes: record?.notes || "無",
//                         id: record?.id || null,
//                     };
//                 });
//             });
//         }

//         return { mode, records: formattedRecords };
//     }
// );


// export const updateNote = createAsyncThunk(
//     "record/updateNote",
//     async ({ record, newNote, date }, { dispatch, getState }) => {
//         const {
//             record: { dateRange, selectedMonth },
//         } = getState();
//         let recordId = record.id;

//         if (!recordId) {
//             const { data: newRecord, error: insertError } = await supabase
//                 .from("attendance")
//                 .insert({
//                     user_id: record.user_id,
//                     attendance_date: date,
//                 })
//                 .select()
//                 .single();
//             if (insertError) throw insertError;
//             recordId = newRecord.id;
//         }

//         const { error } = await supabase
//             .from("attendance")
//             .update({ notes: newNote })
//             .eq("id", recordId);
//         if (error) throw error;

//         // 重新查詢
//         const isInDailyRange =
//             dateRange.startDate &&
//             dateRange.endDate &&
//             date >= dateRange.startDate &&
//             date <= dateRange.endDate;
//         dispatch(
//             fetchAttendance({
//                 mode: isInDailyRange ? "daily" : "monthly",
//                 dateRange,
//                 selectedMonth,
//             })
//         );

//         return { recordId, newNote };
//     }
// );


// search staff list 
export const fetchStaffList = createAsyncThunk(
    "record/fetchStaffList",
    async () => {
        const { data, error } = await supabase
            .from("users")
            .select("name")
            .order("name", { ascending: true });
        if (error) throw error;
        return data.map((user) => user.name).filter((name) => name !== 'Snan');
    }
);


export default recordsSlice.reducer;
export const { setSelectedDate, setSelectedMonth, setEditingNoteId, setNoteInput, setFilterStaff, setSelectedStaff, setSelectedStatus, setEditingRecord, setSelectedWeekday, setDateRange, setStatusCard } = recordsSlice.actions;



// test
export const fetchAttendance = createAsyncThunk(
    "record/fetchAttendance",
    async ({ mode, dateRange, selectedMonth }, { getState }) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("請先登入！");
        const userId = user.id;

        // 查詢用戶角色
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("user_id", userId)
            .single();
        if (userError) throw userError;
        const isAdmin = userData?.role === 'admin';

        let users;
        if (isAdmin) {
            const { data, error } = await supabase
                .from("users")
                .select("id, user_id, email, name");
            if (error) throw error;
            users = data;
        } else {
            users = [{ user_id: userId, email: user.email, name: userData?.name || user.email }];
        }

        let attendanceRecords;
        if (mode === "daily") {
            const { startDate, endDate } = dateRange;
            if (!startDate || !endDate) {
                return { mode, records: [] };
            }
            const { data, error } = await supabase
                .from("attendance")
                .select("*")
                .gte("attendance_date", startDate)
                .lte("attendance_date", endDate)
                .in("user_id", users.map(u => u.user_id))
                .order("attendance_date", { ascending: true });
            if (error) throw error;
            attendanceRecords = data || [];
        } else if (mode === "monthly") {
            const startOfMonth = `${selectedMonth}-01`;
            const endOfMonth = new Date(
                selectedMonth.slice(0, 4),
                selectedMonth.slice(5, 7),
                0
            ).toISOString().split("T")[0];
            const { data, error } = await supabase
                .from("attendance")
                .select("*")
                .gte("attendance_date", startOfMonth)
                .lte("attendance_date", endOfMonth)
                .in("user_id", users.map(u => u.user_id));
            if (error) throw error;
            attendanceRecords = data || [];
        }

        // calculateStatus 保持不變
        const calculateStatus = (checkIn, checkOut, recordDate) => {
            const checkInTime = checkIn ? new Date(checkIn) : null;
            const checkOutTime = checkOut ? new Date(checkOut) : null;
            const nineAM = checkInTime
                ? new Date(checkInTime).setHours(9, 0, 0, 0)
                : new Date(recordDate).setHours(9, 0, 0, 0);
            const now = new Date();
            const today = now.toISOString().split("T")[0];
            const sixPM = new Date(recordDate);
            sixPM.setHours(18, 0, 0, 0);

            if (recordDate > today) return "無";
            if (!checkInTime && !checkOutTime) {
                if (recordDate === today && now < sixPM) return "無";
                return "曠職";
            }
            let status = [];
            if (checkInTime && !checkOutTime) status.push("未打卡下班");
            if (checkInTime && checkInTime > nineAM) status.push("遲到");
            if (checkInTime && checkOutTime) {
                const workDurationMs = checkOutTime - checkInTime;
                const workDurationHours = workDurationMs / (1000 * 60 * 60);
                if (workDurationHours < 9) status.push("早退");
            }
            if (status.length === 0 && checkInTime <= nineAM && checkOutTime) {
                const workDurationMs = checkOutTime - checkInTime;
                const workDurationHours = workDurationMs / (1000 * 60 * 60);
                if (workDurationHours >= 9) return "正常";
            }
            return status.length > 0 ? status.join(" ") : "正常";
        };

        let formattedRecords = [];
        if (mode === "daily") {
            const { startDate, endDate } = dateRange;
            if (!startDate || !endDate) return { mode, records: [] };

            const start = new Date(startDate);
            const end = new Date(endDate);
            const dateRangeArray = [];
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dateRangeArray.push(d.toISOString().split("T")[0]);
            }

            formattedRecords = users.flatMap((user) => {
                const userRecords = attendanceRecords.filter(
                    (item) => item.user_id === user.user_id
                );
                return dateRangeArray.map((day) => {
                    const record = userRecords.find((r) => r.attendance_date === day);
                    return {
                        user_id: user.user_id,
                        name: user.name || user.email,
                        check_in_time: record?.check_in_time
                            ? new Date(record.check_in_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "無",
                        check_out_time: record?.check_out_time
                            ? new Date(record.check_out_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "無",
                        status: calculateStatus(record?.check_in_time, record?.check_out_time, day),
                        date: day,
                        notes: record?.notes || "無",
                        id: record?.id || null,
                    };
                });
            });
        } else if (mode === "monthly") {
            const daysInMonth = new Date(
                selectedMonth.slice(0, 4),
                selectedMonth.slice(5, 7),
                0
            ).getDate();
            const dateRange = Array.from({ length: daysInMonth }, (_, i) => {
                const day = (i + 1).toString().padStart(2, "0");
                return `${selectedMonth}-${day}`;
            });

            formattedRecords = users.flatMap((user) => {
                const userRecords = attendanceRecords.filter(
                    (item) => item.user_id === user.user_id
                );
                return dateRange.map((day) => {
                    const record = userRecords.find((r) => r.attendance_date === day);
                    return {
                        user_id: user.user_id,
                        name: user.name || user.email,
                        check_in_time: record?.check_in_time
                            ? new Date(record.check_in_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "無",
                        check_out_time: record?.check_out_time
                            ? new Date(record.check_out_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "無",
                        status: calculateStatus(record?.check_in_time, record?.check_out_time, day),
                        date: day,
                        notes: record?.notes || "無",
                        id: record?.id || null,
                    };
                });
            });
        }

        return { mode, records: formattedRecords };
    }
);

// export const updateNote = createAsyncThunk(
//     "record/updateNote",
//     async ({ record, newNote, date }, { dispatch, getState }) => {
//         const { data: { user }, error: authError } = await supabase.auth.getUser();
//         if (authError || !user) throw new Error("請先登入！");
//         const userId = user.id;

//         const { record: { dateRange, selectedMonth } } = getState();
//         let recordId = record.id;

//         if (!recordId) {
//             const today = new Date().toISOString().split("T")[0];
//             const { data: existingRecord, error: fetchError } = await supabase
//                 .from("attendance")
//                 .select("id")
//                 .eq("user_id", record.user_id)
//                 .eq("attendance_date", date)
//                 .maybeSingle();
//             if (fetchError) throw fetchError;
//             if (existingRecord) {
//                 recordId = existingRecord.id;
//             } else {
//                 const { data: newRecord, error: insertError } = await supabase
//                     .from("attendance")
//                     .insert({
//                         user_id: record.user_id,
//                         attendance_date: date,
//                         created_at: new Date().toISOString(),
//                         updated_at: new Date().toISOString(),
//                     })
//                     .select()
//                     .single();
//                 if (insertError) throw insertError;
//                 recordId = newRecord.id;
//             }
//         }

//         const { error } = await supabase
//             .from("attendance")
//             .update({ notes: newNote, updated_at: new Date().toISOString() })
//             .eq("id", recordId);
//         if (error) throw error;

//         const isInDailyRange =
//             dateRange.startDate &&
//             dateRange.endDate &&
//             date >= dateRange.startDate &&
//             date <= dateRange.endDate;
//         dispatch(
//             fetchAttendance({
//                 mode: isInDailyRange ? "daily" : "monthly",
//                 dateRange,
//                 selectedMonth,
//             })
//         );

//         return { recordId, newNote };
//     }
// );

export const updateNote = createAsyncThunk(
    "record/updateNote",
    async ({ record, newNote, date }, { dispatch, getState }) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("請先登入！");
            const userId = user.id;

            // 檢查管理員角色
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("role")
                .eq("user_id", userId)
                .single();
            if (userError) throw userError;
            if (userData?.role !== 'admin') throw new Error("僅管理員可編輯備注");

            const recordId = record.id;
            if (!recordId) {
                throw new Error("無有效打卡記錄，無法編輯備注");
            }

            const { data: updatedRecord, error: updateError } = await supabase
                .from("attendance")
                .update({
                    notes: newNote,
                    updated_at: new Date().toISOString()
                })
                .eq("id", recordId)
                .select()
                .single();
            if (updateError) throw updateError;
            if (!updatedRecord) throw new Error("更新備注失敗，無記錄返回");

            const { record: { dateRange, selectedMonth } } = getState();
            const isInDailyRange =
                dateRange.startDate &&
                dateRange.endDate &&
                date >= dateRange.startDate &&
                date <= dateRange.endDate;
            dispatch(
                fetchAttendance({
                    mode: isInDailyRange ? "daily" : "monthly",
                    dateRange,
                    selectedMonth,
                })
            );

            return { recordId, newNote };
        } catch (error) {
            console.error('updateNote 錯誤:', error);
            throw error; // 拋出錯誤，供後續處理
        }
    }
);

