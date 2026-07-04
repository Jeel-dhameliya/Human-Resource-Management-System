import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [myAttendance, setMyAttendance] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchNavbarData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [logoRes, profileRes, attendanceRes] = await Promise.all([
          axios.get('/api/auth/company-logo', config),
          axios.get('/api/employees/me', config),
          axios.get(
            `/api/attendance/me?month=${month}&year=${year}`,
            config
          ),
        ]);

        setCompanyInfo(logoRes.data);
        setUserProfile(profileRes.data);

        const today = new Date().setHours(0, 0, 0, 0);

        const todayRecord = attendanceRes.data.find(
          (record) =>
            new Date(record.date).setHours(0, 0, 0, 0) === today
        );

        setMyAttendance(todayRecord);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNavbarData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        '/api/attendance/checkin',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMyAttendance(res.data.record);
      setDropdownOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Check In Failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        '/api/attendance/checkout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMyAttendance(res.data.record);
      setDropdownOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Check Out Failed');
    }
  };

  let statusDotColor = '#ffd700';

  if (myAttendance) {
    if (
      myAttendance.status === 'present' ||
      myAttendance.status === 'half-day'
    ) {
      statusDotColor = '#00e676';
    } else if (myAttendance.status === 'leave') {
      statusDotColor = '#00b0ff';
    }
  }

  const checkInTime = myAttendance?.checkIn
    ? new Date(myAttendance.checkIn).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const navClass = (path) =>
    `py-6 px-2 font-medium cursor-pointer relative transition-colors ${
      location.pathname === path
        ? "text-purple-600 after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:w-full after:h-[3px] after:bg-purple-600 after:rounded-t-sm"
        : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <nav className="flex justify-between items-center px-8 h-[70px] bg-white border-b border-slate-200 shadow-sm relative z-50">
      {/* Company Logo */}

      <div className="flex-1">
        {companyInfo?.logoUrl ? (
          <img
            src={companyInfo.logoUrl.startsWith('http') ? companyInfo.logoUrl : `http://localhost:5001/${companyInfo.logoUrl.replace(/^\//, '').replace(/\\/g, '/')}`}
            alt="Company Logo"
            className="max-h-10 object-contain"
          />
        ) : (
          <div className="font-semibold text-xl text-purple-600">
            Company Logo
          </div>
        )}
      </div>

      {/* Navigation */}

      <div className="flex gap-8">
        <div
          className={navClass('/dashboard')}
          onClick={() => navigate('/dashboard')}
        >
          Employees
        </div>

        <div
          className={navClass('/attendance')}
          onClick={() => navigate('/attendance')}
        >
          Attendance
        </div>

        <div
          className={navClass('/timeoff')}
          onClick={() => navigate('/timeoff')}
        >
          Time Off
        </div>
      </div>

      {/* Profile */}

      <div className="flex-1 flex justify-end">
        <div
          className="relative cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="w-[45px] h-[45px] rounded-full relative bg-slate-200 flex items-center justify-center border-2 border-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            {userProfile?.personalDetails?.profilePic ? (
              <img
                src={userProfile.personalDetails.profilePic.startsWith('http') ? userProfile.personalDetails.profilePic : `http://localhost:5001/${userProfile.personalDetails.profilePic.replace(/^\//, '').replace(/\\/g, '/')}`}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="font-semibold text-slate-500 text-lg">
                {userProfile?.fullName?.[0] || 'U'}
              </div>
            )}

            <div
              className="absolute -top-[2px] -right-[2px] w-[14px] h-[14px] rounded-full border-2 border-white"
              style={{ backgroundColor: statusDotColor }}
            ></div>
          </div>

          {dropdownOpen && (
            <div className="absolute top-[60px] right-0 w-[220px] bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
              <div 
                className="px-5 py-4 font-medium hover:bg-slate-50 cursor-pointer"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(`/employee/${userProfile?._id || userProfile?.userId?._id || 'me'}`);
                }}
              >
                My Profile
              </div>

              <div className="border-t"></div>

              {!myAttendance?.checkIn && (
                <div
                  className="px-5 py-4 font-medium hover:bg-slate-50 cursor-pointer"
                  onClick={handleCheckIn}
                >
                  Check IN →
                </div>
              )}

              {myAttendance?.checkIn && !myAttendance?.checkOut && (
                <div className="bg-purple-50">
                  <div className="px-5 pt-3 text-xs text-slate-500">
                    Since {checkInTime}
                  </div>

                  <div
                    className="px-5 py-4 font-medium hover:bg-slate-50 cursor-pointer"
                    onClick={handleCheckOut}
                  >
                    Check Out →
                  </div>
                </div>
              )}

              {myAttendance?.checkOut && (
                <div className="bg-purple-50 px-5 py-3 text-xs text-slate-500">
                  Completed for today
                </div>
              )}

              <div className="border-t"></div>

              <div
                className="px-5 py-4 font-medium hover:bg-slate-50 cursor-pointer"
                onClick={handleLogout}
              >
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;