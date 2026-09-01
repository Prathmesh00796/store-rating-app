import RatingInput from './RatingInput';

/**
 * StoreCard — displays store info for normal users.
 * Shows overall rating, user's own rating, and submit/modify button.
 * 
 * Props:
 *   store     — store object { id, name, address, averageRating, userRating }
 *   onRate    — callback(storeId) to open rating modal
 */
export default function StoreCard({ store, onRate }) {
  const avgRating = parseFloat(store.averageRating) || 0;
  const userRating = store.userRating ? parseInt(store.userRating) : null;
  const hasRated = userRating !== null;

  return (
    <div className="store-card">
      <h3>{store.name}</h3>
      <p className="store-address">📍 {store.address || 'No address'}</p>

      <div className="store-ratings">
        <div className="overall-rating">
          <div className="rating-text">Overall Rating</div>
          {avgRating > 0 ? (
            <RatingInput value={Math.round(avgRating)} readOnly />
          ) : (
            <span className="rating-text">No ratings yet</span>
          )}
        </div>

        <div className="your-rating">
          <div className="rating-text">Your Rating</div>
          {hasRated ? (
            <>
              <RatingInput value={userRating} readOnly />
              <button className="btn btn-sm btn-secondary" onClick={() => onRate(store.id)}>
                Modify Rating
              </button>
            </>
          ) : (
            <button className="btn btn-sm btn-primary" onClick={() => onRate(store.id)}>
              Submit Rating
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
