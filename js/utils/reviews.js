/**
 * Reviews and Ratings System
 * Handles user reviews, ratings, and comments for locations
 */

/**
 * Add a review for a location
 * @param {string} locationId - Location ID
 * @param {string} locationName - Location name
 * @param {number} rating - Rating (1-5)
 * @param {string} comment - Review comment
 * @returns {Object} Created review
 */
export function addReview(locationId, locationName, rating, comment) {
  const reviews = getReviews();
  
  const review = {
    id: Date.now().toString(),
    locationId,
    locationName,
    rating,
    comment,
    userName: localStorage.getItem('userName') || 'Anonymous',
    createdAt: Date.now(),
    helpful: 0
  };
  
  reviews.push(review);
  localStorage.setItem('userReviews', JSON.stringify(reviews));
  
  console.log('[Reviews] Review added:', review);
  return review;
}

/**
 * Get all reviews
 * @returns {Array} All reviews
 */
export function getReviews() {
  return JSON.parse(localStorage.getItem('userReviews') || '[]');
}

/**
 * Get reviews for a specific location
 * @param {string} locationId - Location ID
 * @returns {Array} Location reviews
 */
export function getLocationReviews(locationId) {
  const reviews = getReviews();
  return reviews.filter(review => review.locationId === locationId);
}

/**
 * Calculate average rating for a location
 * @param {string} locationId - Location ID
 * @returns {number} Average rating
 */
export function getAverageRating(locationId) {
  const reviews = getLocationReviews(locationId);
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

/**
 * Mark review as helpful
 * @param {string} reviewId - Review ID
 */
export function markReviewHelpful(reviewId) {
  const reviews = getReviews();
  const review = reviews.find(r => r.id === reviewId);
  
  if (review) {
    review.helpful = (review.helpful || 0) + 1;
    localStorage.setItem('userReviews', JSON.stringify(reviews));
  }
}

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 */
export function deleteReview(reviewId) {
  const reviews = getReviews();
  const filtered = reviews.filter(r => r.id !== reviewId);
  localStorage.setItem('userReviews', JSON.stringify(filtered));
  
  console.log('[Reviews] Review deleted:', reviewId);
}

/**
 * Render star rating HTML
 * @param {number} rating - Rating value (0-5)
 * @param {boolean} interactive - Whether stars are clickable
 * @returns {string} HTML string
 */
export function renderStarRating(rating, interactive = false) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= rating;
    const star = filled ? '⭐' : '☆';
    
    if (interactive) {
      stars.push(`<span class="star-interactive" data-rating="${i}">${star}</span>`);
    } else {
      stars.push(`<span class="star">${star}</span>`);
    }
  }
  
  return `<div class="star-rating ${interactive ? 'interactive' : ''}">${stars.join('')}</div>`;
}

/**
 * Show review modal for a location
 * @param {Object} location - Location object
 */
export function showReviewModal(location) {
  const existingModal = document.getElementById('reviewModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'reviewModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content review-modal scale-in">
      <div class="modal-header">
        <h3>Write a Review</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      
      <div class="modal-body">
        <div class="review-location">
          <strong>${location.name}</strong>
          <p>${location.type}</p>
        </div>
        
        <div class="review-rating-section">
          <label>Your Rating</label>
          <div class="star-rating interactive" id="reviewStars">
            ${[1, 2, 3, 4, 5].map(i => `<span class="star-interactive" data-rating="${i}">☆</span>`).join('')}
          </div>
          <input type="hidden" id="reviewRating" value="0">
        </div>
        
        <div class="review-comment-section">
          <label for="reviewComment">Your Review</label>
          <textarea 
            id="reviewComment" 
            placeholder="Share your experience at this place..."
            rows="4"
            maxlength="500"
          ></textarea>
          <div class="character-count">
            <span id="charCount">0</span>/500
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-text" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn-primary" id="submitReview">Submit Review</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Setup star rating interaction
  const stars = modal.querySelectorAll('.star-interactive');
  const ratingInput = modal.querySelector('#reviewRating');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      ratingInput.value = rating;
      
      stars.forEach((s, index) => {
        s.textContent = index < rating ? '⭐' : '☆';
      });
    });
    
    star.addEventListener('mouseenter', () => {
      const rating = parseInt(star.dataset.rating);
      stars.forEach((s, index) => {
        s.textContent = index < rating ? '⭐' : '☆';
      });
    });
  });
  
  modal.querySelector('.star-rating').addEventListener('mouseleave', () => {
    const currentRating = parseInt(ratingInput.value);
    stars.forEach((s, index) => {
      s.textContent = index < currentRating ? '⭐' : '☆';
    });
  });
  
  // Character counter
  const textarea = modal.querySelector('#reviewComment');
  const charCount = modal.querySelector('#charCount');
  
  textarea.addEventListener('input', () => {
    charCount.textContent = textarea.value.length;
  });
  
  // Submit handler
  modal.querySelector('#submitReview').addEventListener('click', () => {
    const rating = parseInt(ratingInput.value);
    const comment = textarea.value.trim();
    
    if (rating === 0) {
      if (window.toastManager) {
        window.toastManager.warning('Please select a rating');
      }
      return;
    }
    
    if (!comment) {
      if (window.toastManager) {
        window.toastManager.warning('Please write a review');
      }
      return;
    }
    
    addReview(location.id, location.name, rating, comment);
    
    if (window.toastManager) {
      window.toastManager.success('Review submitted successfully!');
    }
    
    modal.remove();
  });
}

/**
 * Render reviews list for a location
 * @param {string} locationId - Location ID
 * @returns {string} HTML string
 */
export function renderReviewsList(locationId) {
  const reviews = getLocationReviews(locationId);
  const avgRating = getAverageRating(locationId);
  
  if (reviews.length === 0) {
    return `
      <div class="reviews-empty">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    `;
  }
  
  return `
    <div class="reviews-summary">
      <div class="avg-rating">
        <span class="rating-number">${avgRating}</span>
        ${renderStarRating(Math.round(avgRating))}
        <span class="review-count">(${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})</span>
      </div>
    </div>
    
    <div class="reviews-list">
      ${reviews.map(review => `
        <div class="review-item">
          <div class="review-header">
            <div class="review-user">
              <div class="avatar avatar-small">
                <span>👤</span>
              </div>
              <div>
                <div class="review-username">${review.userName}</div>
                <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            ${renderStarRating(review.rating)}
          </div>
          <div class="review-comment">${review.comment}</div>
          <div class="review-actions">
            <button class="btn-text btn-sm" onclick="window.reviewsModule.markHelpful('${review.id}')">
              👍 Helpful (${review.helpful || 0})
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Global reviews module
window.reviewsModule = {
  markHelpful(reviewId) {
    markReviewHelpful(reviewId);
    if (window.toastManager) {
      window.toastManager.success('Thanks for your feedback!');
    }
  }
};
