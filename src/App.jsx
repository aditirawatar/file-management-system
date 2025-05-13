import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar.jsx';
import Main from './Pages/Main';
import Login from './Pages/Auth/Login.jsx';
import Signup from './Pages/Auth/Signup.jsx';
import Filepage from './Pages/Auth/Filepage.jsx';
import Dashboard from './Pages/Dashboard/DashboardPage.jsx'; 

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboardpage" element={<Dashboard />} /> {}
        <Route path="/filepage" element={<Filepage />} />    {}
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
  );
}

export default App;
