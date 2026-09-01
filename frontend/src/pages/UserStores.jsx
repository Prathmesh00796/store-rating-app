import { useState, useEffect } from 'react';
import api from '../services/api';
import StoreCard from '../components/StoreCard';
import RatingInput from '../components/RatingInput';

/**
 * Normal User — Store Listing Page
 * Displays all stores with search, overall rating, user's own rating,
 * and ability to submit/modify ratings via a modal.
 */
export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState({ name: '', address: '' });

  // Rating modal state
  const [modalStore, setModalStore] = useState(null);
  const [modalRating, setModalRating] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setLoading(true);
    try {
      const params = {};
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;

      const res = await api.get('/stores', { params });
      setStores(res.data.data);
    } catch (err) {
      setError('Failed to load stores.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchStores();
  }

  // Open the rating modal for a store
  function openRatingModal(storeId) {
    const store = stores.find((s) => s.id === storeId);
    setModalStore(store);
    setModalRating(store.userRating ? parseInt(store.userRating) : 0);
    setModalMessage('');
  }

  // Submit or modify a rating
  async function handleRatingSubmit() {
    if (modalRating < 1 || modalRating > 5) {
      setModalMessage('Please select a rating between 1 and 5.');
      return;
    }

    setModalLoading(true);
    setModalMessage('');

    try {
      const hasExisting = modalStore.userRating !== null && modalStore.userRating !== undefined;

      if (hasExisting) {
        await api.put(`/stores/${modalStore.id}/ratings`, { rating: modalRating });
        setModalMessage('Rating updated successfully!');
      } else {
        await api.post(`/stores/${modalStore.id}/ratings`, { rating: modalRating });
        setModalMessage('Rating submitted successfully!');
      }

      // Refresh stores to show updated ratings
      setTimeout(() => {
        setModalStore(null);
        fetchStores();
      }, 1000);
    } catch (err) {
      setModalMessage(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Stores</h1>
      </div>

      {/* Search Bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          value={search.name}
          onChange={(e) => setSearch({ ...search, name: e.target.value })}
          placeholder="Search by store name..."
        />
        <input
          value={search.address}
          onChange={(e) => setSearch({ ...search, address: e.target.value })}
          placeholder="Search by address..."
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <p>No stores found.</p>
        </div>
      ) : (
        <div className="store-grid">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} onRate={openRatingModal} />
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {modalStore && (
        <div className="modal-overlay" onClick={() => !modalLoading && setModalStore(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modalStore.userRating ? 'Modify Rating' : 'Submit Rating'}</h2>
            <p style={{ marginBottom: '1rem', color: '#64748b' }}>{modalStore.name}</p>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <RatingInput value={modalRating} onChange={setModalRating} />
            </div>

            {modalMessage && (
              <div className={`alert ${modalMessage.includes('success') ? 'alert-success' : 'alert-error'}`}>
                {modalMessage}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModalStore(null)} disabled={modalLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleRatingSubmit} disabled={modalLoading || modalRating === 0}>
                {modalLoading ? 'Saving...' : 'Save Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
