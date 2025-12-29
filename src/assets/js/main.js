/**
 * Lex Duvekot - GZ Psycholoog
 * Main JavaScript
 * 
 * TODO: Extract necessary JavaScript from WordPress mirror
 * 
 * Likely functionality needed:
 * - Mobile menu toggle
 * - Dropdown menus
 * - Smooth scroll
 * - Any animations from original site
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      mainNav.classList.toggle('is-open');
      menuToggle.classList.toggle('is-active');
    });
  }
  
  // Dropdown menus on touch devices
  const dropdownParents = document.querySelectorAll('.has-dropdown');
  dropdownParents.forEach(function(parent) {
    const link = parent.querySelector('a');
    if (link && 'ontouchstart' in window) {
      link.addEventListener('click', function(e) {
        if (!parent.classList.contains('is-open')) {
          e.preventDefault();
          dropdownParents.forEach(p => p.classList.remove('is-open'));
          parent.classList.add('is-open');
        }
      });
    }
  });
});
