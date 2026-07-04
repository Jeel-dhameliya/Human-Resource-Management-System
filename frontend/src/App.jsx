import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import EmployeeProfile from './pages/EmployeeProfile';
import TimeOff from './pages/TimeOff';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/timeoff" element={<TimeOff/>}/>
        <Route path="/employee/:id" element={<EmployeeProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
