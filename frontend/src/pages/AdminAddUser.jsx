import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Admin Add User Page — create a user with any role.
 * Includes full client-side validation.
 */
export default function AdminAddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    else if (form.name.trim().length < 20) errs.name = 'Name must be at least 20 characters.';
    else if (form.name.trim().length > 60) errs.name = 'Name must be at most 60 characters.';

    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Please enter a valid email.';

    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    else if (form.password.length > 16) errs.password = 'Password must be at most 16 characters.';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Must contain at least one uppercase letter.';
    else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password)) errs.password = 'Must contain at least one special character.';

    if (form.address && form.address.trim().length > 400) errs.address = 'Address must be at most 400 characters.';

    return errs;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setSuccess('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await api.post('/users', form);
      setSuccess('User created successfully!');
      setTimeout(() => navigate('/admin/users'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add User</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>← Back</button>
      </div>

      <div className="form-container">
        <div className="form-card">
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name (20-60 characters)</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="user@example.com" />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="8-16 chars, uppercase, special" />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" value={form.address} onChange={handleChange} placeholder="Address (optional)" />
              {errors.address && <p className="error-text">{errors.address}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={form.role} onChange={handleChange}>
                <option value="NORMAL_USER">Normal User</option>
                <option value="ADMIN">Admin</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
