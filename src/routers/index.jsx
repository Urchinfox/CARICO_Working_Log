import { createHashRouter } from 'react-router-dom'
import Login from '../pages/login/login'
import CheckIn from '../pages/checkIn/checkin';
import AdminDashBoard from '../pages/admin/admin';

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
        element: <AdminDashBoard />
    }

])


export default routers;