// =====================================================
//  Rising Capital Dashboard — main.js
//  Loads posts.json, renders hero + archive, handles
//  expand/collapse on archive cards.
// =====================================================

// === LIVE DATA INTEGRATION (TODO) ===
// Phase 2 indicators to wire up:
// - ETF flows: SoSoValue API
// - Funding rate + OI: CoinGlass API or Hyperliquid public endpoint
// - On-chain: Glassnode API (LTH ratio, MVRV, SOPR)
// - Exchange netflow + spot CVD: CoinGlass or custom aggregator
// Each indicator card in the UI has id="indicator-{name}" for easy targeting

const CHARTS_BASE = "assets/charts/";
const DATA_URL    = "data/posts.json";

// ── Helpers ──────────────────────────────────────────

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("zh-CN", {
    year:  "numeric",
    month: "long",
    day:   "numeric"
  });
}

// Maps verdict string → level 1–5
function verdictLevel(verdict) {
  const map = {
    "极度看空": 1,
    "偏空":    2,
    "中性":    3,
    "偏多":    4,
    "极度看多": 5,
    // legacy color keys
    "red":     2,
    "neutral": 3,
    "green":   4,
    "very_bearish": 1,
    "very_bullish": 5
  };
  return map[verdict] || map[verdict] || 3;
}

// Build the 5-segment meter HTML
function verdictMeter(verdict) {
  const level = verdictLevel(verdict);
  const segs = [1, 2, 3, 4, 5].map(i =>
    `<div class="meter-seg${i <= level ? ' lvl-' + level : ''}"></div>`
  ).join("");
  return `
    <div class="verdict-meter">
      <div class="meter-bar">${segs}</div>
      <div class="meter-label lvl-${level}">${verdict}</div>
    </div>`;
}

// Small badge for archive cards
function verdictClass(verdict) {
  const level = verdictLevel(verdict);
  const map = { 1: "verdict-very-bearish", 2: "verdict-red", 3: "verdict-neutral", 4: "verdict-green", 5: "verdict-very-bullish" };
  return map[level] || "verdict-neutral";
}

function chartImgOrPlaceholder(filename, cssClass = "") {
  const src = CHARTS_BASE + filename;
  return `
    <div class="chart-img-wrap ${cssClass}">
      <img
        src="${src}"
        alt="${filename}"
        onerror="this.closest('.chart-img-wrap').innerHTML = chartPlaceholderHTML()"
        loading="lazy"
      />
    </div>`;
}

// Called by onerror on broken img tags (defined globally so inline handler can reach it)
window.chartPlaceholderHTML = function() {
  return `
    <div class="chart-placeholder">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
      <span>图表待上传</span>
    </div>`;
};

function indicatorPills(indicators, heroMode = false) {
  if (!indicators) return "";
  const fields = [
    // <!-- TODO: replace with live API -->
    { key: "btc_price",    label: "BTC",    id: "indicator-btc-price"    },
    // <!-- TODO: replace with live API -->
    { key: "funding_rate", label: "资金费率", id: "indicator-funding-rate" },
    // <!-- TODO: replace with live API -->
    { key: "etf_flow",     label: "ETF净流",  id: "indicator-etf-flow"     },
    // <!-- TODO: replace with live API -->
    { key: "oi",           label: "OI",     id: "indicator-oi"           }
  ];
  return fields.map(f => {
    const val = indicators[f.key];
    if (!val) return "";
    return `
      <div class="indicator-pill" id="${heroMode ? f.id : ""}">
        <span class="pill-label">${f.label}</span>
        <span class="pill-value">${val}</span>
      </div>`;
  }).join("");
}

// ── Hero Card ─────────────────────────────────────────

function renderHero(post) {
  const chartsCount = post.charts ? post.charts.length : 0;
  const gridClass = chartsCount === 1 ? "charts-1" : chartsCount === 2 ? "charts-2" : "charts-many";

  const chartsHTML = (post.charts || []).map(c => `
    <div class="chart-item">
      ${chartImgOrPlaceholder(c.filename)}
      <div>
        <div class="chart-caption">${c.caption || ""}</div>
        <div class="chart-source">${c.source || ""}</div>
      </div>
    </div>
  `).join("");

  const bulletsHTML = (post.bullets || []).map(b =>
    `<li>${b}</li>`
  ).join("");

  return `
    <div class="hero-card">
      <div class="hero-card-inner">
        <div class="hero-left">
          <div class="hero-meta">
            <span class="hero-date">${formatDate(post.date)}</span>
            ${verdictMeter(post.verdict)}
          </div>
          <div class="hero-title">${post.title}</div>
          <ul class="hero-bullets">
            ${bulletsHTML}
          </ul>
          <div class="indicators-strip">
            ${indicatorPills(post.indicators, true)}
          </div>
        </div>
        <div class="hero-right">
          <div class="charts-grid ${gridClass}">
            ${chartsHTML}
          </div>
        </div>
      </div>
    </div>`;
}

// ── Archive Card ──────────────────────────────────────

function renderArchiveCard(post) {
  const previewBullets = (post.bullets || []).slice(0, 2).join("　·　");
  const firstChart = post.charts && post.charts[0] ? post.charts[0] : null;

  const thumbSrc = firstChart ? CHARTS_BASE + firstChart.filename : "";
  const thumbHTML = thumbSrc
    ? `<img src="${thumbSrc}" alt="" loading="lazy"/>`
    : `<div class="archive-thumb-placeholder">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
      </div>`;

  const chartsCount = post.charts ? post.charts.length : 0;
  const archiveGridClass = chartsCount === 1 ? "charts-1" : "";
  const allChartsHTML = (post.charts || []).map(c => `
    <div class="archive-chart-item">
      <div class="archive-chart-img">
        <img src="${CHARTS_BASE + c.filename}" alt=""
          onerror="this.style.opacity='0'"
          loading="lazy"/>
      </div>
      <div class="chart-caption">${c.caption || ""}</div>
      <div class="chart-source">${c.source || ""}</div>
    </div>
  `).join("");

  const allBulletsHTML = (post.bullets || []).map(b => `<li>${b}</li>`).join("");

  return `
    <div class="archive-card" data-id="${post.id}">
      <div class="archive-card-header" onclick="toggleArchiveCard(this.closest('.archive-card'))">
        <div class="archive-thumb">${thumbHTML}</div>
        <div class="archive-meta">
          <div class="archive-top">
            <span class="archive-date">${formatDate(post.date)}</span>
            <span class="verdict-badge ${verdictClass(post.verdict)}">${post.verdict}</span>
          </div>
          <div class="archive-bullets-preview">${previewBullets}</div>
        </div>
        <svg class="archive-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
      <div class="archive-card-body">
        <div class="archive-body-left">
          <ul>${allBulletsHTML}</ul>
          <div class="archive-indicators">
            ${indicatorPills(post.indicators, false)}
          </div>
        </div>
        <div class="archive-body-right">
          <div class="archive-charts-grid ${archiveGridClass}">
            ${allChartsHTML}
          </div>
        </div>
      </div>
    </div>`;
}

// ── Toggle expand ─────────────────────────────────────

window.toggleArchiveCard = function(card) {
  card.classList.toggle("expanded");
};

// ── Main render ───────────────────────────────────────

async function init() {
  const heroEl   = document.getElementById("hero-section");
  const archiveEl = document.getElementById("archive-section");
  const footerDateEl = document.getElementById("footer-last-updated");

  try {
    const res = await fetch(DATA_URL + "?v=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    const posts = await res.json();

    if (!posts || posts.length === 0) {
      heroEl.innerHTML = `<div class="empty-state"><h3>暂无数据</h3><p>请通过管理页面添加日报</p></div>`;
      return;
    }

    // Sort descending by date
    posts.sort((a, b) => b.date.localeCompare(a.date));

    const latest = posts[0];
    const archive = posts.slice(1);

    heroEl.innerHTML = renderHero(latest);

    if (archive.length > 0) {
      archiveEl.innerHTML = archive.map(renderArchiveCard).join("");
    } else {
      archiveEl.innerHTML = `<div class="empty-state" style="padding:24px 0;color:var(--grey-text);font-size:13px;">暂无历史记录</div>`;
    }

    if (footerDateEl) {
      footerDateEl.textContent = formatDate(latest.date);
    }

  } catch (err) {
    console.error("Failed to load posts:", err);
    heroEl.innerHTML = `
      <div class="empty-state">
        <h3>数据加载失败</h3>
        <p style="font-size:13px;margin-top:6px;">请检查 data/posts.json 是否存在</p>
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", init);
