import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import recordsSlice from "../slices/recordsSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        record: recordsSlice,
    },
})