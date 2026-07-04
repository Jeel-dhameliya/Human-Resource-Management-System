import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmployeeCard from '../components/EmployeeCard';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Fetch employees
        const empRes = await axios.get('/api/employees', config);
        setEmployees(empRes.data);

        // Fetch attendance for the current month
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const attRes = await axios.get(`/api/attendance/all?month=${month}&year=${year}`, config);
        setAttendanceData(attRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Helper to determine today's status for an employee
  const getTodayStatus = (userId) => {
    if (!userId) return 'absent';
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Find a record for this employee exactly matching today
    const record = attendanceData.find(record => {
      const recordDate = new Date(record.date).setHours(0, 0, 0, 0);
      return record.employeeId?._id?.toString() === userId.toString() && recordDate === today;
    });

    if (!record) return 'absent';
    if (record.status === 'present' || record.status === 'half-day') return 'present';
    if (record.status === 'leave') return 'leave';
    
    return 'absent';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="p-8 lg:px-12 max-w-7xl mx-auto w-full">
        <div>
          <div className="flex justify-between items-center mb-8">
            <button className="px-6 py-2 bg-gradient-to-br from-purple-500 to-purple-400 text-white font-semibold rounded shadow-[0_4px_12px_rgba(155,81,224,0.3)] hover:shadow-[0_6px_16px_rgba(155,81,224,0.4)] hover:-translate-y-px transition-all cursor-pointer border-none">
              NEW
            </button>
            <div>
              <input type="text" placeholder="Search" className="w-[250px] px-4 py-2 text-base text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 transition-all" />
            </div>
          </div>

          {loading ? (
            <p>Loading employees...</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {employees.map(emp => (
                <EmployeeCard 
                  key={emp._id} 
                  employee={emp} 
                  status={getTodayStatus(emp.userId?._id)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
