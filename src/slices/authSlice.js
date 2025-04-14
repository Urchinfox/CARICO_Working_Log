import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import supabase from "../supabase";
// import { act } from "react";

export const authSlice = createSlice({
    name: 'auth',
    initialState: {
        role: null,
        loading: false,
        name: '',
        id: ''
    },
    reducers: {},
    extraReducers: (build) => {
        build
            .addCase(roleValidate.fulfilled, (state, action) => {
                if (action.payload) {
                    const { role, name, id } = action.payload
                    state.role = role;
                    state.name = name;
                    state.id = id
                }

                state.loading = false;
            })
            .addCase(roleValidate.pending, (state, action) => {
                state.loading = true
            })
    }
})


export const checkSession = createAsyncThunk('auth/checkSession', async (navigate) => {
    const { data: session } = await supabase.auth.getSession();
    console.log(session.session);
    if (!session.session) {
        navigate('/')
    } else {
        return session.session || null;
    }
})

export const roleValidate = createAsyncThunk('auth/roleValidate', async () => {

    const { data: { session } } = await supabase.auth.getSession();
    const { data: userData, error } = await supabase
        .from('users')
        .select('role, name')
        .eq('user_id', session.user.id)
        .single();


    if (error || !userData) {
        console.log('failed to fetch role:', error);
        return null;
    }
    const userInfo = {
        name: userData.name,
        role: userData.role,
        id: session.user.id
    }
    return userInfo;
})

export const handleLogout = createAsyncThunk('auth/logout', async (navigate) => {
    console.log('dee')
    try {
        const res = await supabase.auth.signOut();
        console.log(res, 'logout succeed');
        navigate('/');

    } catch (error) {
        console.log(error, 'fail to logout')
    }
})


export default authSlice.reducer;