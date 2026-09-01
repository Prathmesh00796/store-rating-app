import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Admin Add Store Page — create a new store.
 * Owner dropdown is populated from STORE_OWNER users.
 */
export default function AdminAddStore() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Store Owner users for the dropdown
  useEffect(() => {
    async function fetchOwners() {
      try {
        const res = await api.get('/stores/owners');
        setOwners(res.data.data);
      } catch (err) {
        setServerError('Failed to load store owners.');
      }
    }
    fetchOwners();
  }, []);

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Store name is required.';
    if (!form.email.trim()) errs.email = 'Store email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Please enter a valid email.';
    if (!form.ownerId) errs.ownerId = 'Please select a store owner.';
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
      await api.post('/stores', form);
      setSuccess('Store created successfully!');
      setTimeout(() => navigate('/admin/stores'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Add Store</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/stores')}>← Back</button>
      </div>

      <div className="form-container">
        <div className="form-card">
          {serverError && <div className="alert alert-error">{serverError}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Store Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Store name" />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Store Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="store@example.com" />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Store Address</label>
              <textarea id="address" name="address" value={form.address} onChange={handleChange} placeholder="Store address" />
            </div>

            <div className="form-group">
              <label htmlFor="ownerId">Store Owner</label>
              <select id="ownerId" name="ownerId" value={form.ownerId} onChange={handleChange}>
                <option value="">Select a Store Owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
              {errors.ownerId && <p className="error-text">{errors.ownerId}</p>}
              {owners.length === 0 && (
                <p className="error-text">No Store Owner users found. Create one first.</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
