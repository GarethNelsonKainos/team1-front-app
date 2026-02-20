/**
 * Progressive enhancement for job application UI
 */
document.addEventListener('DOMContentLoaded', function() {
  // Add loading states to apply buttons
  const applyButtons = document.querySelectorAll('a[href*="/apply"]');
  
  applyButtons.forEach(button => {
    button.addEventListener('click', function() {
      this.style.opacity = '0.7';
      this.textContent = 'Loading...';
    });
  });
  
  // Any other basic UI enhancements can go here
});