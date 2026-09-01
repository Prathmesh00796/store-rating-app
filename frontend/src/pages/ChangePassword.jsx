import { useState } from 'react';
import api from '../services/api';

/**
 * Change Password Page — shared by all roles.
 * Requires current password verification before updating.
 */
export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};

    if (!form.currentPassword) errs.currentPassword = 'Current password is required.';

    if (!form.newPassword) errs.newPassword = 'New password is required.';
    else if (form.newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters.';
    else if (form.newPassword.length > 16) errs.newPassword = 'Password must be at most 16 characters.';
    else if (!/[A-Z]/.test(form.newPassword)) errs.newPassword = 'Must contain at least one uppercase letter.';
    else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.newPassword)) errs.newPassword = 'Must contain at least one special character.';

    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your new password.';
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';

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
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Change Password</h1>
      </div>

      <div className="form-container">
        <div className="form-card">
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
              {errors.currentPassword && <p className="error-text">{errors.currentPassword}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password (8-16 chars, uppercase, special char)</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              {errors.newPassword && <p className="error-text">{errors.newPassword}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
