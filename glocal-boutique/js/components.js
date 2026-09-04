/* G'Local Boutique — Shared Components */

const Components = {
  renderHeader(basePath = '') {
    return `
    <header class="header">
      <div class="container">
        <a href="${basePath}index.html" class="logo">
          <img src="https://glocalboutique.com/wp-content/uploads/2021/04/GLOCAL-LOGO-138.png" alt="G'Local Boutique">
        </a>
        <nav class="nav-desktop">
          <div class="nav-dropdown">
            <a href="${basePath}negozio.html" class="nav-link">Shop</a>
            <div class="dropdown-menu">
              <a href="${basePath}categorie/bijoux-e-gioielli.html">Bijoux e Gioielli</a>
              <a href="${basePath}categorie/anelli.html">Anelli</a>
              <a href="${basePath}categorie/bracciali.html">Bracciali</a>
              <a href="${basePath}categorie/collane.html">Collane</a>
              <a href="${basePath}categorie/orecchini.html">Orecchini</a>
            </div>
          </div>
          <div class="nav-dropdown">
            <a href="${basePath}brand/index.html" class="nav-link">Brand</a>
            <div class="dropdown-menu">
              <a href="${basePath}brand/ayala-bar.html">Ayala Bar</a>
              <a href="${basePath}brand/claudio-canzian.html">Claudio Canzian</a>
              <a href="${basePath}brand/dori-csengeri.html">Dori Csengeri</a>
              <a href="${basePath}brand/glocal.html">G'Local</a>
              <a href="${basePath}brand/katerina-vassou.html">Katerina Vassou</a>
              <a href="${basePath}brand/nicolas-frangos.html">Nicolas Frangos</a>
              <a href="${basePath}brand/yvonne-christa.html">Yvonne Christa</a>
            </div>
          </div>
          <a href="${basePath}top-trend.html" class="nav-link">Top Trend</a>
          <a href="${basePath}contatti.html" class="nav-link">Contatti</a>
        </nav>
        <button class="nav-toggle" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
    <nav class="nav-mobile">
      <a href="${basePath}index.html">Home</a>
      <a href="${basePath}negozio.html">Shop</a>
      <a href="${basePath}categorie/anelli.html">Anelli</a>
      <a href="${basePath}categorie/bracciali.html">Bracciali</a>
      <a href="${basePath}categorie/collane.html">Collane</a>
      <a href="${basePath}categorie/orecchini.html">Orecchini</a>
      <a href="${basePath}brand/index.html">Brand</a>
      <a href="${basePath}top-trend.html">Top Trend</a>
      <a href="${basePath}contatti.html">Contatti</a>
    </nav>`;
  },

  renderFooter(basePath = '') {
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="https://glocalboutique.com/wp-content/uploads/2021/04/GLOCAL-LOGO-138.png" alt="G'Local Boutique" class="footer-logo">
            <p>Bijoux e gioielli d'autore nel cuore di Roma. Selezione esclusiva di designer internazionali.</p>
          </div>
          <div>
            <h5>Collezioni</h5>
            <ul class="footer-links">
              <li><a href="${basePath}categorie/anelli.html">Anelli</a></li>
              <li><a href="${basePath}categorie/bracciali.html">Bracciali</a></li>
              <li><a href="${basePath}categorie/collane.html">Collane</a></li>
              <li><a href="${basePath}categorie/orecchini.html">Orecchini</a></li>
            </ul>
          </div>
          <div>
            <h5>Brand</h5>
            <ul class="footer-links">
              <li><a href="${basePath}brand/ayala-bar.html">Ayala Bar</a></li>
              <li><a href="${basePath}brand/dori-csengeri.html">Dori Csengeri</a></li>
              <li><a href="${basePath}brand/katerina-vassou.html">Katerina Vassou</a></li>
              <li><a href="${basePath}brand/nicolas-frangos.html">Nicolas Frangos</a></li>
              <li><a href="${basePath}brand/yvonne-christa.html">Yvonne Christa</a></li>
            </ul>
          </div>
          <div>
            <h5>Info</h5>
            <ul class="footer-links">
              <li><a href="${basePath}negozio.html">Shop Online</a></li>
              <li><a href="${basePath}top-trend.html">Top Trend</a></li>
              <li><a href="${basePath}contatti.html">Contatti</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} G'Local Boutique. Tutti i diritti riservati.</span>
          <span>Piazza in Campo Marzio, 8 — 00186 Roma</span>
        </div>
      </div>
    </footer>`;
  },

  inject(basePath = '') {
    const headerSlot = document.getElementById('header-slot');
    const footerSlot = document.getElementById('footer-slot');
    if (headerSlot) headerSlot.innerHTML = this.renderHeader(basePath);
    if (footerSlot) footerSlot.innerHTML = this.renderFooter(basePath);
  }
};
