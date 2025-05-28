document.addEventListener('DOMContentLoaded', () => {
  console.log('rating.js loaded');

  document.querySelectorAll('[data-post-id]').forEach(element => {
    const postId = element.getAttribute('data-post-id');
    console.log(`Connecting WebSocket for post ${postId}`);
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    // const socket = new WebSocket(`${wsProtocol}:
    const socket = new WebSocket(`${wsProtocol}://${window.location.host}/ws/post/${postId}/`);

    socket.onopen = () => console.log(`WebSocket connected for post ${postId}`);

    socket.onmessage = (event) => {
      console.log(`WebSocket message received for post ${postId}:`, event.data);
      try {
        const data = JSON.parse(event.data);
        updateRatingButtons(postId, data);
      } catch (error) {
        console.error(`JSON parse error for post ${postId}:`, error);
      }
    };
    socket.onclose = (event) => console.log(`WebSocket closed for post ${postId}:`, event);
    socket.onerror = (error) => console.error(`WebSocket error for post ${postId}:`, error);
  });

  document.querySelectorAll('.like-btn, .dislike-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const type = button.classList.contains('like-btn') ? 'Like' : 'Dislike';
      console.log(`Button clicked: ${type}`);

      const isAuthenticated = button.getAttribute('data-is-authenticated') === 'true';
      if (!isAuthenticated) {
        console.log('User is not authenticated, cannot rate');
        alert('Пожалуйста, войдите в аккаунт, чтобы ставить лайки или дизлайки.');
        return;
      }

      if (!button.classList.contains('disabled')) {
        const postId = button.getAttribute('data-post-id');
        const action = button.getAttribute('data-action');
        console.log(`Sending AJAX for post ${postId}, action: ${action}`);

        button.classList.add('disabled');
        fetch(`/post/${postId}/rate/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          body: `action=${action}`
        })
          .then(response => {
            console.log(`Response status for post ${postId}:`, response.status);
            return response.json();
          })
          .then(data => {
            console.log(`Response data for post ${postId}:`, data);
            if (data.status === 'success') {
              updateRatingButtons(postId, data);
            } else {
              console.error(`Server error for post ${postId}:`, data.message);
            }
          })
          .catch(error => console.error(`Fetch error for post ${postId}:`, error))
          .finally(() => button.classList.remove('disabled'));
      }
    });
  });

  function updateRatingButtons(postId, data) {
    console.log(`Updating buttons for post ${postId}:`, data);
    document.querySelectorAll(`[data-post-id="${postId}"]`).forEach(button => {
      const isAuthenticated = button.getAttribute('data-is-authenticated') === 'true';
      const isLikeBtn = button.classList.contains('like-btn');

      if (isLikeBtn) {
        button.querySelector('.likes-count').textContent = data.likes_count;
      } else {
        button.querySelector('.dislikes-count').textContent = data.dislikes_count;
      }

      if (isAuthenticated) {
        if (isLikeBtn) {
          button.setAttribute('data-action', data.user_liked ? 'unlike' : 'like');
          button.classList.toggle('active', data.user_liked);
          if (data.user_liked) {
            const dislikeBtn = button.closest('.rating-buttons').querySelector('.dislike-btn');
            dislikeBtn.setAttribute('data-action', 'dislike');
            dislikeBtn.classList.remove('active');
          }
        } else {
          button.setAttribute('data-action', data.user_disliked ? 'undislike' : 'dislike');
          button.classList.toggle('active', data.user_disliked);
          if (data.user_disliked) {
            const likeBtn = button.closest('.rating-buttons').querySelector('.like-btn');
            likeBtn.setAttribute('data-action', 'like');
            likeBtn.classList.remove('active');
          }
        }
      } else {
        button.classList.remove('active');
        button.setAttribute('data-action', isLikeBtn ? 'like' : 'dislike');
      }
    });
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const trimmed = cookie.trim();
        if (trimmed.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(trimmed.substring(name.length + 1));
          break;
        }
      }
    }
    console.log(`CSRF token: ${cookieValue}`);
    return cookieValue;
  }
});