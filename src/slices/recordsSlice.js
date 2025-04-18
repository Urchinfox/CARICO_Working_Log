import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../supabase";

export const recordsSlice = createSlice({
    name: 'record',
    initialState: {
        dailyRecords: [],
        monthlyRecords: [],
        selectedDate: new Date().toISOString().split("T")[0],
        selectedMonth: new Date().toISOString().slice(0, 7),
        editingNoteId: null,
        noteInput: "",
        loading: false,
        error: null,
        individual: [],
        selectedStaff: "all",
        selectedStatus: '',
        editingRecord: null,
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
            state.individual = action.payload;
            console.log(action.payload)
        },
        setSelectedStaff(state, action) {
            state.selectedStaff = action.payload;
        },
        setSelectedStatus(state, action) {
            state.selectedStatus = action.payload;
        },
        setEditingRecord(state, action) {
            state.editingRecord = action.payload;
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
                state.error = action.error.message;
            });
    }
})


export const fetchAttendance = createAsyncThunk(
    "record/fetchAttendance",
    async ({ mode, selectedDate, selectedMonth }, { getState }) => {
        const { data: users, error: userError } = await supabase
            .from("users")
            .select("id, user_id, email, name");
        if (userError) throw userError;

        let attendanceRecords;
        if (mode === "daily") {
            const { data, error } = await supabase
                .from("attendance")
                .select("*")
                .eq("attendance_date", selectedDate);
            if (error) throw error;
            attendanceRecords = data || [];
        } else if (mode === "monthly") {
            const startOfMonth = `${selectedMonth}-01`;
            const endOfMonth = new Date(selectedMonth.slice(0, 4), selectedMonth.slice(5, 7), 0)
                .toISOString()
                .split("T")[0];
            const { data, error } = await supabase
                .from("attendance")
                .select("*")
                .gte("attendance_date", startOfMonth)
                .lte("attendance_date", endOfMonth);
            if (error) throw error;
            attendanceRecords = data || [];
        }

        const calculateStatus = (checkIn, checkOut, recordDate) => {
            const checkInTime = checkIn ? new Date(checkIn) : null;
            const checkOutTime = checkOut ? new Date(checkOut) : null;
            const nineAM = checkInTime ? new Date(checkInTime).setHours(9, 0, 0, 0) : new Date(recordDate).setHours(9, 0, 0, 0);

            const now = new Date();
            const today = now.toISOString().split("T")[0];
            const sixPM = new Date(recordDate);
            sixPM.setHours(18, 0, 0, 0);

            if (recordDate > today) {
                return "無";
            }

            let status = [];
            if (!checkInTime && !checkOutTime) {
                if (recordDate === today && now < sixPM) {
                    return "無";
                }
                return "曠職";
            }

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
            formattedRecords = users.map(user => {
                const record = attendanceRecords.find(item => item.user_id === user.user_id);
                return {
                    user_id: user.user_id,
                    name: user.name || user.email,
                    check_in_time: record?.check_in_time
                        ? new Date(record.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "無",
                    check_out_time: record?.check_out_time
                        ? new Date(record.check_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "無",
                    status: calculateStatus(record?.check_in_time, record?.check_out_time, selectedDate),
                    date: selectedDate,
                    notes: record?.notes || "無",
                    id: record?.id || null,
                };
            });
        } else if (mode === "monthly") {
            const daysInMonth = new Date(selectedMonth.slice(0, 4), selectedMonth.slice(5, 7), 0).getDate();
            const dateRange = Array.from({ length: daysInMonth }, (_, i) => {
                const day = (i + 1).toString().padStart(2, "0");
                return `${selectedMonth}-${day}`;
            });

            formattedRecords = users.flatMap(user => {
                const userRecords = attendanceRecords.filter(item => item.user_id === user.user_id);
                return dateRange.map(day => {
                    const record = userRecords.find(r => r.attendance_date === day);
                    return {
                        user_id: user.user_id,
                        name: user.name || user.email,
                        check_in_time: record?.check_in_time
                            ? new Date(record.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "無",
                        check_out_time: record?.check_out_time
                            ? new Date(record.check_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

export const updateNote = createAsyncThunk(
    "record/updateNote",
    async ({ record, newNote, date }, { dispatch, getState }) => {
        const { record: { selectedDate } } = getState();
        let recordId = record.id;

        if (!recordId) {
            const { data: newRecord, error: insertError } = await supabase
                .from("attendance")
                .insert({
                    user_id: record.user_id,
                    attendance_date: date,
                })
                .select()
                .single();
            if (insertError) throw insertError;
            recordId = newRecord.id;
        }

        const { error } = await supabase
            .from("attendance")
            .update({ notes: newNote })
            .eq("id", recordId);
        if (error) throw error;

        // 觸發重新查詢
        dispatch(fetchAttendance({ mode: date === selectedDate ? "daily" : "monthly", selectedDate, selectedMonth: getState().record.selectedMonth }));

        return { recordId, newNote };
    }
);


export default recordsSlice.reducer;
export const { setSelectedDate, setSelectedMonth, setEditingNoteId, setNoteInput, setFilterStaff, setSelectedStaff, setSelectedStatus, setEditingRecord } = recordsSlice.actions;