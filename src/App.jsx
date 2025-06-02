import './shared/all.scss'
import routers from './routers'
import { RouterProvider } from 'react-router-dom'



function App() {

  return (
    <>
      <RouterProvider router={routers} basename="/CARICO_Working_Log" ></RouterProvider>
    </>
  )
}

export default App
