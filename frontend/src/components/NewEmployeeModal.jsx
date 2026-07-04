import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const NewEmployeeModal = ({ close, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'Password123!', // default password complying with security rules
    role: 'employee',
    employeeId: '',
    department: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('phone', formData.phone);
      data.append('role', formData.role);
      data.append('companyName', JSON.parse(localStorage.getItem('user') || '{}')?.companyName || 'Organization');
      if (formData.employeeId) data.append('employeeId', formData.employeeId);

      await axios.post('/api/auth/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // If department or designation provided, update the created employee
      if (formData.department || formData.designation) {
        const token = localStorage.getItem('token');
        const empRes = await axios.get('/api/employees', { headers: { Authorization: `Bearer ${token}` } });
        const newEmp = empRes.data.find(emp => emp.userId?.email === formData.email || emp.fullName === formData.fullName);
        if (newEmp) {
          await axios.put(`/api/employees/${newEmp._id}`, {
            jobDetails: {
              ...newEmp.jobDetails,
              department: formData.department,
              designation: formData.designation
            }
          }, { headers: { Authorization: `Bearer ${token}` } });
        }
      }

      alert('Employee created successfully!');
      if (onSuccess) onSuccess();
      close();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[540px] shadow-xl overflow-hidden">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-800">Add New Employee</h2>
          <button onClick={close} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID (Optional)</label>
              <input
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="EMP-101"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Engineering"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Software Engineer"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin / HR Officer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password *</label>
              <input
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 bg-slate-50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 mt-6">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewEmployeeModal;
