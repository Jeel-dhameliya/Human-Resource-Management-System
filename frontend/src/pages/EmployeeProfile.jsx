import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pencil, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resume');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/employees/${id}`, config);
        setEmployee(res.data);
      } catch (err) {
        console.error('Failed to fetch employee', err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]"><p>Loading profile...</p></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]"><p>Employee not found</p></div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 w-full max-w-6xl mx-auto p-8">
        {/* Header Section */}
        <div className="bg-white border border-slate-200 rounded-t-xl p-8 pb-0">
          <h2 className="text-xl font-medium text-slate-800 mb-6">My Profile</h2>
          
          <div className="flex items-start gap-12 pb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-pink-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative">
                {employee.personalDetails?.profilePic ? (
                  <img src={`http://localhost:5001/${employee.personalDetails.profilePic}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-pink-600 font-semibold">{employee.fullName.charAt(0).toUpperCase()}</span>
                )}
                
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow border border-slate-200 flex items-center justify-center text-slate-600 hover:text-purple-600 cursor-pointer">
                  <Pencil size={14} />
              </button>
            </div>

            <div className="flex-1 flex gap-12">
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl font-semibold text-slate-800">{employee.fullName}</h1>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                  <div className="flex border-b border-slate-200 pb-1">
                    <span className="w-24 text-slate-500 font-medium">Login ID</span>
                    <span className="text-slate-800">{employee.userId?.email || employee.userId?.employeeId}</span>
                  </div>
                  <div className="flex border-b border-slate-200 pb-1">
                    <span className="w-24 text-slate-500 font-medium">Company</span>
                    <span className="text-slate-800">{employee.companyName || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-200 pb-1">
                    <span className="w-24 text-slate-500 font-medium">Email</span>
                    <span className="text-slate-800">{employee.userId?.email || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-200 pb-1">
                    <span className="w-24 text-slate-500 font-medium">Department</span>
                    <span className="text-slate-800">{employee.jobDetails?.department || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-200 pb-1">
                    <span className="w-24 text-slate-500 font-medium">Mobile</span>
                    <span className="text-slate-800">{employee.personalDetails?.phone || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-200 pb-1">
                    <span className="w-24 text-slate-500 font-medium">Manager</span>
                    <span className="text-slate-800">{employee.jobDetails?.manager || '-'}</span>
                  </div>
                  <div className="flex border-b border-slate-200 pb-1">
                  </div>
                  <div className="flex border-b border-slate-200 pb-1">
                    <span className="w-24 text-slate-500 font-medium">Location</span>
                    <span className="text-slate-800">{employee.jobDetails?.location || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-300 gap-8 mt-2">
            <button 
              className={`pb-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'resume' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('resume')}
            >
              Resume
            </button>
            <button 
              className={`pb-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'private' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('private')}
            >
              Private Info
            </button>
            {isAdmin && (
              <button 
                className={`pb-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'salary' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                onClick={() => setActiveTab('salary')}
              >
                Salary Info
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-t-0 border-slate-200 p-8 rounded-b-xl min-h-[500px]">
          {activeTab === 'resume' && <ResumeTab employee={employee} />}
          {activeTab === 'private' && <div className="text-slate-500 text-center py-20">Private Information Content</div>}
          {activeTab === 'salary' && isAdmin && <SalaryInfoTab employee={employee} />}
        </div>

      </div>
    </div>
  );
};

// --- Resume Tab Component ---
const ResumeTab = ({ employee }) => {
  return (
    <div className="flex gap-8">
      {/* Left Column */}
      <div className="flex-1 space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-slate-800">About</h3>
            <Pencil size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-200 p-4 rounded shadow-sm">
            {employee.resume?.about || 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s...'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-slate-800">What I love about my job</h3>
            <Pencil size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-200 p-4 rounded shadow-sm">
            {employee.resume?.whatILove || 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s...'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-slate-800">My interests and hobbies</h3>
            <Pencil size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-200 p-4 rounded shadow-sm">
            {employee.resume?.interests || 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s...'}
          </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-[300px] space-y-6">
        <div className="border border-slate-200 rounded p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Skills</h3>
          <div className="min-h-[100px]">
            {employee.resume?.skills?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-slate-600">
                {employee.resume.skills.map((skill, i) => <li key={i}>{skill}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No skills listed</p>
            )}
          </div>
          <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mt-4 border-t border-slate-100 pt-2 w-full">
            <Plus size={14} /> Add Skills
          </button>
        </div>

        <div className="border border-slate-200 rounded p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Certification</h3>
          <div className="min-h-[100px]">
            {employee.resume?.certifications?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-slate-600">
                {employee.resume.certifications.map((cert, i) => <li key={i}>{cert}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No certifications listed</p>
            )}
          </div>
          <button className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mt-4 border-t border-slate-100 pt-2 w-full">
            <Plus size={14} /> Add Skills
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Salary Info Tab Component ---
const SalaryInfoTab = ({ employee }) => {
  const sal = employee.salaryInfo || {};
  const comps = sal.components || {};
  const pf = sal.pf || {};
  const tax = sal.tax || {};

  return (
    <div className="max-w-4xl">
      {/* Top Header Row */}
      <div className="flex gap-16 mb-12 border-b border-slate-200 pb-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="w-28 text-slate-700 font-medium">Month Wage</span>
            <input type="text" className="w-32 border-b border-slate-300 px-2 py-1 text-right focus:outline-none focus:border-slate-800" defaultValue={sal.monthWage || 50000} />
            <span className="text-slate-500">/ Month</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-28 text-slate-700 font-medium">Yearly wage</span>
            <input type="text" className="w-32 border-b border-slate-300 px-2 py-1 text-right focus:outline-none focus:border-slate-800" defaultValue={sal.yearlyWage || 600000} />
            <span className="text-slate-500">/ Yearly</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="w-48 text-slate-700 font-medium">No of working days in a week:</span>
            <input type="text" className="w-16 border-b border-slate-300 px-2 py-1 text-center focus:outline-none focus:border-slate-800" defaultValue={sal.workingDays || 5} />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-48 text-slate-700 font-medium">Break Time:</span>
            <input type="text" className="w-16 border-b border-slate-300 px-2 py-1 text-center focus:outline-none focus:border-slate-800" defaultValue={sal.breakTime || 1} />
            <span className="text-slate-500">/ hrs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-16">
        {/* Salary Components */}
        <div>
          <h3 className="font-medium text-slate-800 border-b border-slate-200 pb-2 mb-6">Salary Components</h3>
          
          <div className="space-y-6 text-sm">
            <ComponentRow 
              label="Basic Salary" 
              desc="Define Basic salary from company cost compute it based on monthly Wages"
              amount={comps.basicSalary?.amount || '25000.00'}
              pct={comps.basicSalary?.percentage || '50.00'}
            />
            
            <ComponentRow 
              label="House Rent Allowance" 
              desc="HRA provided to employees 50% of the basic salary"
              amount={comps.houseRentAllowance?.amount || '12500.00'}
              pct={comps.houseRentAllowance?.percentage || '50.00'}
            />
            
            <ComponentRow 
              label="Standard Allowance" 
              desc="A standard allowance is a predetermined, fixed amount provided to employees as part of their salary"
              amount={comps.standardAllowance?.amount || '4167.00'}
              pct={comps.standardAllowance?.percentage || '16.67'}
            />
            
            <ComponentRow 
              label="Performance Bonus" 
              desc="Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary"
              amount={comps.performanceBonus?.amount || '2083.50'}
              pct={comps.performanceBonus?.percentage || '8.33'}
            />

            <ComponentRow 
              label="Leave Travel Allowance" 
              desc="LTA is paid by the company to employees to cover their travel expenses, and calculated as a % of the basic salary"
              amount={comps.leaveTravelAllowance?.amount || '2083.50'}
              pct={comps.leaveTravelAllowance?.percentage || '8.33'}
            />

            <ComponentRow 
              label="Fixed Allowance" 
              desc="Fixed allowance portion of wages is determined after calculating all salary components"
              amount={comps.fixedAllowance?.amount || '2918.00'}
              pct={comps.fixedAllowance?.percentage || '11.67'}
            />
          </div>
        </div>

        {/* PF and Tax */}
        <div>
          <h3 className="font-medium text-slate-800 border-b border-slate-200 pb-2 mb-6">Provident Fund (PF) Contribution</h3>
          
          <div className="space-y-6 text-sm mb-12">
            <ComponentRow 
              label="Employee" 
              desc="PF is calculated based on the basic salary"
              amount={pf.employee?.amount || '3000.00'}
              pct={pf.employee?.percentage || '12.00'}
            />
            
            <ComponentRow 
              label="Employer" 
              desc="PF is calculated based on the basic salary"
              amount={pf.employer?.amount || '3000.00'}
              pct={pf.employer?.percentage || '12.00'}
            />
          </div>

          <h3 className="font-medium text-slate-800 border-b border-slate-200 pb-2 mb-6">Tax Deductions</h3>
          <div className="space-y-6 text-sm">
            <div className="flex justify-between items-start">
              <div className="w-[50%]">
                <div className="font-medium text-slate-700">Professional Tax</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-tight">Professional Tax deducted from the Gross salary</div>
              </div>
              <div className="w-[50%] flex items-center justify-end gap-2">
                <input type="text" className="w-24 border-b border-slate-300 px-1 py-0.5 text-right focus:outline-none focus:border-slate-800" defaultValue={tax.professionalTax?.amount || '200.00'} />
                <span className="text-slate-500 w-12">₹ / month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComponentRow = ({ label, desc, amount, pct }) => (
  <div className="flex justify-between items-start">
    <div className="w-[45%]">
      <div className="font-medium text-slate-700">{label}</div>
      <div className="text-[11px] text-slate-400 mt-1 leading-tight">{desc}</div>
    </div>
    <div className="w-[55%] flex justify-end items-center gap-2">
      <input type="text" className="w-24 border-b border-slate-300 px-1 py-0.5 text-right focus:outline-none focus:border-slate-800" defaultValue={amount} />
      <span className="text-slate-500 w-16">₹ / month</span>
      <input type="text" className="w-16 border-b border-slate-300 px-1 py-0.5 text-right focus:outline-none focus:border-slate-800 ml-4" defaultValue={pct} />
      <span className="text-slate-500">%</span>
    </div>
  </div>
);

export default EmployeeProfile;
