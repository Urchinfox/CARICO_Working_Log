import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import supabase from "../supabase";

export const punchSlice = createSlice({
    name: 'punch',
    initialState: {
        clockInTime: '00:00',
        clockOutTime: '00:00',
        punchStatus: false,
        punchErrorMsg: '',
        punchTime: null,
        modalType: '',
        isLoading: false,
        error: null,
    },
    reducers: {
        setModalType: (state, action) => {
            state.modalType = action.payload;
            state.punchTime = new Date().toISOString();
        },
        clearPunchStatus: (state) => {
            state.punchStatus = false;
            state.punchErrorMsg = "";
            state.punchTime = null;
        },
        resetPunchState: (state) => {
            state.clockInTime = "00:00";
            state.clockOutTime = "00:00";
            state.punchStatus = false;
            state.punchErrorMsg = "";
            state.punchTime = null;
            state.modalType = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodayRecord.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTodayRecord.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.clockInTime = new Date(action.payload.check_in_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                    state.clockOutTime = action.payload.check_out_time
                        ? new Date(action.payload.check_out_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : "00:00";
                } else {
                    state.clockInTime = "00:00";
                    state.clockOutTime = "00:00";
                }
            })
            .addCase(fetchTodayRecord.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(handlePunch.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.punchStatus = false;
                state.punchErrorMsg = "";
            })
            .addCase(handlePunch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.punchStatus = true;
                state.punchTime = action.payload.now;

                if (action.payload.type === "in") {
                    state.clockInTime = new Date(action.payload.record.check_in_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                } else if (action.payload.type === "out") {
                    state.clockOutTime = new Date(action.payload.record.check_out_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                }
            })
            .addCase(handlePunch.rejected, (state, action) => {
                state.isLoading = false;
                state.punchStatus = false;
                state.punchErrorMsg = action.payload;
            });
    },
})


// export const fetchTodayRecord = createAsyncThunk('punch/fetchTodayRecord', async (_, { rejectWithValue }) => {
//     try {
//         const { data: { user }, error: authError } = await supabase.auth.getUser();
//         if (authError || !user) throw new Error("請先登入！");
//         const userId = user.id;
//         const today = new Date().toISOString().split("T")[0]; // "2025-05-14"

//         const { data: records, error } = await supabase
//             .from("attendance")
//             .select("*")
//             .eq("user_id", userId)
//             .eq("attendance_date", today);

//         if (error) throw error;

//         return records && records.length > 0 ? records[0] : null;
//     } catch (error) {
//         return rejectWithValue(error.message);
//     }
// });

// export const handlePunch = createAsyncThunk(
//     "punch/handlePunch",
//     async (type, { rejectWithValue, dispatch }) => {
//         try {
//             const { data: { user }, error: authError } = await supabase.auth.getUser();
//             if (authError || !user) throw new Error("請先登入！");
//             const userId = user.id;

//             const now = new Date().toISOString();
//             const today = new Date().toISOString().split("T")[0];

//             const { data: existingRecord, error: fetchError } = await supabase
//                 .from("attendance")
//                 .select("*")
//                 .eq("user_id", userId)
//                 .eq("attendance_date", today)
//                 .single();

//             if (fetchError && fetchError.code !== "PGRST116") {
//                 throw fetchError;
//             }

//             if (type === "in") {
//                 if (existingRecord) {
//                     throw new Error("你今天已經打過上班卡了！");
//                 }
//                 const nowDate = new Date(now);
//                 const isLate = nowDate.getHours() > 9 || (nowDate.getHours() === 9 && nowDate.getMinutes() > 0);
//                 const status = isLate ? "遲到" : "正常";

//                 const { error } = await supabase.from("attendance").insert({
//                     user_id: userId,
//                     check_in_time: now,
//                     attendance_date: today,
//                     status,
//                 });
//                 if (error) throw error;

//                 const { data: records, error: fetchNewError } = await supabase
//                     .from("attendance")
//                     .select("*")
//                     .eq("user_id", userId)
//                     .eq("attendance_date", today);

//                 if (fetchNewError) throw fetchNewError;

//                 const newRecord = records && records.length > 0 ? records[0] : null;
//                 if (!newRecord) throw new Error("無法取得新打卡紀錄");

//                 return { type, record: newRecord, now };
//             } else if (type === "out") {
//                 if (!existingRecord) {
//                     throw new Error("請先打上班卡！");
//                 }
//                 if (existingRecord.check_out_time) {
//                     throw new Error("你今天已經打過下班卡了！");
//                 }
//                 const nowDate = new Date(now);
//                 const checkInDate = new Date(existingRecord.check_in_time);
//                 const workHours = (nowDate - checkInDate) / 3600000;
//                 const expectedOutTime = new Date(checkInDate.getTime() + 9 * 3600000);
//                 const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
//                 const expectedMinutes = expectedOutTime.getHours() * 60 + expectedOutTime.getMinutes();
//                 const status = nowMinutes < expectedMinutes ? "早退" : existingRecord.status;

//                 const { error } = await supabase
//                     .from("attendance")
//                     .update({
//                         check_out_time: now,
//                         work_hours: workHours.toFixed(2),
//                         status,
//                     })
//                     .eq("user_id", userId)
//                     .eq("attendance_date", today);
//                 if (error) throw error;

//                 const { data: records, error: fetchUpdatedError } = await supabase
//                     .from("attendance")
//                     .select("*")
//                     .eq("user_id", userId)
//                     .eq("attendance_date", today);

//                 if (fetchUpdatedError) throw fetchUpdatedError;

//                 const updatedRecord = records && records.length > 0 ? records[0] : null;
//                 if (!updatedRecord) throw new Error("無法取得更新後的打卡紀錄");

//                 return { type, record: updatedRecord, now };
//             }
//         } catch (error) {
//             return rejectWithValue(error.message);
//         }
//     }
// );



export const { setModalType, clearPunchStatus, resetPunchState } = punchSlice.actions;
export default punchSlice.reducer;



export const handlePunch = createAsyncThunk(
    "punch/handlePunch",
    async (type, { rejectWithValue, dispatch }) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error("請先登入！");
            const userId = user.id;
            const now = new Date().toISOString();
            const today = new Date().toISOString().split("T")[0];

            const { data: existingRecord, error: fetchError } = await supabase
                .from("attendance")
                .select("id, check_in_time, check_out_time, status")
                .eq("user_id", userId)
                .eq("attendance_date", today)
                .maybeSingle();
            if (fetchError) throw fetchError;

            if (type === "in") {
                if (existingRecord) {
                    throw new Error("你今天已經打過上班卡了！");
                }
                const nowDate = new Date(now);
                const isLate = nowDate.getHours() > 9 || (nowDate.getHours() === 9 && nowDate.getMinutes() > 0);
                const status = isLate ? "遲到" : "正常";

                const { data: newRecord, error: insertError } = await supabase
                    .from("attendance")
                    .insert({
                        user_id: userId,
                        check_in_time: now,
                        attendance_date: today,
                        status,
                        created_at: now,
                        updated_at: now,
                    })
                    .select()
                    .single();
                if (insertError) throw insertError;

                return { type, record: newRecord, now };
            } else if (type === "out") {
                if (!existingRecord) {
                    throw new Error("請先打上班卡！");
                }
                if (existingRecord.check_out_time) {
                    throw new Error("你今天已經打過下班卡了！");
                }
                const nowDate = new Date(now);
                const checkInDate = new Date(existingRecord.check_in_time);
                const workHours = (nowDate - checkInDate) / 3600000;
                const expectedOutTime = new Date(checkInDate.getTime() + 9 * 3600000);
                const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
                const expectedMinutes = expectedOutTime.getHours() * 60 + expectedOutTime.getMinutes();
                const status = nowMinutes < expectedMinutes ? "早退" : existingRecord.status;

                const { data: updatedRecord, error: updateError } = await supabase
                    .from("attendance")
                    .update({
                        check_out_time: now,
                        work_hours: workHours.toFixed(2),
                        status,
                        updated_at: now,
                    })
                    .eq("id", existingRecord.id)
                    .eq("user_id", userId) // 增加 user_id 條件，強化 RLS
                    .select()
                    .maybeSingle(); //  maybeSingle
                if (updateError) throw updateError;
                if (!updatedRecord) throw new Error("更新下班打卡失敗，無記錄返回");

                return { type, record: updatedRecord, now };
            }
        } catch (error) {
            console.error('handlePunch 錯誤:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTodayRecord = createAsyncThunk('punch/fetchTodayRecord', async (_, { rejectWithValue }) => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("請先登入！");
        const userId = user.id;
        const today = new Date().toISOString().split("T")[0];

        const { data: record, error } = await supabase
            .from("attendance")
            .select("check_in_time, check_out_time")
            .eq("user_id", userId)
            .eq("attendance_date", today)
            .maybeSingle();
        if (error) throw error;

        return record || null;
    } catch (error) {
        console.error('fetchTodayRecord 錯誤:', error);
        return rejectWithValue(error.message);
    }
});