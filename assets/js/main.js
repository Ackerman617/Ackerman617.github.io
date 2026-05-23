/**
 * ==========================================================================
 * RUNTIME INTERACTIONS - PREMIUM MINIMALIST BLOG ENGINE
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initReadingProgressBar();
  initPageEffects();
});

/**
 * 1. Premium Theme Engine (Cyclic Theme Selector)
 * Rotates between: Pitch-Black -> Obsidian Charcoal -> Sepia Paper -> Pitch-Black
 */
function initThemeEngine() {
  const themes = ['pitch-black', 'obsidian-charcoal', 'sepia-paper'];
  const toggleBtn = document.getElementById('theme-toggle');
  
  if (!toggleBtn) return;

  // Retrieve current active theme or fallback to pitch-black
  let currentTheme = localStorage.getItem('blog-theme') || 'pitch-black';
  
  // Apply immediately in case the DOM loaded slower
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  toggleBtn.addEventListener('click', () => {
    // Determine the next index
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    // Apply changes with visual transition
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('blog-theme', nextTheme);
    currentTheme = nextTheme;
    
    // Remove transition helper after half second
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  });
}

/**
 * 2. Performant Scroll-Bound Reading Progress Indicator
 * Measures viewport progress through the article content and updates the top line.
 */
function initReadingProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  const postArticle = document.querySelector('.post-article');
  
  if (!progressBar || !postArticle) return;

  let ticking = false;

  function updateProgress() {
    // Calculate total height of the article minus viewport height
    const articleRect = postArticle.getBoundingClientRect();
    const articleHeight = postArticle.offsetHeight;
    const articleTopFromViewport = articleRect.top + window.scrollY;
    
    const startScrollY = articleTopFromViewport;
    const endScrollY = startScrollY + articleHeight - window.innerHeight;
    
    const currentScrollY = window.scrollY;
    
    let progressPercent = 0;
    
    if (currentScrollY > startScrollY) {
      const scrolledInArticle = currentScrollY - startScrollY;
      const totalScrollableInArticle = articleHeight - window.innerHeight;
      
      if (totalScrollableInArticle > 0) {
        progressPercent = (scrolledInArticle / totalScrollableInArticle) * 100;
      } else {
        progressPercent = 100;
      }
    }
    
    // Clamp between 0% and 100%
    const clampedProgress = Math.max(0, Math.min(100, progressPercent));
    progressBar.style.width = `${clampedProgress}%`;
    ticking = false;
  }

  // Use RequestAnimationFrame for high performance 60fps scrolling
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateProgress();
      });
      ticking = true;
    }
  }, { passive: true });

  // Update immediately on page load to account for initial anchors
  updateProgress();
}

/**
 * 3. Page Micro-animations & Interactive Effects
 * Handles dynamic transitions, link mouse effects and refined aesthetics.
 */
function initPageEffects() {
  // Add subtle page enter transitions for dynamic cards
  const cards = document.querySelectorAll('.post-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    card.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    
    // Staggered card fade-ins
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 150 + index * 80);
  });
}

// Inject CSS style for theme switching transition dynamically to avoid initial load transition
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  .theme-transitioning,
  .theme-transitioning *,
  .theme-transitioning *::before,
  .theme-transitioning *::after {
    transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
                color 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
`;
document.head.appendChild(styleElement);
