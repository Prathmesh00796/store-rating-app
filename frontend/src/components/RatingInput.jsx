/**
 * RatingInput — star-based rating selector (1-5).
 * 
 * Props:
 *   value    — current selected rating (1-5 or null)
 *   onChange — callback(newValue) when a star is clicked
 *   readOnly — if true, stars are not clickable
 */
export default function RatingInput({ value, onChange, readOnly = false }) {
  return (
    <div className="rating-display">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          style={{ cursor: readOnly ? 'default' : 'pointer' }}
          title={`${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
      {value > 0 && <span className="rating-value">{value}/5</span>}
    </div>
  );
}
