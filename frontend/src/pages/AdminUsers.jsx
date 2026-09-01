import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/DataTable';

/**
 * Admin Users Page — list all users with filtering and sorting.
 * Clicking a row navigates to user details.
 */
export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });

  // Sort state
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    fetchUsers();
  }, [sortBy, order]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = { sortBy, order };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;

      const res = await api.get('/users', { params });
      setUsers(res.data.data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  function handleSort(key) {
    if (sortBy === key) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setOrder('asc');
    }
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleFilterSubmit(e) {
    e.preventDefault();
    fetchUsers();
  }

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'role', label: 'Role' },
  ];

  // Custom cell rendering for role badges
  function renderCell(row, col) {
    if (col.key === 'role') {
      const badgeClass = {
        ADMIN: 'badge-admin',
        NORMAL_USER: 'badge-normal',
        STORE_OWNER: 'badge-owner',
      };
      const labels = {
        ADMIN: 'Admin',
        NORMAL_USER: 'Normal User',
        STORE_OWNER: 'Store Owner',
      };
      return <span className={`badge ${badgeClass[row.role]}`}>{labels[row.role]}</span>;
    }
    return row[col.key] || '—';
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/users/add')}>
          + Add User
        </button>
      </div>

      {/* Filters */}
      <form className="filters-bar" onSubmit={handleFilterSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by name" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" value={filters.email} onChange={handleFilterChange} placeholder="Filter by email" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input name="address" value={filters.address} onChange={handleFilterChange} placeholder="Filter by address" />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select name="role" value={filters.role} onChange={handleFilterChange}>
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
          renderCell={renderCell}
        />
      )}
    </div>
  );
}
