// =====================================================
//  HTX Research Dashboard — main.js  (v2)
//  v1: posts.json feed, hero card, archive, lightbox
//  v2: live ticker bar, tab navigation, market banner,
//      key metrics snapshot
// =====================================================

const CHARTS_BASE = "assets/charts/";
const DATA_URL    = "data/posts.json";

// ══════════════════════════════════════════════════════
//  V2 — LIVE TICKER BAR
// ══════════════════════════════════════════════════════

// CORS note: Binance REST API works fine from browsers over HTTPS, including
// GitHub Pages. If it fails (network block, rate limit), we silently fall back
// to CoinGecko's free /simple/price endpoint which has no CORS restriction.

async function fetchBTCPrice() {
  // Primary: Binance
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
    if (!res.ok) throw new Error("binance " + res.status);
    const d = await res.json();
    return {
      price:     parseFloat(d.lastPrice),
      change_pct: parseFloat(d.priceChangePercent)
    };
  } catch (_) {}

  // Fallback: CoinGecko (no API key needed, no CORS restriction)
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
    );
    if (!res.ok) throw new Error("coingecko " + res.status);
    const d = await res.json();
    return {
      price:      d.bitcoin.usd,
      change_pct: d.bitcoin.usd_24h_change
    };
  } catch (_) {}

  return null; // both failed
}

async function fetchFearGreed() {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1");
    if (!res.ok) throw new Error("fng " + res.status);
    const d = await res.json();
    const entry = d.data[0];
    return {
      value:           parseInt(entry.value),
      classification:  entry.value_classification
    };
  } catch (_) {
    return null;
  }
}

async function fetchETFData() {
  try {
    const res = await fetch("data/etf.json?v=" + Date.now());
    if (!res.ok) throw new Error("etf " + res.status);
    return await res.json();
  } catch (_) {
    return null;
  }
}

function fngClass(value) {
  if (value <= 24) return "fng-extreme-fear";
  if (value <= 49) return "fng-fear";
  if (value <= 74) return "fng-greed";
  return "fng-extreme-greed";
}

function fngLabel(classification) {
  // Map English to Chinese
  const map = {
    "Extreme Fear": "极度恐惧",
    "Fear":         "恐惧",
    "Neutral":      "中性",
    "Greed":        "贪婪",
    "Extreme Greed":"极度贪婪"
  };
  return map[classification] || classification;
}

function renderBTCTicker(data) {
  const el = document.getElementById("ticker-btc");
  if (!el) return;
  if (!data) {
    el.innerHTML = `<span class="t-label">BTC</span> <span class="t-value">-- --</span>`;
    return;
  }
  const price  = "$" + data.price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const chg    = data.change_pct;
  const dir    = chg >= 0 ? "up" : "down";
  const arrow  = chg >= 0 ? "↑" : "↓";
  const cls    = chg >= 0 ? "t-up" : "t-down";
  el.innerHTML = `
    <span class="t-label">BTC</span>
    <span class="t-value">${price}</span>
    <span class="t-change ${cls}">${arrow}${Math.abs(chg).toFixed(2)}%</span>`;
}

function renderFNGTicker(data) {
  const el = document.getElementById("ticker-fng");
  if (!el) return;
  if (!data) {
    el.innerHTML = `<span class="t-label">恐惧贪婪指数</span> <span class="t-value">-- --</span>`;
    return;
  }
  const cls  = fngClass(data.value);
  const label = fngLabel(data.classification);
  el.innerHTML = `
    <span class="t-label">恐惧贪婪指数</span>
    <span class="t-value ${cls}">${data.value} · ${label}</span>`;
}

function renderETFTicker(data) {
  const el = document.getElementById("ticker-etf");
  if (!el) return;
  if (!data) {
    el.innerHTML = `<span class="t-label">ETF净流入</span> <span class="t-value">-- --</span>`;
    return;
  }
  const flow = data.net_flow_usd_million;
  const cls  = flow > 0 ? "t-up" : flow < 0 ? "t-down" : "t-neut";
  const dateStr = data.date ? data.date.slice(5) : "";
  el.innerHTML = `
    <span class="t-label">ETF净流入</span>
    <span class="t-value ${cls}">${data.label} · ${dateStr}</span>
    <span class="ticker-manual-tag">手动</span>`;
}

async function initTicker() {
  // Fetch all three in parallel
  const [btc, fng, etf] = await Promise.all([
    fetchBTCPrice(),
    fetchFearGreed(),
    fetchETFData()
  ]);

  renderBTCTicker(btc);
  renderFNGTicker(fng);
  renderETFTicker(etf);

  // Auto-refresh: BTC every 30s, F&G every 5min
  setInterval(async () => {
    renderBTCTicker(await fetchBTCPrice());
  }, 30_000);

  setInterval(async () => {
    renderFNGTicker(await fetchFearGreed());
  }, 300_000);
}

// ══════════════════════════════════════════════════════
//  V2 — TAB NAVIGATION
// ══════════════════════════════════════════════════════

function initTabs() {
  const tabs   = document.querySelectorAll(".header-tab-btn");
  const panels = document.querySelectorAll(".page-panel");

  function activate(targetPage) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.page === targetPage));
    panels.forEach(p => p.classList.toggle("active", p.dataset.page === targetPage));
  }

  function goHome() {
    // Deactivate all tabs, show summary
    tabs.forEach(t => t.classList.remove("active"));
    panels.forEach(p => p.classList.toggle("active", p.dataset.page === "summary"));
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => activate(tab.dataset.page));
  });

  // Logo always returns to summary/home
  const logo = document.getElementById("logo-home");
  if (logo) logo.addEventListener("click", e => { e.preventDefault(); goHome(); });

  // Default: show summary page, no tab active
  goHome();
}

// ══════════════════════════════════════════════════════
//  V2 — MARKET BANNER + METRICS SNAPSHOT
// ══════════════════════════════════════════════════════

async function initSummaryExtras() {
  await Promise.all([loadMarketBanner(), loadMetricsGrid()]);
}

async function loadMarketBanner() {
  const el = document.getElementById("market-banner");
  if (!el) return;
  try {
    const res = await fetch("data/market_brief.json?v=" + Date.now());
    if (!res.ok) throw new Error();
    const d = await res.json();

    const stanceClass = {
      "偏多": "stance-bull", "极度看多": "stance-bull",
      "偏空": "stance-bear", "极度看空": "stance-bear",
      "中性": "stance-neutral",
      "bull": "stance-bull", "bear": "stance-bear", "neutral": "stance-neutral"
    }[d.stance_color || d.stance] || "stance-neutral";

    el.innerHTML = `
      <div class="banner-top">
        <span class="banner-state-pill">当前市场状态</span>
        <span class="banner-label">${d.state_label || ""}</span>
        <span class="banner-date">${formatDate(d.date)}</span>
      </div>
      <div class="banner-brief">${d.brief || ""}</div>
      <span class="banner-stance ${stanceClass}">${d.stance || ""}</span>`;
  } catch (_) {
    el.innerHTML = `<div class="banner-brief" style="color:var(--grey-text)">市场简报暂未更新</div>`;
  }
}

// ── Metrics grid: BTC (live) | F&G (live) | ETF (manual) | OI (manual) ──

function metricCard(label, value, delta, deltaDir, source, liveTag = false) {
  const deltaClass = { up: "delta-up", down: "delta-down", neutral: "delta-neut" }[deltaDir] || "delta-neut";
  const arrow = deltaDir === "up" ? "↑ " : deltaDir === "down" ? "↓ " : "";
  const liveHtml = liveTag
    ? `<span style="font-size:9px;background:rgba(34,197,94,0.15);color:#16a34a;border-radius:3px;padding:1px 5px;margin-left:4px;font-weight:600;">LIVE</span>`
    : `<span style="font-size:9px;background:rgba(107,114,128,0.12);color:#6b7280;border-radius:3px;padding:1px 5px;margin-left:4px;">手动</span>`;
  return `
    <div class="metric-card">
      <div class="metric-label">${label}${liveHtml}</div>
      <div class="metric-value">${value}</div>
      <div class="metric-delta ${deltaClass}">${arrow}${delta}</div>
      <div class="metric-source">${source}</div>
    </div>`;
}

async function loadMetricsGrid() {
  const el = document.getElementById("metrics-grid");
  if (!el) return;

  // Seed immediately with loading placeholders
  el.innerHTML = ["BTC实时价格","恐惧贪婪指数","ETF净流入","未平仓合约 OI"].map(label =>
    `<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value" style="color:var(--grey-text);font-size:16px;">加载中…</div></div>`
  ).join("");

  // Fetch all sources in parallel
  const [btc, fng, etf, oi] = await Promise.all([
    fetchBTCPrice(),
    fetchFearGreed(),
    fetchETFData(),
    fetch("data/metrics_snapshot.json?v=" + Date.now()).then(r => r.ok ? r.json() : null).catch(() => null)
  ]);

  // Card 1 — BTC live price
  let btcCard;
  if (btc) {
    const price = "$" + btc.price.toLocaleString("en-US", { maximumFractionDigits: 0 });
    const chg   = btc.change_pct;
    const dir   = chg >= 0 ? "up" : "down";
    const arrow = chg >= 0 ? "↑" : "↓";
    btcCard = metricCard("BTC 实时价格", price, `${arrow} ${Math.abs(chg).toFixed(2)}% 24h`, dir, "Binance", true);
  } else {
    btcCard = metricCard("BTC 实时价格", "-- --", "数据不可用", "neutral", "Binance", true);
  }

  // Card 2 — Fear & Greed live
  let fngCard;
  if (fng) {
    const cls   = fngClass(fng.value);
    const label = fngLabel(fng.classification);
    const dir   = fng.value >= 50 ? "up" : "down";
    fngCard = metricCard("恐惧贪婪指数", `<span class="${cls}">${label}</span>`, `${fng.value} / 100`, dir, "Alternative.me", true);
  } else {
    fngCard = metricCard("恐惧贪婪指数", "-- --", "数据不可用", "neutral", "Alternative.me", true);
  }

  // Card 3 — ETF flow manual
  let etfCard;
  if (etf) {
    const flow  = etf.net_flow_usd_million;
    const dir   = flow > 0 ? "up" : flow < 0 ? "down" : "neutral";
    const dateStr = etf.date ? etf.date.slice(5) : "";
    etfCard = metricCard("ETF 净流入", etf.label, dateStr + (etf.note ? " · " + etf.note : ""), dir, etf.source || "SoSoValue");
  } else {
    etfCard = metricCard("ETF 净流入", "-- --", "暂无数据", "neutral", "SoSoValue");
  }

  // Card 4 — OI manual
  let oiCard;
  if (oi) {
    const dir = { up:"up", down:"down", neutral:"neutral" }[oi.oi_delta_dir] || "neutral";
    oiCard = metricCard("未平仓合约 OI", oi.oi_value || "--", oi.oi_delta || "", dir, oi.oi_source || "CoinGlass");
  } else {
    oiCard = metricCard("未平仓合约 OI", "-- --", "暂无数据", "neutral", "CoinGlass");
  }

  el.innerHTML = btcCard + fngCard + etfCard + oiCard;

  // Refresh live cards every 30s
  setInterval(async () => {
    const [b, f] = await Promise.all([fetchBTCPrice(), fetchFearGreed()]);
    const cards = el.querySelectorAll(".metric-card");

    if (cards[0] && b) {
      const price = "$" + b.price.toLocaleString("en-US", { maximumFractionDigits: 0 });
      const chg   = b.change_pct;
      const dir   = chg >= 0 ? "up" : "down";
      cards[0].querySelector(".metric-value").textContent = price;
      const d = cards[0].querySelector(".metric-delta");
      d.className = "metric-delta " + (dir === "up" ? "delta-up" : "delta-down");
      d.textContent = (chg >= 0 ? "↑ " : "↓ ") + Math.abs(chg).toFixed(2) + "% 24h";
    }

    if (cards[1] && f) {
      const cls   = fngClass(f.value);
      const label = fngLabel(f.classification);
      const dir   = f.value >= 50 ? "up" : "down";
      cards[1].querySelector(".metric-value").innerHTML = `<span class="${cls}">${label}</span>`;
      const d = cards[1].querySelector(".metric-delta");
      d.className = "metric-delta " + (dir === "up" ? "delta-up" : "delta-down");
      d.textContent = f.value + " / 100";
    }
  }, 30_000);
}

// ══════════════════════════════════════════════════════
//  V1 — HELPERS (unchanged)
// ══════════════════════════════════════════════════════

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("zh-CN", {
    year:  "numeric",
    month: "long",
    day:   "numeric"
  });
}

function verdictLevel(verdict) {
  const map = {
    "极度看空": 1, "偏空": 2, "中性": 3, "偏多": 4, "极度看多": 5,
    "red": 2, "neutral": 3, "green": 4,
    "very_bearish": 1, "very_bullish": 5
  };
  return map[verdict] || 3;
}

function verdictMeter(verdict) {
  const level = verdictLevel(verdict);
  const segs = [1, 2, 3, 4, 5].map(i =>
    `<div class="meter-seg${i <= level ? " lvl-" + level : ""}"></div>`
  ).join("");
  return `
    <div class="verdict-meter">
      <div class="meter-bar">${segs}</div>
      <div class="meter-label lvl-${level}">${verdict}</div>
    </div>`;
}

function verdictClass(verdict) {
  const level = verdictLevel(verdict);
  const map = { 1: "verdict-very-bearish", 2: "verdict-red", 3: "verdict-neutral", 4: "verdict-green", 5: "verdict-very-bullish" };
  return map[level] || "verdict-neutral";
}

function chartImgOrPlaceholder(filename) {
  const src = CHARTS_BASE + filename;
  return `
    <div class="chart-img-wrap">
      <img
        src="${src}"
        alt="${filename}"
        onclick="openLightbox('${src}')"
        onerror="this.closest('.chart-img-wrap').innerHTML = chartPlaceholderHTML()"
        loading="lazy"
      />
    </div>`;
}

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
    { key: "btc_price",    label: "BTC",    id: "indicator-btc-price"    },
    { key: "funding_rate", label: "资金费率", id: "indicator-funding-rate" },
    { key: "etf_flow",     label: "ETF净流",  id: "indicator-etf-flow"     },
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
    </div>`).join("");

  const bulletsHTML = (post.bullets || []).map(b => `<li>${b}</li>`).join("");

  return `
    <div class="hero-card">
      <div class="hero-card-inner">
        <div class="hero-left">
          <div class="hero-meta">
            <span class="hero-date">${formatDate(post.date)}</span>
            ${verdictMeter(post.verdict)}
          </div>
          <div class="hero-title">${post.title}</div>
          <ul class="hero-bullets">${bulletsHTML}</ul>
          <div class="indicators-strip">
            ${indicatorPills(post.indicators, true)}
          </div>
        </div>
        <div class="hero-right">
          <div class="charts-grid ${gridClass}">${chartsHTML}</div>
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

  const chartsCount  = post.charts ? post.charts.length : 0;
  const archiveGridClass = chartsCount === 1 ? "charts-1" : "";

  const allChartsHTML = (post.charts || []).map(c => `
    <div class="archive-chart-item">
      <div class="archive-chart-img">
        <img src="${CHARTS_BASE + c.filename}" alt=""
          onclick="openLightbox('${CHARTS_BASE + c.filename}')"
          onerror="this.style.opacity='0'"
          loading="lazy"/>
      </div>
      <div class="chart-caption">${c.caption || ""}</div>
      <div class="chart-source">${c.source || ""}</div>
    </div>`).join("");

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
          <div class="archive-charts-grid ${archiveGridClass}">${allChartsHTML}</div>
        </div>
      </div>
    </div>`;
}

window.toggleArchiveCard = function(card) {
  card.classList.toggle("expanded");
};

// ── Posts feed (摘要 page) ────────────────────────────

async function initPostsFeed() {
  const heroEl    = document.getElementById("hero-section");
  const archiveEl = document.getElementById("archive-section");
  const footerEl  = document.getElementById("footer-last-updated");

  if (!heroEl) return;

  try {
    const res = await fetch(DATA_URL + "?v=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    const posts = await res.json();

    if (!posts || posts.length === 0) {
      heroEl.innerHTML = `<div class="empty-state"><h3>暂无数据</h3><p>请通过管理页面添加日报</p></div>`;
      return;
    }

    posts.sort((a, b) => b.date.localeCompare(a.date));
    const latest  = posts[0];
    const archive = posts.slice(1);

    heroEl.innerHTML = renderHero(latest);

    if (archive.length > 0) {
      archiveEl.innerHTML = archive.map(renderArchiveCard).join("");
    } else {
      archiveEl.innerHTML = `<div class="empty-state" style="padding:24px 0;color:var(--grey-text);font-size:13px;">暂无历史记录</div>`;
    }

    if (footerEl) footerEl.textContent = formatDate(latest.date);

  } catch (err) {
    console.error("Failed to load posts:", err);
    heroEl.innerHTML = `
      <div class="empty-state">
        <h3>数据加载失败</h3>
        <p style="font-size:13px;margin-top:6px;">请检查 data/posts.json 是否存在</p>
      </div>`;
  }
}

// ══════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initSummaryExtras();
  initPostsFeed();
});
