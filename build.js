const fs = require('fs');
const path = require('path');

// 1. Ensure standard output directories exist
function ensureDirectoryExistence(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const postsSourceDir = path.join(__dirname, 'posts_source');
const postsOutputDir = path.join(__dirname, 'posts');
const assetsCssDir = path.join(__dirname, 'assets', 'css');
const assetsJsDir = path.join(__dirname, 'assets', 'js');

ensureDirectoryExistence(postsSourceDir);
ensureDirectoryExistence(postsOutputDir);
ensureDirectoryExistence(assetsCssDir);
ensureDirectoryExistence(assetsJsDir);

// 2. Custom Markdown Parser Helper Functions
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function parseInline(text) {
  let result = escapeHtml(text);

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold: **text** or __text__
  result = result.replace(/\*\*([^*<>]+)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__([^_<>]+)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  result = result.replace(/\*([^*<>]+)\*/g, '<em>$1</em>');
  result = result.replace(/_([^_<>]+)_/g, '<em>$1</em>');

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return result;
}

// 2.1 Custom Build-Time Syntax Highlighter (Zero NPM Dependency)
function highlightSyntax(code, lang) {
  if (!lang) return escapeHtml(code);
  const l = lang.toLowerCase();
  
  let opaqueBlocks = [];
  let placeholderCount = 0;
  let processed = code;
  
  if (l === 'javascript' || l === 'js' || l === 'json') {
    // Strings
    processed = processed.replace(/("(\\"|[^"])*")|('(\\'|[^'])*')|(`(\\`|[^`])*`)/g, (match) => {
      const id = `__OPAQUE_BLOCK_${placeholderCount++}__`;
      opaqueBlocks.push({ id, html: `<span class="token string">${escapeHtml(match)}</span>` });
      return id;
    });
    
    // Comments
    processed = processed.replace(/(\/\/.*)|(\/\*[\s\S]*?\*\/)/g, (match) => {
      const id = `__OPAQUE_BLOCK_${placeholderCount++}__`;
      opaqueBlocks.push({ id, html: `<span class="token comment">${escapeHtml(match)}</span>` });
      return id;
    });
    
    processed = escapeHtml(processed);
    
    // Keywords, Numbers, Functions
    processed = processed
      .replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|import|export|from|class|extends|new|this|typeof|instanceof|async|await|try|catch|finally|throw|debugger|null|undefined|true|false)\b/g, '<span class="token keyword">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="token number">$1</span>')
      .replace(/\b(\w+)(?=\()/g, '<span class="token function">$1</span>');
  } 
  else if (l === 'html' || l === 'xml') {
    // Comments
    processed = processed.replace(/(<!--[\s\S]*?-->)/g, (match) => {
      const id = `__OPAQUE_BLOCK_${placeholderCount++}__`;
      opaqueBlocks.push({ id, html: `<span class="token comment">${escapeHtml(match)}</span>` });
      return id;
    });

    processed = escapeHtml(processed);

    // Tags & Attributes
    processed = processed
      .replace(/(&lt;\/?[a-zA-Z0-9\-]+)(&gt;)/g, '<span class="token tag">$1</span>$2')
      .replace(/(&lt;\/?[a-zA-Z0-9\-]+)(?=\s)/g, '<span class="token tag">$1</span>')
      .replace(/\b([a-zA-Z\-]+)(?=\s*=\s*(?:'|"|&quot;))/g, '<span class="token attr-name">$1</span>')
      .replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="token attr-value">$1</span>');
  } 
  else if (l === 'css') {
    // Comments
    processed = processed.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
      const id = `__OPAQUE_BLOCK_${placeholderCount++}__`;
      opaqueBlocks.push({ id, html: `<span class="token comment">${escapeHtml(match)}</span>` });
      return id;
    });

    processed = escapeHtml(processed);

    processed = processed
      .replace(/\b([a-zA-Z\-]+)(?=\s*:)/g, '<span class="token property">$1</span>')
      .replace(/(^|[\{\},])\s*([\.#a-zA-Z0-9\-\s\:\*\+>~\(\)\[\]\^"'\$=]+)(?=\s*\{)/g, '$1<span class="token selector">$2</span>');
  }
  else if (l === 'yaml' || l === 'yml') {
    // Comments
    processed = processed.replace(/(#.*)/g, (match) => {
      const id = `__OPAQUE_BLOCK_${placeholderCount++}__`;
      opaqueBlocks.push({ id, html: `<span class="token comment">${escapeHtml(match)}</span>` });
      return id;
    });

    processed = escapeHtml(processed);

    processed = processed
      .replace(/^([a-zA-Z\-_\s]+)(?=:)/gm, '<span class="token key">$1</span>')
      .replace(/(:\s*)(.+)$/gm, '$1<span class="token value">$2</span>');
  }
  else if (l === 'bash' || l === 'sh' || l === 'shell') {
    // Comments
    processed = processed.replace(/(#.*)/g, (match) => {
      const id = `__OPAQUE_BLOCK_${placeholderCount++}__`;
      opaqueBlocks.push({ id, html: `<span class="token comment">${escapeHtml(match)}</span>` });
      return id;
    });

    // Strings
    processed = processed.replace(/(["'])(.*?)\1/g, (match) => {
      const id = `__OPAQUE_BLOCK_${placeholderCount++}__`;
      opaqueBlocks.push({ id, html: `<span class="token string">${escapeHtml(match)}</span>` });
      return id;
    });

    processed = escapeHtml(processed);

    processed = processed
      .replace(/\b(cd|mkdir|rm|cp|mv|ls|node|npm|git|npx|echo|cat|grep|exit)\b/g, '<span class="token command">$1</span>');
  }
  else {
    processed = escapeHtml(processed);
  }
  
  // Restore all opaque blocks
  opaqueBlocks.forEach(block => {
    processed = processed.replace(block.id, block.html);
  });
  
  return processed;
}

function parseMarkdown(mdText) {
  const lines = mdText.split(/\r?\n/);
  let html = '';
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines = [];
  let inList = null; // 'ul', 'ol', or null
  let inBlockquote = false;
  let blockquoteLines = [];

  function closeList() {
    if (inList === 'ul') {
      html += '</ul>\n';
      inList = null;
    } else if (inList === 'ol') {
      html += '</ol>\n';
      inList = null;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      const bqContent = blockquoteLines.join('\n');
      html += `<blockquote>\n${parseMarkdown(bqContent)}\n</blockquote>\n`;
      blockquoteLines = [];
      inBlockquote = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const codeText = highlightSyntax(codeLines.join('\n'), codeLanguage);
        html += `<pre><code class="language-${codeLanguage || 'text'}">${codeText}</code></pre>\n`;
        codeLines = [];
        inCodeBlock = false;
      } else {
        closeList();
        closeBlockquote();
        inCodeBlock = true;
        codeLanguage = line.trim().substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // 2. Blockquotes
    if (line.trim().startsWith('>')) {
      closeList();
      inBlockquote = true;
      const bqLine = line.trim().substring(1).replace(/^\s/, '');
      blockquoteLines.push(bqLine);
      continue;
    } else if (inBlockquote && line.trim() !== '') {
      const bqLine = line.trim().startsWith('>') ? line.trim().substring(1).replace(/^\s/, '') : line;
      blockquoteLines.push(bqLine);
      continue;
    } else if (inBlockquote && line.trim() === '') {
      closeBlockquote();
    }

    // 3. Horizontal Rules
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      closeList();
      closeBlockquote();
      html += '<hr />\n';
      continue;
    }

    // 4. Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const level = headingMatch[1].length;
      const text = parseInline(headingMatch[2]);
      html += `<h${level}>${text}</h${level}>\n`;
      continue;
    }

    // 5. Unordered Lists
    const ulMatch = line.match(/^([\*\-\+])\s+(.*)$/);
    if (ulMatch) {
      closeBlockquote();
      if (inList !== 'ul') {
        closeList();
        html += '<ul>\n';
        inList = 'ul';
      }
      const text = parseInline(ulMatch[2]);
      html += `<li>${text}</li>\n`;
      continue;
    }

    // 6. Ordered Lists
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      closeBlockquote();
      if (inList !== 'ol') {
        closeList();
        html += '<ol>\n';
        inList = 'ol';
      }
      const text = parseInline(olMatch[2]);
      html += `<li>${text}</li>\n`;
      continue;
    }

    // 7. Empty line
    if (line.trim() === '') {
      closeList();
      closeBlockquote();
      continue;
    }

    // 8. Paragraph (default block element)
    closeList();
    closeBlockquote();
    
    let pText = line;
    while (i + 1 < lines.length && 
           lines[i+1].trim() !== '' && 
           !lines[i+1].trim().startsWith('```') &&
           !lines[i+1].trim().startsWith('>') &&
           !lines[i+1].match(/^(#{1,6})\s+/) &&
           !lines[i+1].match(/^([\*\-\+])\s+/) &&
           !lines[i+1].match(/^(\d+)\.\s+/) &&
           lines[i+1].trim() !== '---' &&
           lines[i+1].trim() !== '***') {
      i++;
      pText += ' ' + lines[i].trim();
    }
    html += `<p>${parseInline(pText)}</p>\n`;
  }

  closeList();
  closeBlockquote();

  return html;
}

// 3. Front-matter Extraction Function
function parseFrontMatter(fileContent) {
  const lines = fileContent.split(/\r?\n/);
  const metadata = {};
  let inFrontMatter = false;
  const fmLines = [];
  const bodyLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && line.trim() === '---') {
      inFrontMatter = true;
      continue;
    }
    if (inFrontMatter && line.trim() === '---') {
      inFrontMatter = false;
      continue;
    }

    if (inFrontMatter) {
      fmLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  fmLines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.substring(1, value.length - 1)
          .split(',')
          .map(v => v.trim())
          .filter(v => v.length > 0);
      } else {
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
      }
      metadata[key] = value;
    }
  });

  return {
    metadata,
    body: bodyLines.join('\n')
  };
}

// 4. Calculate Reading Time
function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

// Helper: Format Date beautifully
function formatPostDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// 5. Gather and Process Posts
const posts = [];
const sourceFiles = fs.readdirSync(postsSourceDir).filter(f => f.endsWith('.md'));

sourceFiles.forEach(file => {
  const filePath = path.join(postsSourceDir, file);
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const { metadata, body } = parseFrontMatter(rawContent);

  const slug = path.basename(file, '.md');
  const title = metadata.title || slug;
  const date = metadata.date || '';
  const description = metadata.description || '';
  const tags = metadata.tags || [];
  const readingTime = calculateReadingTime(body);
  const contentHTML = parseMarkdown(body);
  
  posts.push({
    slug,
    title,
    date,
    formattedDate: formatPostDate(date),
    description,
    tags,
    readingTime,
    contentHTML
  });
});

// Sort posts chronologically (newest first)
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// 6. Generate Individual Post HTML Pages
posts.forEach(post => {
  const tagsHTML = post.tags.map(t => `<span class="post-tag">${t}</span>`).join('');
  const descriptionHTML = post.description ? `<p class="post-description">${post.description}</p>` : '';
  const currentYear = new Date().getFullYear();

  const articleTemplate = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="pitch-black">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} | Ackerman's Journal</title>
    <meta name="description" content="${post.description}">
    
    <!-- Preload critical fonts for speed -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../assets/css/style.css">
    
    <!-- Instant inline theme selector (Zero FOUT) -->
    <script>
        (function() {
            const savedTheme = localStorage.getItem('blog-theme') || 'pitch-black';
            document.documentElement.setAttribute('data-theme', savedTheme);
        })();
    </script>
</head>
<body class="page-post">
    <div class="grain-overlay"></div>
    <div id="progress-bar" class="progress-bar"></div>

    <header class="site-header">
        <div class="header-container">
            <a href="../index.html" class="logo-link">
                <span class="logo-text">Ackerman</span>
            </a>
            <nav class="header-nav">
                <a href="../index.html" class="nav-item">Journal</a>
                <a href="../about.html" class="nav-item">About</a>
                <button id="theme-toggle" class="theme-toggle" aria-label="Toggle Theme">
                    <span class="toggle-icon"></span>
                </button>
            </nav>
        </div>
    </header>

    <main class="main-content article-layout">
        <article class="post-article">
            <header class="post-header">
                <div class="post-meta">
                    <time datetime="${post.date}">${post.formattedDate}</time>
                    <span class="meta-divider">•</span>
                    <span class="reading-time">${post.readingTime} min read</span>
                    <div class="post-tags-container">${tagsHTML}</div>
                </div>
                <h1 class="post-title">${post.title}</h1>
                ${descriptionHTML}
            </header>
            
            <section class="post-body markdown-body">
                ${post.contentHTML}
            </section>

            <footer class="post-footer">
                <a href="../index.html" class="back-link">
                    <span class="arrow">←</span> Return to Journal
                </a>
            </footer>
        </article>
    </main>

    <footer class="site-footer">
        <div class="footer-container">
            <p class="copyright">&copy; ${currentYear} Ackerman. All rights reserved.</p>
            <p class="powered-by">Built with zero-dependency static pages.</p>
        </div>
    </footer>

    <script src="../assets/js/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(postsOutputDir, `${post.slug}.html`), articleTemplate, 'utf8');
});

// 7. Generate Homepage (index.html) - Phase 4 chronological grouping logic
function generateIndexHTML(sortedPosts) {
  const currentYear = new Date().getFullYear();
  
  // Group posts by year
  const postsByYear = {};
  sortedPosts.forEach(post => {
    const year = post.date ? new Date(post.date).getFullYear() : 'Undated';
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });

  // Sort years descending
  const years = Object.keys(postsByYear).sort((a, b) => b - a);

  let rightColumnHTML = '';
  years.forEach(year => {
    rightColumnHTML += `<section class="year-section">
      <h2 class="year-title">${year}</h2>
      <div class="year-posts">`;
      
    postsByYear[year].forEach(post => {
      const tagsList = post.tags.map(t => `<span class="post-tag">${t}</span>`).join('');
      rightColumnHTML += `
        <article class="post-card">
          <div class="card-meta">
            <time datetime="${post.date}">${post.formattedDate}</time>
            <span class="meta-divider">•</span>
            <span class="reading-time">${post.readingTime} min read</span>
          </div>
          <h3 class="card-title">
            <a href="posts/${post.slug}.html" class="card-link">${post.title}</a>
          </h3>
          <p class="card-description">${post.description}</p>
          <div class="card-tags">${tagsList}</div>
        </article>`;
    });

    rightColumnHTML += `</div></section>`;
  });

  const indexHTML = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="pitch-black">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ackerman | 技术博客与学习记录</title>
    <meta name="description" content="Ackerman 的个人技术博客，记录计算机系统学习、C/C++、Python、RISC-V 和动手实践。">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="assets/css/style.css">
    
    <script>
        (function() {
            const savedTheme = localStorage.getItem('blog-theme') || 'pitch-black';
            document.documentElement.setAttribute('data-theme', savedTheme);
        })();
    </script>
</head>
<body class="page-home">
    <div class="grain-overlay"></div>

    <header class="site-header">
        <div class="header-container">
            <a href="index.html" class="logo-link">
                <span class="logo-text">Ackerman</span>
            </a>
            <nav class="header-nav">
                <a href="index.html" class="nav-item active">Journal</a>
                <a href="about.html" class="nav-item">About</a>
                <button id="theme-toggle" class="theme-toggle" aria-label="Toggle Theme">
                    <span class="toggle-icon"></span>
                </button>
            </nav>
        </div>
    </header>

    <main class="main-content home-layout">
        <!-- Left Column: Biography & Profiles -->
        <section class="left-column">
            <div class="bio-sticky">
                <div class="avatar-container">
                    <div class="avatar-fallback">A</div>
                </div>
                <h1 class="bio-name">Ackerman</h1>
                <p class="bio-role">Student & Tech Enthusiast</p>
                <p class="bio-description">
                    大一在校学生，正在学习计算机系统、C/C++、Python 与 RISC-V。这里记录我靠近底层、动手实验和整理想法的过程。
                </p>
                <div class="bio-links">
                    <a href="https://github.com/Ackerman617" target="_blank" rel="noopener noreferrer" class="bio-link-item">
                        <span class="link-icon">↗</span> GitHub
                    </a>
                    <a href="mailto:ackerman.development@gmail.com" class="bio-link-item">
                        <span class="link-icon">↗</span> Email
                    </a>
                    <a href="about.html" class="bio-link-item">
                        <span class="link-icon">↗</span> More About Me
                    </a>
                </div>
            </div>
        </section>

        <!-- Right Column: Chronological Articles -->
        <section class="right-column">
            ${rightColumnHTML || '<p class="no-posts">No articles published yet.</p>'}
        </section>
    </main>

    <footer class="site-footer">
        <div class="footer-container">
            <p class="copyright">&copy; ${currentYear} Ackerman. All rights reserved.</p>
            <p class="powered-by">Built with zero-dependency static pages.</p>
        </div>
    </footer>

    <script src="assets/js/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'index.html'), indexHTML, 'utf8');
}

generateIndexHTML(posts);

console.log(`Successfully compiled ${posts.length} articles!`);
