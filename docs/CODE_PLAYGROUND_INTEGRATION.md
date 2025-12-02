# Cara Mengintegrasikan CodePlayground ke Artikel

Panduan lengkap untuk menambahkan interactive code playground ke artikel blog/tutorial yang sudah ada.

## 1. Import Component

Tambahkan import di bagian frontmatter artikel Astro:

```astro
---
import Layout from '../layouts/Layout.astro';
import CodePlayground from '../components/CodePlayground.astro';
import Prose from '../components/Prose.astro';
---
```

## 2. Gunakan dalam Artikel

### Contoh 1: Artikel tentang CSS Flexbox

```astro
---
import Layout from '../layouts/Layout.astro';
import CodePlayground from '../components/CodePlayground.astro';
import Prose from '../components/Prose.astro';
---

<Layout title="Belajar CSS Flexbox">
  <Prose>
    <h1>Memahami CSS Flexbox</h1>
    
    <p>
      Flexbox adalah layout model yang powerful untuk membuat layout responsive.
      Mari kita lihat contoh sederhana:
    </p>

    <CodePlayground
      title="Flexbox Basic Example"
      html={`<div class="container">
  <div class="box">Box 1</div>
  <div class="box">Box 2</div>
  <div class="box">Box 3</div>
</div>`}
      css={`.container {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f0f0f0;
}

.box {
  flex: 1;
  padding: 2rem;
  background: #4ecdc4;
  color: white;
  text-align: center;
  border-radius: 8px;
}`}
      height="400px"
    />

    <p>
      Coba ubah <code>flex-direction</code> menjadi <code>column</code> 
      di CSS editor untuk melihat perbedaannya!
    </p>
  </Prose>
</Layout>
```

### Contoh 2: Artikel tentang JavaScript Events

```astro
---
import Layout from '../layouts/Layout.astro';
import CodePlayground from '../components/CodePlayground.astro';
import Prose from '../components/Prose.astro';
---

<Layout title="JavaScript Event Handling">
  <Prose>
    <h1>Mengenal JavaScript Events</h1>
    
    <h2>Click Event</h2>
    <p>
      Event paling dasar adalah click event. Mari kita buat button yang 
      merespon klik:
    </p>

    <CodePlayground
      title="Click Event Example"
      html={`<button id="myButton">Click Me!</button>
<p id="output">Clicks: 0</p>`}
      css={`button {
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

button:hover {
  background: #764ba2;
  transform: scale(1.05);
}

#output {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}`}
      js={`let clicks = 0;
const button = document.getElementById('myButton');
const output = document.getElementById('output');

button.addEventListener('click', () => {
  clicks++;
  output.textContent = 'Clicks: ' + clicks;
  
  // Change button text
  if (clicks === 1) {
    button.textContent = 'Click Again!';
  } else if (clicks >= 5) {
    button.textContent = 'You love clicking! 🎉';
  }
});`}
      defaultTab="js"
      height="500px"
    />

    <h2>Input Event</h2>
    <p>
      Input event berguna untuk real-time validation atau search:
    </p>

    <CodePlayground
      title="Input Event Example"
      html={`<input type="text" id="search" placeholder="Type something...">
<p id="result"></p>`}
      css={`input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1rem;
}

input:focus {
  outline: none;
  border-color: #4ecdc4;
}

#result {
  color: #666;
  font-style: italic;
}`}
      js={`const input = document.getElementById('search');
const result = document.getElementById('result');

input.addEventListener('input', (e) => {
  const value = e.target.value;
  
  if (value.length === 0) {
    result.textContent = 'Start typing...';
  } else {
    result.textContent = 'You typed: "' + value + '" (' + value.length + ' characters)';
  }
});`}
      defaultTab="js"
      height="450px"
    />
  </Prose>
</Layout>
```

### Contoh 3: Artikel tentang Responsive Design

```astro
---
import Layout from '../layouts/Layout.astro';
import CodePlayground from '../components/CodePlayground.astro';
import Prose from '../components/Prose.astro';
---

<Layout title="Responsive Web Design">
  <Prose>
    <h1>Membuat Layout Responsive</h1>
    
    <p>
      Media queries memungkinkan kita membuat design yang adaptif terhadap 
      ukuran layar. Coba resize preview panel untuk melihat efeknya:
    </p>

    <CodePlayground
      title="Responsive Grid Layout"
      html={`<div class="grid">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
  <div class="card">Card 5</div>
  <div class="card">Card 6</div>
</div>`}
      css={`.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  font-weight: bold;
}

/* Tablet */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 480px) {
  .grid {
    grid-template-columns: 1fr;
  }
}`}
      defaultTab="css"
      height="600px"
    />
  </Prose>
</Layout>
```

## 3. Best Practices

### Gunakan Judul yang Deskriptif
```astro
<!-- ❌ Bad -->
<CodePlayground title="Example" ... />

<!-- ✅ Good -->
<CodePlayground title="Flexbox Center Alignment" ... />
```

### Sesuaikan Default Tab
```astro
<!-- Jika fokus pada CSS -->
<CodePlayground defaultTab="css" ... />

<!-- Jika fokus pada JavaScript -->
<CodePlayground defaultTab="js" ... />
```

### Atur Tinggi yang Sesuai
```astro
<!-- Simple example -->
<CodePlayground height="400px" ... />

<!-- Complex example dengan banyak kode -->
<CodePlayground height="700px" ... />
```

### Tambahkan Penjelasan
```astro
<p>
  Perhatikan bagaimana kita menggunakan <code>addEventListener</code> 
  untuk menangani event. Coba ubah event type dari <code>'click'</code> 
  menjadi <code>'dblclick'</code> untuk double-click!
</p>

<CodePlayground ... />

<p>
  <strong>Tips:</strong> Kamu juga bisa menggunakan inline event handlers 
  seperti <code>onclick</code>, tapi addEventListener lebih flexible.
</p>
```

## 4. Tips untuk Kode yang Panjang

### Gunakan Template Literals
```astro
---
const htmlCode = `
<div class="app">
  <header>
    <h1>My App</h1>
  </header>
  <main>
    <p>Content here</p>
  </main>
  <footer>
    <p>Footer</p>
  </footer>
</div>
`;

const cssCode = `
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header, footer {
  background: #333;
  color: white;
  padding: 1rem;
}

main {
  flex: 1;
  padding: 2rem;
}
`;
---

<CodePlayground
  title="App Layout"
  html={htmlCode}
  css={cssCode}
  height="600px"
/>
```

### Pisahkan ke File Terpisah (untuk kode yang sangat panjang)
```astro
---
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlCode = readFileSync(join(__dirname, '../examples/app.html'), 'utf-8');
const cssCode = readFileSync(join(__dirname, '../examples/app.css'), 'utf-8');
const jsCode = readFileSync(join(__dirname, '../examples/app.js'), 'utf-8');
---

<CodePlayground
  title="Complete App"
  html={htmlCode}
  css={cssCode}
  js={jsCode}
  height="800px"
/>
```

## 5. Kombinasi dengan Komponen Lain

### Dengan TableOfContents
```astro
<Layout title="Tutorial">
  <div class="article-layout">
    <aside>
      <TableOfContents />
    </aside>
    
    <main>
      <Prose>
        <h2 id="section-1">Section 1</h2>
        <p>Introduction...</p>
        
        <CodePlayground ... />
        
        <h2 id="section-2">Section 2</h2>
        <p>Next topic...</p>
        
        <CodePlayground ... />
      </Prose>
    </main>
  </div>
</Layout>
```

### Dengan ShareActions
```astro
<Layout title="Tutorial">
  <article>
    <header>
      <h1>Tutorial Title</h1>
      <ShareActions />
    </header>
    
    <Prose>
      <CodePlayground ... />
    </Prose>
  </article>
</Layout>
```

## 6. Accessibility

### Tambahkan Label yang Jelas
```astro
<section aria-labelledby="example-1">
  <h3 id="example-1">Example 1: Basic Counter</h3>
  <p>This example demonstrates...</p>
  
  <CodePlayground
    title="Basic Counter"
    ...
  />
</section>
```

### Keyboard Navigation
Playground sudah support keyboard navigation:
- `Tab` untuk navigasi antar tombol
- `Enter` untuk klik tombol
- `Ctrl+A` untuk select all di editor

## 7. SEO Optimization

### Tambahkan Meta Description
```astro
<Layout 
  title="Tutorial: CSS Grid Layout"
  description="Belajar CSS Grid dengan contoh interaktif. Tutorial lengkap dengan live code playground."
>
  ...
</Layout>
```

### Gunakan Heading Structure yang Benar
```astro
<h1>Tutorial Title</h1>

<h2>Section 1: Introduction</h2>
<p>...</p>
<CodePlayground ... />

<h2>Section 2: Advanced</h2>
<p>...</p>
<CodePlayground ... />

<h2>Conclusion</h2>
```

## 8. Performance Tips

### Lazy Load untuk Banyak Playground
Jika artikel memiliki banyak playground, pertimbangkan lazy loading:

```astro
<div class="playground-wrapper" data-lazy-playground>
  <CodePlayground ... />
</div>

<script>
  // Lazy load playgrounds saat scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('loaded');
        observer.unobserve(entry.target);
      }
    });
  });

  document.querySelectorAll('[data-lazy-playground]').forEach(el => {
    observer.observe(el);
  });
</script>
```

### Batasi Tinggi untuk Performance
```astro
<!-- Untuk artikel dengan banyak playground -->
<CodePlayground height="500px" ... />

<!-- Hindari tinggi yang terlalu besar -->
<!-- <CodePlayground height="1200px" ... /> ❌ -->
```

## 9. Testing Checklist

Sebelum publish artikel dengan CodePlayground, pastikan:

- [ ] Semua kode berjalan tanpa error
- [ ] Preview menampilkan hasil yang benar
- [ ] Tab switching berfungsi
- [ ] Copy button bekerja
- [ ] Reset button mengembalikan kode awal
- [ ] Responsive di mobile
- [ ] Tidak ada console errors
- [ ] Kode mudah dibaca dan dipahami

## 10. Contoh Artikel Lengkap

Lihat contoh implementasi lengkap di:
- `/src/pages/tutorial-todo-list.astro` - Tutorial step-by-step
- `/src/pages/playground-demo.astro` - Multiple examples

---

**Happy coding! 🚀**
