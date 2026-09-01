import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DataTable from '../components/DataTable';

/**
 * Admin Stores Page — list all stores with filtering, sorting, and average rating.
 */
export default function AdminStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });

  // Sort state
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    fetchStores();
  }, [sortBy, order]);

  async function fetchStores() {
    setLoading(true);
    try {
      const params = { sortBy, order };
      if (filters.name) params.name = filters.name;
      if (filters.address) params.address = filters.address;

      const res = await api.get('/stores', { params });
      setStores(res.data.data);
    } catch (err) {
      setError('Failed to load stores.');
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
    fetchStores();
  }

  const columns = [
    { key: 'name', label: 'Store Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'averageRating', label: 'Rating' },
  ];

  function renderCell(row, col) {
    if (col.key === 'averageRating') {
      const avg = parseFloat(row.averageRating);
      return avg > 0 ? `${avg.toFixed(1)} / 5` : 'No ratings';
    }
    return row[col.key] || '—';
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Stores</h1>
        <button className="btn btn-primary" onClick={() => navigate('/admin/stores/add')}>
          + Add Store
        </button>
      </div>

      {/* Filters */}
      <form className="filters-bar" onSubmit={handleFilterSubmit}>
        <div className="form-group">
          <label>Store Name</label>
          <input name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by name" />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input name="address" value={filters.address} onChange={handleFilterChange} placeholder="Filter by address" />
        </div>
        <button type="submit" className="btn btn-secondary">Filter</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading stores...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={stores}
          sortBy={sortBy}
          order={order}
          onSort={handleSort}
          renderCell={renderCell}
        />
      )}
    </div>
  );
}
