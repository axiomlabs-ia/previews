/* G'Local Boutique — Store Engine */

const Store = {
  priceMin: 0,
  priceMax: 1000,
  currentSub: 'all',
  currentSort: 'newest',

  init(category, options = {}) {
    this.category = category;
    this.options = options;
    this.filteredProducts = this.getProducts();
    this.renderPriceFilter();
    if (options.subcategories) this.renderSubFilter(options.subcategories);
    this.renderSort();
    this.renderProducts();
    this.renderCount();
  },

  getProducts() {
    let items = PRODUCTS;
    if (this.category && this.category !== 'all') {
      items = items.filter(p => p.cat === this.category);
    }
    return items;
  },

  applyFilters() {
    let items = this.getProducts();

    // Price filter
    items = items.filter(p => p.price >= this.priceMin && p.price <= this.priceMax);

    // Subcategory filter
    if (this.currentSub !== 'all') {
      items = items.filter(p => p.sub.includes(this.currentSub));
    }

    // Sort
    switch (this.currentSort) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        items.sort((a, b) => b.id - a.id);
    }

    this.filteredProducts = items;
    this.renderProducts();
    this.renderCount();
  },

  renderPriceFilter() {
    const container = document.getElementById('price-filter');
    if (!container) return;

    const prices = this.getProducts().map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    this.priceMin = min;
    this.priceMax = max;

    container.innerHTML = `
      <h4 class="filter-title">Filtra per prezzo</h4>
      <div class="price-range">
        <input type="range" id="price-min" min="${min}" max="${max}" value="${min}" step="10">
        <input type="range" id="price-max" min="${min}" max="${max}" value="${max}" step="10">
      </div>
      <div class="price-values">
        <span id="price-min-val">${this.formatPrice(min)}</span>
        <span id="price-max-val">${this.formatPrice(max)}</span>
      </div>
    `;

    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');

    const update = () => {
      this.priceMin = parseInt(minInput.value);
      this.priceMax = parseInt(maxInput.value);
      if (this.priceMin > this.priceMax) {
        [minInput.value, maxInput.value] = [maxInput.value, minInput.value];
        this.priceMin = parseInt(minInput.value);
        this.priceMax = parseInt(maxInput.value);
      }
      document.getElementById('price-min-val').textContent = this.formatPrice(this.priceMin);
      document.getElementById('price-max-val').textContent = this.formatPrice(this.priceMax);
      this.applyFilters();
    };

    minInput.addEventListener('input', update);
    maxInput.addEventListener('input', update);
  },

  renderSubFilter(subcategories) {
    const container = document.getElementById('sub-filter');
    if (!container || !subcategories) return;

    let html = '<h4 class="filter-title">Filtra per categoria</h4><div class="sub-buttons">';
    html += '<button class="sub-btn active" data-sub="all">Tutti</button>';
    for (const [key, label] of Object.entries(subcategories)) {
      html += `<button class="sub-btn" data-sub="${key}">${label}</button>`;
    }
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.sub-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentSub = btn.dataset.sub;
        this.applyFilters();
      });
    });
  },

  renderSort() {
    const container = document.getElementById('sort-control');
    if (!container) return;

    container.innerHTML = `
      <select id="sort-select" class="sort-select">
        <option value="newest">Ultimi arrivi</option>
        <option value="price-asc">Prezzo: crescente</option>
        <option value="price-desc">Prezzo: decrescente</option>
      </select>
    `;

    document.getElementById('sort-select').addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.applyFilters();
    });
  },

  renderCount() {
    const el = document.getElementById('product-count');
    if (el) {
      const count = this.filteredProducts.length;
      el.textContent = `${count} prodott${count === 1 ? 'o' : 'i'}`;
    }
  },

  renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = '<div class="no-products"><p>Nessun prodotto trovato con i filtri selezionati.</p></div>';
      return;
    }

    // Detect basePath: if we're in a subdirectory, prefix with ../
    const inSubdir = window.location.pathname.includes('/categorie/') || window.location.pathname.includes('/brand/');
    const base = inSubdir ? '../' : '';

    grid.innerHTML = this.filteredProducts.map(p => `
      <div class="product-card">
        <a href="${base}prodotto.html?id=${p.id}" class="product-link">
          <div class="product-image">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
          </div>
          <div class="product-info">
            <h3 class="product-name">${p.name}</h3>
            <span class="product-price">${this.formatPrice(p.price)}</span>
          </div>
        </a>
        <a href="${base}prodotto.html?id=${p.id}" class="add-to-cart">
          Vedi Prodotto
        </a>
      </div>
    `).join('');
  },

  formatPrice(n) {
    return n.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + '\u00A0\u20AC';
  }
};
