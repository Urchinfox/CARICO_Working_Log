import './shared/all.scss'
import routers from './routers'
import { RouterProvider } from 'react-router-dom'



function App() {

  return (
    <>
      <RouterProvider router={routers}></RouterProvider>
    </>
  )
}

export default App
