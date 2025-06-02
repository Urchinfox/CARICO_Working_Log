import { createHashRouter } from 'react-router-dom'
import Login from '../pages/login/login'
import CheckIn from '../pages/checkIn/checkin';
import AdminDashBoard from '../pages/admin/admin';
import DailyRecord from '../pages/admin/DailyRecord';
import MonthlyRecord from '../pages/admin/MonthlyRecord';
import StaffList from '../pages/admin/staffList/staffList';
import ResetPassword from '../pages/login/resetPassword';

const routers = createHashRouter([
    {
        path: '/',
        element: <Login />
    },
    {
        path: '/checkin',
        element: <CheckIn />
    },
    {
        path: "/admin",
        element: <AdminDashBoard />,
        children: [
            {
                path: 'daily_record',
                element: <DailyRecord />
            },
            {
                path: 'monthly_record',
                element: <MonthlyRecord />
            },

        ]
    },
    {
        path: 'staff_list',
        element: <StaffList />
    },
    {
        path: 'reset-password',
        element: <ResetPassword />
    },


])


export default routers;