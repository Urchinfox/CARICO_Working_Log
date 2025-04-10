import { createBrowserRouter } from 'react-router-dom'
import Login from '../pages/login/login'
import CheckIn from '../pages/checkIn/checkin';
import AdminDashBoard from '../pages/admin/admin';

const routers = createBrowserRouter([
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