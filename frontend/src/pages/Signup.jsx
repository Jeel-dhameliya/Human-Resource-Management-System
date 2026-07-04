import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Upload } from 'lucide-react';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [logoFile, setLogoFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.name);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('companyName', formData.companyName);
      data.append('phone', formData.phone);
      data.append('role', 'admin');
      
      if (logoFile) {
        data.append('logo', logoFile);
      }
      
      const response = await axios.post('/api/auth/signup', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Human Resource Management System</h1>
      </div>
      
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '500' }}>
          {logoFile ? (
            <img 
              src={URL.createObjectURL(logoFile)} 
              alt="Logo Preview" 
              style={{ maxHeight: '60px', objectFit: 'contain' }} 
            />
          ) : (
            'App/Web Logo'
          )}
        </h2>

        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="companyName">Company Name :-</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="form-control"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                id="logo" 
                name="logo" 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
              <button type="button" className="upload-btn" title="Upload Logo" style={{ pointerEvents: 'none' }}>
                <Upload size={20} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Name :-</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email :-</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone :-</label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password :-</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password :-</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'SIGNING UP...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
