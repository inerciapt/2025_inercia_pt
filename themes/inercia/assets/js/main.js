// Include functionality based on the original inc.js
window.addEventListener("DOMContentLoaded", initStuff);

function initStuff() {
  updateHeaderLinks();
}

function updateHeaderLinks() {
  var li = document.location.pathname;
  if (li.endsWith('/')) {
    li = li.slice(0, -1);
  }
  if (li === '') {
    li = '/';
  }
  
  // Find the current page link and add active class
  var links = document.querySelectorAll('.b-siteNav__link');
  links.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href === li || (li === '/' && href === '/')) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('active');
    }
  });
}
