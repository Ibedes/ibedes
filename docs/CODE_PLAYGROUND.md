# Code Playground Component

Komponen interaktif untuk menampilkan dan menjalankan kode langsung di dalam artikel.

## Fitur

✨ **Editor Multi-Tab** - Support HTML, CSS, dan JavaScript
🎨 **Live Preview** - Lihat hasil kode secara real-time
▶️ **Run Button** - Jalankan kode dengan satu klik
🔄 **Reset Button** - Kembalikan ke kode awal
📋 **Copy Button** - Salin kode ke clipboard
🎯 **Syntax Highlighting** - Editor dengan monospace font
📱 **Responsive** - Tampilan optimal di desktop dan mobile
🔒 **Sandboxed** - Kode berjalan di iframe yang aman

## Cara Penggunaan

### Import Component

```astro
---
import CodePlayground from '../components/CodePlayground.astro';
---
```

### Basic Usage

```astro
<CodePlayground
  title="Simple Example"
  html={`<h1>Hello World</h1>`}
  css={`h1 { color: blue; }`}
  js={`console.log('Hello!');`}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Code Playground'` | Judul playground |
| `html` | `string` | `''` | Kode HTML awal |
| `css` | `string` | `''` | Kode CSS awal |
| `js` | `string` | `''` | Kode JavaScript awal |
| `height` | `string` | `'500px'` | Tinggi playground |
| `defaultTab` | `'html' \| 'css' \| 'js'` | `'html'` | Tab yang aktif saat load |
| `showPreview` | `boolean` | `true` | Tampilkan panel preview |

## Contoh Penggunaan

### 1. HTML & CSS Card

```astro
<CodePlayground
  title="Card Component"
  html={`<div class="card">
  <h2>Card Title</h2>
  <p>Card content goes here</p>
</div>`}
  css={`.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card h2 {
  margin-top: 0;
  color: #333;
}

.card p {
  color: #666;
}`}
  height="400px"
/>
```

### 2. Interactive JavaScript

```astro
<CodePlayground
  title="Click Counter"
  html={`<button id="btn">Click me!</button>
<p>Clicks: <span id="count">0</span></p>`}
  css={`button {
  padding: 1rem 2rem;
  background: #4ecdc4;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}`}
  js={`let count = 0;
const btn = document.getElementById('btn');
const countEl = document.getElementById('count');

btn.addEventListener('click', () => {
  count++;
  countEl.textContent = count;
});`}
  defaultTab="js"
  height="500px"
/>
```

### 3. CSS Animation

```astro
<CodePlayground
  title="Loading Spinner"
  html={`<div class="spinner"></div>`}
  css={`.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`}
  defaultTab="css"
  height="400px"
/>
```

### 4. Form Validation

```astro
<CodePlayground
  title="Email Validator"
  html={`<input type="email" id="email" placeholder="Enter email">
<button id="validate">Validate</button>
<p id="result"></p>`}
  css={`input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input.valid {
  border-color: #4ecdc4;
}

input.invalid {
  border-color: #ff6b6b;
}

button {
  padding: 0.75rem 1.5rem;
  background: #4ecdc4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#result {
  margin-top: 1rem;
  font-weight: 600;
}`}
  js={`const emailInput = document.getElementById('email');
const validateBtn = document.getElementById('validate');
const result = document.getElementById('result');

validateBtn.addEventListener('click', () => {
  const email = emailInput.value;
  const isValid = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  
  if (isValid) {
    emailInput.classList.add('valid');
    emailInput.classList.remove('invalid');
    result.textContent = '✓ Valid email!';
    result.style.color = '#4ecdc4';
  } else {
    emailInput.classList.add('invalid');
    emailInput.classList.remove('valid');
    result.textContent = '✗ Invalid email!';
    result.style.color = '#ff6b6b';
  }
});`}
  height="600px"
/>
```

### 5. Only Editor (No Preview)

```astro
<CodePlayground
  title="Code Snippet"
  html={`<div class="example">
  <!-- Your code here -->
</div>`}
  showPreview={false}
  height="300px"
/>
```

## Tips & Best Practices

### 1. Escape Backticks in JS
Jika kode JavaScript menggunakan template literals, escape backtick dengan backslash:

```astro
js={`const message = \`Hello \${name}\`;`}
```

### 2. Multi-line Code
Gunakan template literals untuk kode multi-line yang lebih rapi:

```astro
html={`
<div class="container">
  <h1>Title</h1>
  <p>Paragraph</p>
</div>
`}
```

### 3. Responsive Height
Sesuaikan tinggi berdasarkan kompleksitas kode:

```astro
<!-- Simple example -->
<CodePlayground height="400px" ... />

<!-- Complex example -->
<CodePlayground height="700px" ... />
```

### 4. Default Tab
Set tab default sesuai fokus pembelajaran:

```astro
<!-- Fokus pada CSS -->
<CodePlayground defaultTab="css" ... />

<!-- Fokus pada JavaScript -->
<CodePlayground defaultTab="js" ... />
```

### 5. Error Handling
JavaScript errors akan ditampilkan di preview panel dengan styling merah.

## Styling & Customization

### CSS Variables
Komponen menggunakan CSS variables yang bisa di-override:

```css
.code-playground {
  --playground-height: 500px; /* Default height */
}
```

### Custom Styling
Tambahkan class custom untuk styling tambahan:

```astro
<div class="my-custom-playground">
  <CodePlayground ... />
</div>

<style>
  .my-custom-playground :global(.code-playground) {
    border-color: blue;
  }
</style>
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Security

- Kode berjalan di **sandboxed iframe**
- Tidak ada akses ke parent window
- Tidak ada akses ke cookies/localStorage parent
- Aman untuk user-generated content

## Performance

- Auto-run on load (dapat di-disable)
- Efficient re-rendering
- Minimal DOM manipulation
- Lightweight (~5KB gzipped)

## Troubleshooting

### Preview tidak muncul
- Pastikan `showPreview={true}`
- Check browser console untuk errors

### Kode tidak berjalan
- Click tombol "Run" manual
- Check JavaScript syntax errors
- Lihat error message di preview panel

### Tab tidak switch
- Pastikan JavaScript enabled
- Check browser console

## Contoh Live

Lihat contoh lengkap di: `/playground-demo`

## Changelog

### v1.0.0 (2025-12-01)
- ✨ Initial release
- ✨ Multi-tab editor (HTML, CSS, JS)
- ✨ Live preview
- ✨ Run, Reset, Copy buttons
- ✨ Responsive design
- ✨ Error handling
