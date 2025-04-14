import { useState } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Route,Routes } from 'react-router-dom'
import Main from './Pages/Main'
import Navbar from './Navbar'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Filepage from './Pages/filepage';
function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
    <Navbar/>

    <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/Signup" element={<Signup/>}/>
        <Route path="/filepage" element={<Filepage/>}/>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  )
}

export default App
