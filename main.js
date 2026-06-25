// =====================================================
//  HTX Research · BTC Dashboard — Agora redesign (v3)
//  Vanilla recreation of the design_handoff prototype.
//  Data layer kept: 今日报告 ← data/posts.json (+ market_brief),
//  BTC chip ← live Binance/CoinGecko. The five analytical
//  sections use the handoff mock shapes (real data TBD).
// =====================================================

const CHARTS_BASE = "assets/charts/";

// ── helpers ───────────────────────────────────────────
const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

let _gid = 0;
const gid = () => "g" + (++_gid);

// smooth-ish synthetic series (mock data only)
function series(n, base, vol, drift) {
  const out = []; let v = base;
  for (let i = 0; i < n; i++) {
    v += Math.sin(i * 0.7) * vol + (Math.random() - 0.5) * vol * 0.6 + drift;
    out.push(Math.round(v * 100) / 100);
  }
  return out;
}
const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 5, 23); d.setDate(d.getDate() - (29 - i));
  return `${d.getMonth() + 1}/${d.getDate()}`;
});

// =====================================================
//  MOCK DATA  (handoff shapes — analytical sections)
// =====================================================
const DASH = {
  meta: { updated: "—", handle: "@0xRisingCapital", btcPrice: 0, btcChange: 0 },
  news: [
    { tag: "ETF", time: "12分钟前", tone: "up", text: "BlackRock IBIT 单日净流入 1.84 亿美元，连续第四周净申购" },
    { tag: "宏观", time: "38分钟前", tone: "up", text: "美联储 6 月点阵图暗示年内两次降息，风险资产普涨" },
    { tag: "机构", time: "1小时前", tone: "up", text: "Strategy 增持 4,200 枚 BTC，总持仓突破 33.1 万枚" },
    { tag: "链上", time: "2小时前", tone: "down", text: "交易所 BTC 余额降至 6 年新低，长期持有者持续吸筹" },
    { tag: "衍生品", time: "3小时前", tone: "down", text: "24h 全网爆仓 1.84 亿美元，多头占比 66%" },
    { tag: "矿工", time: "4小时前", tone: "up", text: "下次难度调整预计 +4.8%，全网算力创历史新高 742 EH/s" },
    { tag: "监管", time: "5小时前", tone: "neutral", text: "香港证监会批准两只现货比特币 ETF 扩大零售额度" },
    { tag: "市场", time: "6小时前", tone: "up", text: "BTC 站上 71,800 美元，24 小时涨幅 2.34%" },
  ],
  etf: {
    days: DAYS,
    netFlow: series(30, 120, 180, 4),
    cumulative: (() => { const s = series(30, 80, 160, 6); let acc = 14200; return s.map((x) => (acc += x)); })(),
    summary: [
      { label: "净流入 · 今日", value: "+$312M", chg: 18.5, sub: "5日均 +$214M" },
      { label: "净流入 · 本周", value: "+$1.49B", chg: 9.2, sub: "连续 4 周净流入" },
      { label: "ETF 总持仓", value: "1,182,400 BTC", chg: 0.42, sub: "≈ $84.9B AUM" },
      { label: "占流通供应", value: "5.97%", chg: 0.06, sub: "+0.31% 月环比" },
    ],
    funds: [
      { name: "IBIT", issuer: "BlackRock", flow: 184, aum: 41200, share: 48.5, on: true },
      { name: "FBTC", issuer: "Fidelity", flow: 62, aum: 12800, share: 15.1, on: true },
      { name: "BITB", issuer: "Bitwise", flow: 21, aum: 3960, share: 4.7, on: true },
      { name: "ARKB", issuer: "ARK 21Shares", flow: 18, aum: 3420, share: 4.0, on: true },
      { name: "GBTC", issuer: "Grayscale", flow: -34, aum: 18900, share: 22.2, on: false },
      { name: "HODL", issuer: "VanEck", flow: 9, aum: 1240, share: 1.5, on: true },
      { name: "BTCO", issuer: "Invesco", flow: 6, aum: 980, share: 1.2, on: true },
      { name: "EZBC", issuer: "Franklin", flow: 4, aum: 720, share: 0.8, on: true },
    ],
  },
  inst: {
    summary: [
      { label: "上市公司储备", value: "612,400 BTC", chg: 1.8, sub: "≈ $44.0B" },
      { label: "Strategy (MSTR)", value: "331,200 BTC", chg: 2.1, sub: "成本均价 $42,180" },
      { label: "本周新增披露", value: "+8,940 BTC", chg: 12.0, sub: "6 家公司" },
      { label: "未实现盈亏", value: "+$18.7B", chg: 5.4, sub: "公司储备整体" },
    ],
    holders: [
      { name: "Strategy", ticker: "MSTR", btc: 331200, cost: 42180, pnl: 41.2 },
      { name: "MARA Holdings", ticker: "MARA", btc: 46210, cost: 39400, pnl: 49.6 },
      { name: "Riot Platforms", ticker: "RIOT", btc: 19120, cost: 41200, pnl: 43.0 },
      { name: "Tesla", ticker: "TSLA", btc: 11509, cost: 32800, pnl: 71.0 },
      { name: "Hut 8", ticker: "HUT", btc: 10310, cost: 28900, pnl: 94.0 },
      { name: "Coinbase", ticker: "COIN", btc: 9480, cost: 35100, pnl: 60.0 },
      { name: "Block Inc", ticker: "XYZ", btc: 8210, cost: 30200, pnl: 86.0 },
      { name: "Galaxy Digital", ticker: "GLXY", btc: 6540, cost: 44100, pnl: 28.4 },
    ],
    growth: series(30, 560000, 1800, 1700).map((x) => Math.round(x)),
    days: DAYS,
  },
  deriv: {
    summary: [
      { label: "未平仓 OI", value: "$38.4B", chg: -1.1, sub: "BTC 永续+交割" },
      { label: "加权资金费率", value: "+0.0118%", chg: 4.2, sub: "8h · OI 加权" },
      { label: "24h 爆仓", value: "$184M", chg: 32.0, sub: "多头 $121M" },
      { label: "期权 25Δ 偏斜", value: "-3.2%", chg: -1.4, sub: "看涨偏好" },
    ],
    funding: series(30, 0.01, 0.012, 0).map((x) => Math.round(x * 10000) / 10000),
    oi: series(30, 34, 3.2, 0.18).map((x) => Math.round(x * 100) / 100),
    days: DAYS,
    liq: [
      { ex: "Binance", long: 48, short: 22 }, { ex: "Bybit", long: 31, short: 14 },
      { ex: "OKX", long: 24, short: 11 }, { ex: "Hyperliquid", long: 12, short: 9 },
      { ex: "Deribit", long: 6, short: 5 },
    ],
    longShort: 1.34, iv: 52.4,
  },
  miner: {
    summary: [
      { label: "矿工净转出 (7d)", value: "-2,140 BTC", chg: -8.0, sub: "净流出交易所" },
      { label: "矿工储备", value: "1,812,000 BTC", chg: -0.12, sub: "持续下降" },
      { label: "哈希价格", value: "$48.2 / PH/s", chg: -2.6, sub: "盈利能力承压" },
      { label: "全网算力", value: "742 EH/s", chg: 1.4, sub: "7日均" },
    ],
    hashrate: series(30, 690, 22, 1.8).map((x) => Math.round(x)),
    hashprice: series(30, 52, 3.6, -0.18).map((x) => Math.round(x * 10) / 10),
    days: DAYS,
    rigs: [
      { model: "Antminer S21 Pro", eff: 15.0, status: "盈利", margin: 62 },
      { model: "Antminer S21", eff: 17.5, status: "盈利", margin: 48 },
      { model: "Whatsminer M60S", eff: 18.5, status: "盈利", margin: 41 },
      { model: "Antminer S19 XP", eff: 21.5, status: "边际", margin: 19 },
      { model: "Antminer S19j Pro", eff: 29.5, status: "亏损", margin: -14 },
    ],
    shutdown: { low: 34200, high: 58900, price: 71840 }, difficulty: 4.8,
  },
  onchain: {
    summary: [
      { label: "MVRV-Z Score", value: "2.41", chg: 0.8, sub: "中性偏热" },
      { label: "SOPR", value: "1.034", chg: 0.6, sub: "盈利了结" },
      { label: "交易所净流量 (7d)", value: "-18,400 BTC", chg: -22.0, sub: "净流出" },
      { label: "LTH 供应", value: "14.9M BTC", chg: 0.3, sub: "75.4% 流通" },
    ],
    mvrv: series(30, 2.0, 0.22, 0.014).map((x) => Math.round(x * 100) / 100),
    sopr: series(30, 1.0, 0.03, 0).map((x) => Math.round(x * 1000) / 1000),
    days: DAYS,
    cohorts: [
      { label: "长期持有者 LTH", supply: 75.4, pnl: 0.88 },
      { label: "短期持有者 STH", supply: 24.6, pnl: 0.12 },
    ],
    netflow: series(30, -2, 4.5, 0).map((x) => Math.round(x * 100) / 100),
  },
};

const TONE = { up: "var(--pos)", down: "var(--neg)", neutral: "var(--text-3)" };

// =====================================================
//  SVG CHART PRIMITIVES  (return markup strings)
// =====================================================
const VB_W = 600;

// Wrap a chart SVG with hover metadata: data-points = [{l:label, v:formatted}]
function hitWrap(svg, values, meta) {
  const labels = meta && meta.labels;
  const fmt = (meta && meta.format) || ((v) => String(v));
  const pts = values.map((v, i) => ({
    l: labels && labels[i] != null ? String(labels[i]) : "#" + (i + 1),
    v: fmt(v),
  }));
  const json = JSON.stringify(pts).replace(/'/g, "&#39;");
  return `<div class="chart-hit" data-points='${json}'>${svg}<div class="hit-line"></div></div>`;
}

function nicePath(values, w, h, pad) {
  const min = Math.min(...values), max = Math.max(...values);
  const span = (max - min) || 1;
  const innerW = w - pad * 2, innerH = h - pad * 2;
  const pts = values.map((v, i) => [
    pad + (i / (values.length - 1)) * innerW,
    pad + innerH - ((v - min) / span) * innerH,
  ]);
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return { d, pts };
}

function areaChart(values, height = 200, color = "var(--accent)", meta = null) {
  const w = VB_W, h = height, pad = 14;
  const { d, pts } = nicePath(values, w, h, pad);
  const last = pts[pts.length - 1];
  const area = `${d} L ${last[0]},${h - pad} L ${pts[0][0]},${h - pad} Z`;
  const id = gid(), ticks = 4;
  let lines = "";
  for (let i = 0; i < ticks; i++) {
    const y = pad + (i / (ticks - 1)) * (h - pad * 2);
    lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
  }
  const svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${height}" preserveAspectRatio="none" style="display:block;overflow:visible">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.28"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    ${lines}
    <path d="${area}" fill="url(#${id})"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="3.5" fill="${color}"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="6.5" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4"/>
  </svg>`;
  return hitWrap(svg, values, meta);
}

function flowBars(values, height = 200, color = "var(--accent)", neg = "var(--neg)", meta = null) {
  const w = VB_W, h = height, pad = 12;
  const max = Math.max(...values.map(Math.abs)) || 1;
  const zeroY = h / 2, bw = (w - pad * 2) / values.length;
  let bars = "";
  values.forEach((v, i) => {
    const bh = (Math.abs(v) / max) * (h / 2 - pad);
    const x = pad + i * bw + bw * 0.18;
    const y = v >= 0 ? zeroY - bh : zeroY;
    bars += `<rect x="${x}" y="${y}" width="${bw * 0.64}" height="${Math.max(bh, 1)}" rx="2" fill="${v >= 0 ? color : neg}" opacity="${i === values.length - 1 ? 1 : 0.82}"/>`;
  });
  const svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${height}" preserveAspectRatio="none" style="display:block">
    <line x1="0" y1="${zeroY}" x2="${w}" y2="${zeroY}" stroke="var(--border-strong)" stroke-width="1"/>${bars}</svg>`;
  return hitWrap(svg, values, meta);
}

function lineChart(values, values2, height = 200, color = "var(--accent)", color2 = "var(--text-3)", meta = null) {
  const w = VB_W, h = height, pad = 14;
  const all = values2 ? values.concat(values2) : values;
  const min = Math.min(...all), max = Math.max(...all), span = (max - min) || 1;
  const toPath = (vals) => {
    const innerW = w - pad * 2, innerH = h - pad * 2;
    const pts = vals.map((v, i) => [pad + (i / (vals.length - 1)) * innerW, pad + innerH - ((v - min) / span) * innerH]);
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C ${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return { d, last: pts[pts.length - 1] };
  };
  const a = toPath(values), b = values2 ? toPath(values2) : null;
  let lines = "";
  for (let i = 0; i < 4; i++) { const y = pad + (i / 3) * (h - pad * 2); lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`; }
  const svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${height}" preserveAspectRatio="none" style="display:block;overflow:visible">
    ${lines}
    ${b ? `<path d="${b.d}" fill="none" stroke="${color2}" stroke-width="1.6" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/>` : ""}
    <path d="${a.d}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    <circle cx="${a.last[0]}" cy="${a.last[1]}" r="3.5" fill="${color}"/></svg>`;
  return hitWrap(svg, values, meta);
}

function sparkline(values, color = "var(--accent)", height = 36, width = 110) {
  const { d } = nicePath(values, width, height, 3);
  return `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="display:block">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`;
}

function donut(data, size = 180, thickness = 22) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = size / 2 - thickness / 2, c = 2 * Math.PI * r;
  let offset = 0, segs = "";
  data.forEach((d) => {
    const dash = (d.value / total) * c;
    const tipVal = d.tip != null ? d.tip : String(d.value);
    segs += `<circle data-seg="1" data-label="${esc(d.label)}" data-val="${esc(tipVal)}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${thickness}" stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" stroke-linecap="butt"/>`;
    offset += dash;
  });
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><g transform="rotate(-90 ${size / 2} ${size / 2})">${segs}</g></svg>`;
}

function gauge(value, min = 0, max = 100, size = 200, label = "", sub = "") {
  const r = size / 2 - 16, cx = size / 2, cy = size / 2;
  const a0 = Math.PI, a1 = 0;
  const frac = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const ang = a0 + (a1 - a0) * frac;
  const pt = (a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [sx, sy] = pt(a0), [ex, ey] = pt(a1), [px, py] = pt(ang);
  return `<svg viewBox="0 0 ${size} ${size * 0.62}" width="100%" height="${size * 0.62}" style="display:block">
    <path d="M ${sx},${sy} A ${r},${r} 0 1 1 ${ex},${ey}" fill="none" stroke="var(--surface-3)" stroke-width="12" stroke-linecap="round"/>
    <path d="M ${sx},${sy} A ${r},${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${px},${py}" fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="round"/>
    <circle cx="${px}" cy="${py}" r="6" fill="var(--accent)"/>
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-family="var(--num-font)" font-weight="700" font-size="30" fill="var(--text)" style="letter-spacing:-0.02em">${esc(label)}</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11.5" fill="var(--text-3)">${esc(sub)}</text></svg>`;
}

function stackedRows(rows) {
  const max = Math.max(...rows.map((r) => r.long + r.short)) || 1;
  return `<div style="display:flex;flex-direction:column;gap:12px">` + rows.map((r) => `
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:92px;font-size:12.5px;font-weight:600">${esc(r.ex)}</div>
      <div style="flex:1;display:flex;height:22px;border-radius:5px;overflow:hidden;background:var(--surface-3)">
        <div style="width:${(r.long / max) * 100}%;background:var(--neg);opacity:.9"></div>
        <div style="width:${(r.short / max) * 100}%;background:var(--pos);opacity:.85"></div>
      </div>
      <div class="num" style="width:64px;text-align:right;font-size:12.5px;color:var(--text-2)">$${r.long + r.short}M</div>
    </div>`).join("") + `</div>`;
}

// =====================================================
//  AGORA ART  (SVG strings)
// =====================================================
function column(x, top, bottom, w) {
  const flutes = [0.3, 0.5, 0.7].map((f) => x - w / 2 + w * f);
  return `<g>
    <rect x="${x - w / 2}" y="${top}" width="${w}" height="${bottom - top}" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="1.5"/>
    ${flutes.map((fx) => `<line x1="${fx}" y1="${top + 4}" x2="${fx}" y2="${bottom - 4}" stroke="var(--border)" stroke-width="1.2"/>`).join("")}
    <rect x="${x - w / 2 - 5}" y="${top - 8}" width="${w + 10}" height="9" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="1.5"/>
    <rect x="${x - w / 2 - 5}" y="${bottom}" width="${w + 10}" height="9" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="1.5"/>
  </g>`;
}
function classicalScene() {
  const sky = gid(), glow = gid(), cols = [150, 217, 284, 351, 418, 485];
  return `<svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%">
    <defs>
      <linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent-soft)"/><stop offset="62%" stop-color="var(--surface-2)"/><stop offset="100%" stop-color="var(--surface)"/>
      </linearGradient>
      <radialGradient id="${glow}"><stop offset="0%" stop-color="var(--accent)" stop-opacity="0.55"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="640" height="420" fill="url(#${sky})"/>
    <circle cx="512" cy="118" r="78" fill="url(#${glow})"/><circle cx="512" cy="118" r="34" fill="var(--accent)"/>
    <ellipse cx="150" cy="372" rx="240" ry="60" fill="var(--surface-3)" opacity="0.8"/>
    <ellipse cx="520" cy="386" rx="260" ry="56" fill="var(--surface-3)" opacity="0.6"/>
    <rect x="78" y="346" width="484" height="14" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="1.5"/>
    <rect x="64" y="360" width="512" height="16" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="1.5"/>
    <rect x="48" y="376" width="544" height="18" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="1.5"/>
    ${cols.map((x) => column(x, 150, 346, 40)).join("")}
    <rect x="92" y="126" width="456" height="18" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="1.5"/>
    ${cols.map((x) => `<rect x="${x - 3}" y="130" width="6" height="10" fill="var(--border-strong)"/>`).join("")}
    <path d="M 86 126 L 320 58 L 554 126 Z" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="320" cy="104" r="9" fill="var(--accent)"/></svg>`;
}
function merchant(cx, robe, label, banner, ink) {
  return `<g>
    <rect x="${cx - 47}" y="30" width="94" height="23" rx="3" fill="${banner}" stroke="var(--border-strong)" stroke-width="1.5"/>
    <path d="M ${cx - 47} 53 L ${cx - 40} 60 L ${cx - 33} 53 Z" fill="${banner}"/>
    <path d="M ${cx + 33} 53 L ${cx + 40} 60 L ${cx + 47} 53 Z" fill="${banner}"/>
    <text x="${cx}" y="46" text-anchor="middle" font-family="var(--font-body)" font-weight="700" font-size="12.5" fill="${ink}">${esc(label)}</text>
    <circle cx="${cx}" cy="98" r="13" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="1.5"/>
    <rect x="${cx - 12}" y="90" width="24" height="4" rx="2" fill="var(--accent)"/>
    <path d="M ${cx - 21} 118 L ${cx - 32} 192 L ${cx + 32} 192 L ${cx + 21} 118 C ${cx + 12} 112 ${cx - 12} 112 ${cx - 21} 118 Z" fill="${robe}" stroke="var(--border-strong)" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M ${cx - 7} 116 L ${cx} 126 L ${cx + 7} 116" fill="none" stroke="var(--border-strong)" stroke-width="1.5"/>
    ${[-13, 0, 13].map((dx) => `<line x1="${cx + dx}" y1="130" x2="${cx + dx * 1.25}" y2="188" stroke="var(--border)" stroke-width="1.3"/>`).join("")}
  </g>`;
}
function agoraStill() {
  const sky = gid();
  const merchants = [
    { label: "ETF", robe: "var(--accent)", banner: "var(--accent)", ink: "var(--accent-ink)" },
    { label: "机构", robe: "var(--surface)", banner: "var(--surface-2)", ink: "var(--text)" },
    { label: "持有者", robe: "var(--accent)", banner: "var(--accent)", ink: "var(--accent-ink)" },
    { label: "矿工", robe: "var(--surface)", banner: "var(--surface-2)", ink: "var(--text)" },
    { label: "衍生品", robe: "var(--surface)", banner: "var(--surface-2)", ink: "var(--text)" },
  ];
  const xs = [80, 200, 320, 440, 560];
  return `<svg viewBox="0 0 640 260" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%">
    <defs><linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent-soft)"/><stop offset="100%" stop-color="var(--surface)"/></linearGradient></defs>
    <rect width="640" height="260" fill="url(#${sky})"/>
    ${[40, 600].map((x) => `<rect x="${x - 7}" y="70" width="14" height="120" fill="var(--surface-2)" stroke="var(--border)" stroke-width="1.2"/>`).join("")}
    ${merchants.map((m, i) => merchant(xs[i], m.robe, m.label, m.banner, m.ink)).join("")}
    ${xs.map((x) => [0, 1, 2].map((j) => `<circle cx="${x - 16 + j * 16}" cy="186" r="5" fill="var(--accent)" opacity="0.8"/>`).join("")).join("")}
    <rect x="20" y="192" width="600" height="14" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="1.5"/>
    <rect x="32" y="206" width="576" height="46" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="1.5"/></svg>`;
}
function laurelAvatar() {
  return `<svg viewBox="0 0 100 100" style="display:block;width:100%;height:100%">
    <circle cx="50" cy="50" r="48" fill="var(--accent)"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent-ink)" stroke-width="1.5" opacity="0.35"/>
    <path d="M 30 74 Q 16 50 30 26" fill="none" stroke="var(--accent-ink)" stroke-width="2.5" opacity="0.6"/>
    <path d="M 70 74 Q 84 50 70 26" fill="none" stroke="var(--accent-ink)" stroke-width="2.5" opacity="0.6"/>
    <text x="50" y="60" text-anchor="middle" font-family="var(--font-display)" font-weight="700" font-size="34" fill="var(--accent-ink)">R</text></svg>`;
}

// =====================================================
//  COMPONENT BUILDERS
// =====================================================
function delta(v, suffix = "%") {
  const up = v >= 0;
  return `<span class="delta ${up ? "up" : "down"}"><span style="font-size:9px">${up ? "▲" : "▼"}</span>${up ? "+" : ""}${v}${suffix}</span>`;
}
function panel({ title, sub, right, body, className = "" }) {
  const head = (title || right) ? `<div class="panel-head">
    <div><div class="panel-title"><span class="tick"></span>${esc(title || "")}</div>${sub ? `<div class="panel-sub" style="margin-top:4px">${esc(sub)}</div>` : ""}</div>
    ${right || ""}</div>` : "";
  return `<div class="panel hoverable ${className}">${head}${body || ""}</div>`;
}
function statCard(s, i, spark) {
  return `<div class="panel stat fade fade-${i + 1}">
    <div class="stat-label">${esc(s.label)}</div>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px">
      <div class="stat-value">${esc(s.value)}</div>${spark ? sparkline(spark) : ""}
    </div>
    <div class="stat-foot">${s.chg !== undefined ? delta(s.chg) : ""}${s.sub ? `<span>${esc(s.sub)}</span>` : ""}</div></div>`;
}
function sectionHeader({ eyebrow, title, sub, live, right }) {
  return `<div class="section-head">
    <div style="flex:1">
      ${eyebrow ? `<div class="section-eyebrow">${esc(eyebrow)}</div>` : ""}
      <h1 class="section-title">${esc(title)}</h1>
      ${sub ? `<p class="section-sub">${esc(sub)}</p>` : ""}
    </div>
    ${live ? `<span class="live-pill"><span class="pulse"></span>实时 LIVE</span>` : ""}
    ${right || ""}</div>`;
}
const source = (t) => `<div class="source">数据来源：${esc(t)}</div>`;
const legendKey = (color, label) => `<span class="key"><span class="swatch" style="background:${color}"></span>${esc(label)}</span>`;

// =====================================================
//  SECTION: ETF 资金流  (live via /api/etf-metrics + /api/etf-history)
// =====================================================

// SoSoValue value-object helpers
const sv = (o) => (o && typeof o === "object" && "value" in o) ? o.value : o;
const nf = (v) => { const x = parseFloat(sv(v)); return isNaN(x) ? 0 : x; };
function usdAbbr(v, signed = false) {
  const a = Math.abs(v), sign = v < 0 ? "-" : (signed ? "+" : "");
  if (a >= 1e9) return sign + "$" + (a / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return sign + "$" + (a / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return sign + "$" + (a / 1e3).toFixed(2) + "K";
  return sign + "$" + a.toFixed(2);
}

async function loadETF() {
  let metrics = null, history = null;
  try { const r = await fetch("/api/etf-metrics"); if (r.ok) { const j = await r.json(); metrics = (j && j.data) || j; } } catch (_) {}
  try { const r = await fetch("/api/etf-history"); if (r.ok) { const j = await r.json(); history = (j && j.data) || j; } } catch (_) {}
  return { metrics, history };
}

// Normalise the metrics payload → the shape the panels render from.
function mapETFMetrics(m) {
  const totalAssets = nf(m.totalNetAssets);
  const funds = (m.list || []).map((f) => {
    const aumM = nf(f.netAssets) / 1e6;          // millions
    const flowM = nf(f.dailyNetInflow) / 1e6;    // millions
    return {
      name: (sv(f.ticker) || "").toString().trim(),
      issuer: (sv(f.institute) || "").toString().trim(),
      flow: flowM,
      aum: aumM,
      share: totalAssets ? (nf(f.netAssets) / totalAssets) * 100 : 0,
      on: nf(f.dailyNetInflow) >= 0,
    };
  }).filter((f) => f.name).sort((a, b) => b.aum - a.aum);

  return {
    date: sv(m.totalNetAssets && m.totalNetAssets.lastUpdateDate) || sv(m.dailyNetInflow && m.dailyNetInflow.lastUpdateDate) || "",
    dailyNetInflow: nf(m.dailyNetInflow),
    cumNetInflow: nf(m.cumNetInflow),
    dailyTraded: nf(m.dailyTotalValueTraded),
    totalAssets,
    holdings: nf(m.totalTokenHoldings),
    pct: nf(m.totalNetAssetsPercentage),
    funds,
  };
}

// Normalise history payload → { days[], netFlow[], cumulative[] } (millions).
// SoSoValue's historicalInflowChart shape is mapped defensively across field names.
function mapETFHistory(h) {
  const arr = Array.isArray(h) ? h : (h && (h.list || h.data)) || [];
  if (!arr.length) return null;
  const rows = arr.map((r) => ({
    full: (sv(r.date) || sv(r.dataDate) || sv(r.day) || "").toString(),
    inflow: nf(r.totalNetInflow != null ? r.totalNetInflow : (r.netInflow != null ? r.netInflow : (r.dailyNetInflow != null ? r.dailyNetInflow : r.value))) / 1e6,
  })).filter((r) => r.full);
  // sort by FULL ISO date so slice(-30) is the most-recent 30 days (not MM-DD lexical)
  rows.sort((a, b) => a.full.localeCompare(b.full));
  const last = rows.slice(-30);
  let run = 0;
  return {
    days: last.map((r) => r.full.slice(5)),
    netFlow: last.map((r) => r.inflow),
    cumulative: last.map((r) => (run += r.inflow)), // 30-day running sum of net flow
  };
}

async function renderETF() {
  const head = sectionHeader({
    eyebrow: "Participant 01 · ETF Flows", title: "ETF 资金流向",
    sub: "追踪美国现货 BTC ETF 的每日申购赎回、累计净流入与各发行商持仓份额。", live: true,
    right: segMarkup(["日", "周", "月"], "日"),
  });
  document.getElementById("view").innerHTML = head +
    `<div class="grid cols-4" style="margin-bottom:var(--gap)">${[0, 1, 2, 3].map(() => `<div class="skeleton"></div>`).join("")}</div>
     <div class="grid cols-3"><div class="skeleton span-2" style="height:260px"></div><div class="skeleton" style="height:260px"></div></div>`;

  const { metrics, history } = await loadETF();

  // Fallback to mock if the live API is unavailable.
  let d, live = true, hist = null;
  if (metrics && metrics.list) {
    d = mapETFMetrics(metrics);
    hist = history ? mapETFHistory(history) : null;
  } else {
    live = false;
    const mk = DASH.etf;
    d = {
      date: "示例", dailyNetInflow: 312e6, cumNetInflow: 53.3e9, dailyTraded: 1.87e9,
      totalAssets: 84.9e9, holdings: 1182400, pct: 0.0597,
      funds: mk.funds.map((f) => ({ ...f })),
    };
    hist = { days: mk.days, netFlow: mk.netFlow, cumulative: mk.cumulative };
  }
  if (!hist) hist = { days: DASH.etf.days, netFlow: DASH.etf.netFlow, cumulative: DASH.etf.cumulative };

  const palette = ["var(--accent)", "color-mix(in oklab,var(--accent) 70%,var(--text-3))",
    "color-mix(in oklab,var(--accent) 45%,var(--text-3))", "var(--text-3)", "var(--surface-3)"];
  const donutData = d.funds.filter((f) => f.aum > 0).slice(0, 5).map((f, i) => ({ label: f.name, value: f.aum, tip: usdAbbr(f.aum * 1e6), color: palette[i] }));
  const flowMeta = { labels: hist.days, format: (v) => usdAbbr(v * 1e6, true) };
  const cumMeta = { labels: hist.days, format: (v) => usdAbbr(v * 1e6) };

  const summary = [
    { label: "净流入 · 今日", value: usdAbbr(d.dailyNetInflow, true), sub: "截至 " + d.date },
    { label: "累计净流入", value: usdAbbr(d.cumNetInflow), sub: "截至 " + d.date },
    { label: "ETF 总持仓", value: Math.round(d.holdings).toLocaleString() + " BTC", sub: "≈ " + usdAbbr(d.totalAssets) + " AUM" },
    { label: "占 BTC 市值", value: (d.pct * 100).toFixed(2) + "%", sub: "现货 ETF 持仓占比" },
  ];
  const cards = summary.map((s, i) => statCard(s, i, i === 0 && hist.netFlow ? hist.netFlow.slice(-12) : undefined)).join("");

  const liveOrMock = live ? "" : `<span class="live-pill muted" style="margin-left:8px">示例数据 · 实时不可用</span>`;
  const histLive = (live && history) ? "" : `<span class="panel-sub" style="margin-left:8px">· 示例序列</span>`;

  const flowPanel = panel({
    title: "净流入 / 流出", sub: "单位：百万美元 (USD M) · 近 30 日", className: "span-2 fade",
    right: `<div class="legend">${legendKey("var(--accent)", "净流入")}${legendKey("var(--neg)", "净流出")}</div>`,
    body: flowBars(hist.netFlow, 220, "var(--accent)", "var(--neg)", flowMeta) + `<div class="num" style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--text-3)"><span>${esc(hist.days[0] || "")}</span><span>${esc(hist.days[Math.floor(hist.days.length / 2)] || "")}</span><span>${esc(hist.days[hist.days.length - 1] || "")}</span></div>`,
  });
  const donutPanel = panel({
    title: "持仓份额", sub: "按 AUM · Top 5", className: "fade",
    body: `<div class="viz-center" style="position:relative">${donut(donutData, 170, 20)}
      <div style="position:absolute;text-align:center"><div class="num" style="font-size:21px;font-weight:700;letter-spacing:-0.02em">${usdAbbr(d.totalAssets)}</div><div style="font-size:11px;color:var(--text-3)">总 AUM</div></div></div>
      <div class="legend" style="margin-top:14px;flex-direction:column;gap:7px">${donutData.map((s) => `<span class="key" style="justify-content:space-between;width:100%"><span><span class="swatch" style="background:${s.color}"></span>${esc(s.label)}</span><span class="num" style="color:var(--text-3)">${usdAbbr(s.value * 1e6)}</span></span>`).join("")}</div>`,
  });

  const cumPanel = panel({ title: "累计净流入趋势", sub: "单位：百万美元 · 近 30 日累计" + (histLive ? " · 示例序列" : ""), className: "fade", body: areaChart(hist.cumulative, 200, "var(--accent)", cumMeta) });

  const fundRows = d.funds.map((f) => `<tr>
    <td class="name">${esc(f.name)}</td>
    <td style="color:var(--text-2)">${esc(f.issuer)}</td>
    <td class="r num ${f.flow >= 0 ? "pos" : "neg"}" style="font-weight:600">${f.flow >= 0 ? "+" : ""}${f.flow.toFixed(1)}M</td>
    <td class="r num" style="color:var(--text-2)">$${(f.aum / 1000).toFixed(1)}B</td>
    <td class="bar-cell"><div style="display:flex;align-items:center;gap:10px"><div class="bar-bg" style="flex:1"><div class="bar-fill" style="width:${Math.min(f.share, 100)}%"></div></div><span class="num" style="font-size:12px;color:var(--text-3);width:42px">${f.share.toFixed(1)}%</span></div></td>
    <td class="r"><span class="tag ${f.on ? "on" : "off"}">${f.on ? "净流入" : "净流出"}</span></td></tr>`).join("");
  const tablePanel = panel({
    title: "各基金明细", sub: "按总净资产排序 · 当日", className: "fade",
    body: `<table class="tbl"><thead><tr><th>基金</th><th>发行商</th><th class="r">日净流入</th><th class="r">AUM</th><th style="width:26%">份额</th><th class="r">状态</th></tr></thead><tbody>${fundRows}</tbody></table>`,
  });

  document.getElementById("view").innerHTML = head +
    `<div class="grid cols-4" style="margin-bottom:var(--gap)">${cards}</div>
     <div class="grid cols-3" style="margin-bottom:var(--gap)">${flowPanel}${donutPanel}</div>
     ${cumPanel}<div style="height:var(--gap)"></div>${tablePanel}` +
    `<div class="source">数据来源：SoSoValue${liveOrMock}</div>`;
  initChartHovers(document.getElementById("view"));
}

// =====================================================
//  SECTION: 机构持仓 — Strategy (MSTR) focused
//  Live: MSTR + STRC (Twelve Data proxy) · BTC (Binance)
//  Manual: data/strategy.json (8-K fundamentals)
//  Computed: mNAV, market value, P&L, dividend runways
// =====================================================
const money2 = (v) => (v < 0 ? "-$" : "$") + Math.abs(v).toFixed(2);
const intc = (v) => Math.round(v).toLocaleString("en-US");
function fmtRunway(y) {
  if (!isFinite(y) || y <= 0) return "—";
  return y >= 1 ? y.toFixed(2) + " 年" : (y * 12).toFixed(1) + " 个月";
}

// Twelve Data time_series → [{date, close}] oldest-first
function tdSeries(history, sym) {
  const node = history && history[sym];
  const vals = (node && node.values) || [];
  return vals.map((v) => ({ date: v.datetime, close: parseFloat(v.close) }))
    .filter((d) => isFinite(d.close)).reverse();
}

// Rebased (=100 at start) multi-line comparison chart with combined hover.
function multiLineChart(series, dates, height = 230) {
  const w = VB_W, h = height, pad = 14;
  const rebased = series.map((s) => {
    const base = s.values.find((v) => v != null) || 1;
    return { ...s, norm: s.values.map((v) => (v == null ? null : (v / base) * 100)) };
  });
  const all = [].concat(...rebased.map((s) => s.norm.filter((v) => v != null)));
  const min = Math.min(...all), max = Math.max(...all), span = (max - min) || 1;
  const n = dates.length;
  const xAt = (i) => pad + (i / (n - 1)) * (w - pad * 2);
  const yAt = (v) => pad + (h - pad * 2) - ((v - min) / span) * (h - pad * 2);
  let lines = "";
  for (let i = 0; i < 4; i++) { const y = pad + (i / 3) * (h - pad * 2); lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`; }
  const paths = rebased.map((s) => {
    let d = "", started = false;
    s.norm.forEach((v, i) => { if (v == null) return; const x = xAt(i), y = yAt(v); d += started ? ` L ${x},${y}` : `M ${x},${y}`; started = true; });
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`;
  }).join("");
  const svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${height}" preserveAspectRatio="none" style="display:block;overflow:visible">${lines}${paths}</svg>`;
  const pts = dates.map((dt, i) => ({
    l: dt.slice(5),
    v: rebased.map((s) => `${s.name} ${s.values[i] != null ? s.fmt(s.values[i]) : "—"}`).join(" · "),
  }));
  const json = JSON.stringify(pts).replace(/'/g, "&#39;");
  return `<div class="chart-hit" data-points='${json}'>${svg}<div class="hit-line"></div></div>`;
}

async function loadStrategy() {
  let fund = null, quote = null, history = null, btc = null, btcKlines = null;
  try { const r = await fetch("data/strategy.json?v=" + Date.now()); if (r.ok) fund = await r.json(); } catch (_) {}
  try { const r = await fetch("/api/mstr-quote"); if (r.ok) quote = await r.json(); } catch (_) {}
  try { const r = await fetch("/api/mstr-history"); if (r.ok) history = await r.json(); } catch (_) {}
  btc = await fetchBTCPrice();
  try { const r = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=160"); if (r.ok) btcKlines = await r.json(); } catch (_) {}
  return { fund, quote, history, btc, btcKlines };
}

async function renderInst() {
  const head = sectionHeader({
    eyebrow: "Participant 02 · Strategy (MSTR)", title: "Strategy · MSTR 财库",
    sub: "聚焦 MicroStrategy/Strategy：BTC 持仓与成本、mNAV、优先股资本结构与股息跑道。", live: true,
  });
  document.getElementById("view").innerHTML = head + `<div class="grid cols-4">${[0, 1, 2, 3].map(() => `<div class="skeleton"></div>`).join("")}</div>`;

  const { fund, quote, history, btc, btcKlines } = await loadStrategy();
  if (!fund) {
    document.getElementById("view").innerHTML = head + `<div class="empty-note"><strong>数据加载失败</strong><br/><span style="font-size:12px">请检查 data/strategy.json</span></div>`;
    return;
  }

  // ---- live prices ----
  const mq = quote && quote.MSTR && quote.MSTR.close ? quote.MSTR : null;
  const sq = quote && quote.STRC && quote.STRC.close ? quote.STRC : null;
  const mstrPrice = mq ? parseFloat(mq.close) : null;
  const mstrChg = mq ? parseFloat(mq.percent_change) : null;
  const strcPrice = sq ? parseFloat(sq.close) : null;
  const strcChg = sq ? parseFloat(sq.percent_change) : null;
  const btcPrice = btc ? btc.price : null;
  const priceLive = !!mq;

  // ---- fundamentals + computed ----
  const holdings = fund.btc.holdings, costAvg = fund.btc.cost_basis_avg, shares = fund.shares_diluted;
  const btcMV = btcPrice ? holdings * btcPrice : null;
  const totalCost = holdings * costAvg;
  const unrealPnl = btcMV != null ? btcMV - totalCost : null;
  const unrealPct = unrealPnl != null ? (unrealPnl / totalCost) * 100 : null;
  const mktCap = mstrPrice != null ? mstrPrice * shares : null;
  const mnav = (mktCap != null && btcMV) ? mktCap / btcMV : null;

  // ---- KPI cards ----
  const row1 = [
    { label: "mNAV", value: mnav != null ? mnav.toFixed(2) + "×" : "—", sub: "市值 / BTC 净值" },
    { label: "BTC Yield · YTD", value: "+" + fund.btc_yield_ytd_pct + "%", sub: "每股 BTC 增长" },
    { label: "MSTR 价格", value: mstrPrice != null ? money2(mstrPrice) : "—", chg: mstrChg != null ? +mstrChg.toFixed(2) : undefined, sub: "NASDAQ" },
    { label: "STRC 价格", value: strcPrice != null ? money2(strcPrice) : "—", chg: strcChg != null ? +strcChg.toFixed(2) : undefined, sub: "NASDAQ 优先股" },
  ].map((s, i) => statCard(s, i)).join("");
  const row2 = [
    { label: "BTC 持仓", value: intc(holdings) + " BTC", sub: btcMV != null ? "≈ " + usdAbbr(btcMV) : "成本 $" + intc(costAvg) },
    { label: "持仓成本均价", value: "$" + intc(costAvg), sub: "总成本 " + usdAbbr(totalCost) },
    { label: "BTC 市值", value: btcMV != null ? usdAbbr(btcMV) : "—", sub: "现价 " + (btcPrice != null ? "$" + intc(btcPrice) : "—") },
    { label: "未实现盈亏", value: unrealPnl != null ? (unrealPnl >= 0 ? "+" : "-") + usdAbbr(Math.abs(unrealPnl)) : "—", chg: unrealPct != null ? +unrealPct.toFixed(1) : undefined, sub: "对比持仓成本" },
  ].map((s, i) => statCard(s, i)).join("");

  // ---- price chart (MSTR / STRC / BTC rebased) ----
  let chartPanel;
  const mstrHist = tdSeries(history, "MSTR");
  if (priceLive && mstrHist.length) {
    const strcHist = tdSeries(history, "STRC");
    const strcMap = Object.fromEntries(strcHist.map((d) => [d.date, d.close]));
    const btcMap = {};
    (btcKlines || []).forEach((k) => { btcMap[new Date(k[0]).toISOString().slice(0, 10)] = parseFloat(k[4]); });
    const spine = mstrHist.slice(-120);
    const dates = spine.map((d) => d.date);
    const mstrV = spine.map((d) => d.close);
    const strcV = dates.map((dt) => (strcMap[dt] != null ? strcMap[dt] : null));
    let lastBtc = null;
    const btcV = dates.map((dt) => { if (btcMap[dt] != null) lastBtc = btcMap[dt]; return lastBtc; });
    const chart = multiLineChart([
      { name: "MSTR", color: "var(--accent)", values: mstrV, fmt: (v) => "$" + v.toFixed(2) },
      { name: "STRC", color: "#7a5ae0", values: strcV, fmt: (v) => "$" + v.toFixed(2) },
      { name: "BTC", color: "#F0A12C", values: btcV, fmt: (v) => "$" + intc(v) },
    ], dates, 230);
    const legend = `<div class="legend">${legendKey("var(--accent)", "MSTR")}${legendKey("#7a5ae0", "STRC")}${legendKey("#F0A12C", "BTC")}</div>`;
    chartPanel = panel({ title: "价格走势对比", sub: "再基准化 = 100 · 近 120 交易日", className: "span-all fade", right: legend, body: chart });
  } else {
    chartPanel = panel({
      title: "价格走势对比", sub: "MSTR / STRC / BTC", className: "span-all fade",
      body: `<div class="empty-note">实时价格图需在 Vercel 配置 <code style="font-family:var(--font-mono)">TWELVEDATA_API_KEY</code><br/><span style="font-size:12px">（用于拉取 MSTR / STRC 实时与历史价格）</span></div>`,
    });
  }

  // ---- preferred capital structure ----
  const prefRows = fund.preferreds.map((p) => `<tr>
    <td><span class="tk">${esc(p.ticker)}</span></td>
    <td style="color:var(--text-2)">${esc(p.name)}</td>
    <td class="r num">${intc(p.shares)}</td>
    <td class="r num" style="color:var(--text-2)">${esc(p.coupon)}</td>
    <td class="r num">${usdAbbr(p.annual_div_usd)}</td></tr>`).join("");
  const prefPanel = panel({
    title: "优先股资本结构", sub: "STRK · STRF · STRD · STRC · STRE", className: "span-2 fade",
    body: `<table class="tbl"><thead><tr><th>系列</th><th>名称</th><th class="r">流通股数</th><th class="r">票息</th><th class="r">年度股息</th></tr></thead><tbody>${prefRows}</tbody></table>`,
  });

  // ---- latest 8-K ----
  const k = fund.latest_8k;
  const kRow = (label, val) => `<div style="display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--text-2)">${label}</span><span class="num" style="font-weight:700">${val}</span></div>`;
  const eightKPanel = panel({
    title: "最新 8-K 摘要", sub: k.date, className: "fade",
    body: kRow("STRC 本周增发", usdAbbr(k.strc_issued_week_usd)) +
      kRow("BTC 本周买入", intc(k.btc_bought_week) + " 枚 · " + usdAbbr(k.btc_bought_usd)) +
      kRow("BTC 累计持仓", intc(k.btc_cumulative) + " BTC").replace("border-bottom:1px solid var(--border)", "border:none"),
  });

  // ---- dividend runways ----
  const reserve = fund.reserves.usd_reserve_usd;
  const interest = fund.reserves.convert_interest_annual_usd || 0;
  const strc = fund.preferreds.find((p) => p.ticker === "STRC");
  const strcAnnual = strc ? strc.annual_div_usd : 0;
  const divTotal = fund.preferreds.reduce((s, p) => s + (p.annual_div_usd || 0), 0);
  const globalAnnual = divTotal + interest;
  const strcRunwayY = reserve / strcAnnual;
  const globalRunwayY = reserve / globalAnnual;
  const rwRow = (label, val, strong) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--text-2)">${label}</span><span class="num" style="font-weight:${strong ? 700 : 600}">${val}</span></div>`;

  const strcRunwayPanel = panel({
    title: "STRC 股息跑道", sub: "仅 STRC · 现金储备覆盖", className: "fade",
    body: `<div class="kpi-inline" style="margin-bottom:16px"><span class="big">${fmtRunway(strcRunwayY)}</span><span style="font-size:12px;color:${strcRunwayY < 0.5 ? "var(--neg)" : "var(--text-3)"}">可覆盖</span></div>
      ${rwRow("USD 现金储备", usdAbbr(reserve))}
      ${rwRow("STRC 年度现金需求", usdAbbr(strcAnnual))}
      <div style="margin-top:14px;height:8px;border-radius:4px;background:var(--surface-3);overflow:hidden"><div style="height:100%;width:${Math.min(strcRunwayY * 100, 100)}%;background:${strcRunwayY < 0.5 ? "var(--neg)" : "var(--accent)"}"></div></div>
      <div style="margin-top:6px;font-size:11.5px;color:var(--text-3)">储备 / 年度需求 = ${(strcRunwayY * 100).toFixed(0)}% 年覆盖</div>`,
  });
  const globalRunwayPanel = panel({
    title: "全局股息 + 利息跑道", sub: "全部优先股 + 可转债利息", className: "fade",
    body: `<div class="kpi-inline" style="margin-bottom:16px"><span class="big">${fmtRunway(globalRunwayY)}</span><span style="font-size:12px;color:${globalRunwayY < 0.5 ? "var(--neg)" : "var(--text-3)"}">可覆盖</span></div>
      ${rwRow("年度义务总额", usdAbbr(globalAnnual), true)}
      ${rwRow("— 优先股股息", usdAbbr(divTotal))}
      ${rwRow("— 可转债利息", usdAbbr(interest))}
      ${rwRow("USD 现金储备", usdAbbr(reserve))}`,
  });

  document.getElementById("view").innerHTML = head +
    `<div class="grid cols-4" style="margin-bottom:var(--gap)">${row1}</div>
     <div class="grid cols-4" style="margin-bottom:var(--gap)">${row2}</div>
     <div class="grid" style="margin-bottom:var(--gap)">${chartPanel}</div>
     <div class="grid cols-3" style="margin-bottom:var(--gap)">${prefPanel}${eightKPanel}</div>
     <div class="grid cols-2">${strcRunwayPanel}${globalRunwayPanel}</div>` +
    `<div class="source">数据来源：Strategy 8-K / 10-Q（手动）· MSTR/STRC 实时 Twelve Data · BTC Binance${priceLive ? "" : ` <span class="live-pill muted" style="margin-left:6px">价格离线</span>`}</div>`;
  initChartHovers(document.getElementById("view"));
}

// =====================================================
//  SECTION: 衍生品市场
// =====================================================
function renderDeriv() {
  const d = DASH.deriv;
  const cards = d.summary.map((s, i) => statCard(s, i, i === 1 ? d.funding.slice(-12) : i === 0 ? d.oi.slice(-12) : undefined)).join("");
  const fundingPanel = panel({ title: "资金费率", sub: "8h · OI 加权 · 近 30 日 (%)", className: "fade", body: lineChart(d.funding, null, 190, "var(--accent)", "var(--text-3)", { labels: d.days, format: (v) => v + "%" }) });
  const oiPanel = panel({ title: "未平仓合约 OI", sub: "单位：十亿美元 · 近 30 日", className: "fade", body: areaChart(d.oi, 190, "var(--accent)", { labels: d.days, format: (v) => "$" + v + "B" }) });
  const liqPanel = panel({
    title: "24h 爆仓分布", sub: "按交易所 · 多 / 空", className: "span-2 fade",
    right: `<div class="legend">${legendKey("var(--neg)", "多头爆仓")}${legendKey("var(--pos)", "空头爆仓")}</div>`,
    body: stackedRows(d.liq),
  });
  const gaugePanel = panel({
    title: "多空持仓比", sub: "全网 · Top Trader", className: "fade",
    body: `<div class="viz-center" style="padding-top:8px">${gauge(d.longShort, 0.5, 2, 200, d.longShort.toFixed(2), "LONG / SHORT")}</div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:12.5px"><span style="color:var(--text-2)">隐含波动率 IV</span><span class="num" style="font-weight:600">${d.iv}%</span></div>`,
  });
  return sectionHeader({ eyebrow: "Participant 03 · Derivatives", title: "衍生品市场", sub: "永续合约资金费率、未平仓合约、爆仓分布与期权偏斜度。", live: true }) +
    `<div class="grid cols-4" style="margin-bottom:var(--gap)">${cards}</div>
     <div class="grid cols-2" style="margin-bottom:var(--gap)">${fundingPanel}${oiPanel}</div>
     <div class="grid cols-3">${liqPanel}${gaugePanel}</div>` + source("CoinGlass · Hyperliquid · Velo · Deribit");
}

// =====================================================
//  SECTION: 矿工
// =====================================================
function renderMiner() {
  const d = DASH.miner, sd = d.shutdown;
  const pricePct = ((sd.price - sd.low) / (sd.high - sd.low)) * 100;
  const cards = d.summary.map((s, i) => statCard(s, i, i === 3 ? d.hashrate.slice(-12) : i === 2 ? d.hashprice.slice(-12) : undefined)).join("");
  const hashratePanel = panel({ title: "全网算力", sub: "EH/s · 7日均 · 近 30 日", className: "fade", body: areaChart(d.hashrate, 190, "var(--accent)", { labels: d.days, format: (v) => v + " EH/s" }) });
  const hashpricePanel = panel({ title: "哈希价格", sub: "USD / PH/s · 矿工盈利能力", className: "fade", body: lineChart(d.hashprice, null, 190, "var(--neg)", "var(--text-3)", { labels: d.days, format: (v) => "$" + v }) });
  const rigRows = d.rigs.map((r) => `<tr>
    <td class="name">${esc(r.model)}</td>
    <td class="r num" style="color:var(--text-2)">${r.eff}</td>
    <td class="r"><span class="tag ${r.status === "盈利" ? "on" : r.status === "亏损" ? "off" : "mid"}">${esc(r.status)}</span></td>
    <td class="bar-cell"><div style="display:flex;align-items:center;gap:10px"><div class="bar-bg" style="flex:1"><div class="bar-fill" style="width:${Math.abs(r.margin)}%;background:${r.margin >= 0 ? "var(--pos)" : "var(--neg)"}"></div></div><span class="num ${r.margin >= 0 ? "pos" : "neg"}" style="font-size:12px;width:40px">${r.margin > 0 ? "+" : ""}${r.margin}%</span></div></td></tr>`).join("");
  const rigsPanel = panel({
    title: "主流矿机盈利状态", sub: "按能效 (J/TH) · 当前电价假设 $0.06/kWh", className: "span-2 fade",
    body: `<table class="tbl"><thead><tr><th>机型</th><th class="r">能效 J/TH</th><th class="r">状态</th><th style="width:30%">利润率</th></tr></thead><tbody>${rigRows}</tbody></table>`,
  });
  const shutdownPanel = panel({
    title: "关机价区间", sub: "主流矿机停机阈值", className: "fade",
    body: `<div class="kpi-inline" style="margin-bottom:18px"><span class="big">$${sd.price.toLocaleString()}</span><span style="font-size:12px;color:var(--pos)">当前价</span></div>
      <div style="position:relative;height:10px;border-radius:5px;background:linear-gradient(90deg,var(--neg-soft),var(--surface-3) 55%,var(--pos-soft));margin-bottom:8px">
        <div style="position:absolute;left:calc(${pricePct}% - 7px);top:-4px;width:14px;height:18px;border-radius:4px;background:var(--accent);border:2px solid var(--surface)"></div></div>
      <div class="num" style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-3)"><span>$${sd.low.toLocaleString()}</span><span>$${sd.high.toLocaleString()}</span></div>
      <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;font-size:12.5px"><span style="color:var(--text-2)">下次难度调整</span><span class="num pos" style="font-weight:600">+${d.difficulty}%</span></div>`,
  });
  return sectionHeader({ eyebrow: "Participant 04 · Miners", title: "矿工数据", sub: "矿工储备与净转出、哈希价格、全网算力及关机价区间。", live: true }) +
    `<div class="grid cols-4" style="margin-bottom:var(--gap)">${cards}</div>
     <div class="grid cols-2" style="margin-bottom:var(--gap)">${hashratePanel}${hashpricePanel}</div>
     <div class="grid cols-3">${rigsPanel}${shutdownPanel}</div>` + source("Glassnode · Hashrate Index · Luxor");
}

// =====================================================
//  SECTION: 链上指标
// =====================================================
function renderOnchain() {
  const d = DASH.onchain;
  const cards = d.summary.map((s, i) => statCard(s, i, i === 0 ? d.mvrv.slice(-12) : i === 1 ? d.sopr.slice(-12) : undefined)).join("");
  const lastMvrv = d.mvrv[d.mvrv.length - 1];
  const mvrvPanel = panel({
    title: "MVRV-Z Score", sub: "估值带 · >7 过热 / <0 低估", className: "fade",
    body: `<div class="viz-center" style="padding-top:8px">${gauge(lastMvrv, -1, 8, 200, lastMvrv.toFixed(2), "中性偏热区间")}</div>`,
  });
  const soprPanel = panel({ title: "SOPR · 花费产出利润率", sub: ">1 整体盈利了结 · 近 30 日", className: "span-2 fade", body: lineChart(d.sopr, null, 190, "var(--accent)", "var(--text-3)", { labels: d.days, format: (v) => String(v) }) });
  const cohortBody = d.cohorts.map((c) => `<div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:7px"><span style="font-weight:600">${esc(c.label)}</span><span class="num" style="color:var(--text-2)">${c.supply}% · 盈利占比 ${(c.pnl * 100).toFixed(0)}%</span></div>
      <div class="bar-bg" style="height:10px"><div class="bar-fill" style="width:${c.supply}%;height:10px;background:${c.label.includes("长期") ? "var(--accent)" : "var(--text-3)"}"></div></div></div>`).join("");
  const cohortPanel = panel({ title: "持有者结构", sub: "LTH vs STH · 占流通供应", className: "fade", body: cohortBody + `<div style="margin-top:6px;font-size:12px;color:var(--text-3)">长期持有者持续吸筹，供应趋于成熟。</div>` });
  const netflowPanel = panel({ title: "交易所净流量", sub: "负值 = 净流出 (看涨) · 千 BTC", className: "fade", body: flowBars(d.netflow, 180, "var(--neg)", "var(--pos)", { labels: d.days, format: (v) => v + "k BTC" }) });
  return sectionHeader({ eyebrow: "Participant 05 · On-chain", title: "链上指标", sub: "估值带、盈利状态、持有者结构与交易所资金流向。", live: true }) +
    `<div class="grid cols-4" style="margin-bottom:var(--gap)">${cards}</div>
     <div class="grid cols-3" style="margin-bottom:var(--gap)">${mvrvPanel}${soprPanel}</div>
     <div class="grid cols-2">${cohortPanel}${netflowPanel}</div>` + source("Glassnode · CheckOnChain");
}

// =====================================================
//  SECTION: 今日报告  (wired to data/posts.json)
// =====================================================
const VERDICT = {
  "极度看多": { tone: "up", delta: 2.0 }, "偏多": { tone: "up", delta: 1.0 },
  "中性": { tone: "neutral", delta: 0.2 },
  "偏空": { tone: "down", delta: -1.0 }, "极度看空": { tone: "down", delta: -2.0 },
};
function verdictMeta(v) { return VERDICT[v] || VERDICT["中性"]; }
function weekdayCN(iso) {
  const wd = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const d = new Date(iso + "T00:00:00"); return isNaN(d) ? "" : wd[d.getDay()];
}
function tagForBullet(text) {
  if (/ETF|净流入|净流出|IBIT|SoSoValue/i.test(text)) return "ETF";
  if (/STRC|MSTR|Strategy|Saylor|机构|增持|储备/i.test(text)) return "机构";
  if (/资金费率|未平仓|爆仓|合约|衍生品|多头|空头|OI/i.test(text)) return "衍生品";
  if (/矿工|算力|哈希|难度|关机/i.test(text)) return "矿工";
  if (/链上|MVRV|SOPR|持有者|LTH|交易所|余额|RHODL/i.test(text)) return "链上";
  return "市场";
}

async function renderReport() {
  // shell with skeletons; fill async
  document.getElementById("view").innerHTML =
    sectionHeader({
      eyebrow: "The Agora · 今日报告", title: "市场集市日报",
      sub: "每日追踪五类 BTC 市场参与者的行为与仓位——像走过一座露天集市，逐个摊位读懂供需。",
      right: `<span class="live-pill" id="report-pill"><span class="pulse"></span>加载中…</span>`,
    }) + `<div id="report-body"><div class="skeleton" style="height:330px"></div></div>`;

  let posts = [];
  let brief = null;
  try {
    const [pRes, bRes] = await Promise.all([
      fetch("data/posts.json?v=" + Date.now()),
      fetch("data/market_brief.json?v=" + Date.now()).catch(() => null),
    ]);
    if (!pRes.ok) throw new Error("posts " + pRes.status);
    posts = await pRes.json();
    if (bRes && bRes.ok) brief = await bRes.json();
  } catch (err) {
    document.getElementById("report-body").innerHTML =
      `<div class="empty-note"><strong>数据加载失败</strong><br/><span style="font-size:12px">请检查 data/posts.json 是否存在且为有效 JSON</span></div>`;
    return;
  }
  if (!posts.length) {
    document.getElementById("report-body").innerHTML = `<div class="empty-note">暂无日报，请通过管理页面添加</div>`;
    return;
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));
  const L = posts[0];
  const rest = posts.slice(1);
  const issueNo = posts.length + 99; // synthetic running issue number
  const bullets = L.bullets || [];
  const totalChars = bullets.join("").length;
  const readMins = Math.max(2, Math.ceil(totalChars / 380));
  // Hero dek = market_brief (distinct editorial summary). Without a brief, fall back to
  // the first bullet and let the article start from the second — so nothing is shown twice.
  const hasBrief = !!(brief && brief.brief);
  const standfirst = hasBrief ? brief.brief : (bullets[0] || "");
  const bodyBullets = hasBrief ? bullets : bullets.slice(1);

  document.getElementById("footer-updated").textContent = L.date;
  const pill = document.getElementById("report-pill");
  if (pill) pill.innerHTML = `<span class="pulse"></span>No. ${issueNo} · ${L.date}`;

  // HERO
  const hero = `<div class="report-hero panel fade">
    <div class="hero-art">${classicalScene()}</div>
    <div class="hero-body">
      <div class="hero-meta">
        <span class="kicker">每日研究 · DAILY BRIEF</span>
        <span class="dotsep">·</span><span>${weekdayCN(L.date)}</span>
        <span class="dotsep">·</span><span>${readMins} 分钟阅读</span>
      </div>
      <h2 class="hero-title">${esc(L.title || "BTC 市场参与者日报")}</h2>
      <p class="hero-stand">${esc(standfirst)}</p>
      <div class="byline">
        <div class="avatar">${laurelAvatar()}</div>
        <div><div class="by-name">Rising Capital</div><div class="by-handle mono">${esc(DASH.meta.handle)}</div></div>
        <div class="spacer"></div>
        <button class="read-btn" onclick="document.getElementById('market-summary').scrollIntoView({behavior:'smooth'})">阅读全文 →</button>
      </div>
    </div></div>`;

  // ARTICLE — agora figure (top) → key points (bulleted) → the post's real charts
  const pointsHTML = bodyBullets.map((b) => `<li>${esc(b)}</li>`).join("");
  const charts = (L.charts || []).filter((c) => c.filename);
  const chartFigs = charts.length ? `<div class="article-charts">${charts.map((c) => {
    const src = CHARTS_BASE + c.filename;
    return `<figure style="margin:0"><img src="${esc(src)}" alt="${esc(c.caption || "")}" loading="lazy" onclick="openLightbox('${esc(src)}')" onerror="this.style.display='none'"/>${c.caption || c.source ? `<div class="cap">${esc([c.caption, c.source].filter(Boolean).join(" · "))}</div>` : ""}</figure>`;
  }).join("")}</div>` : "";

  const articleBody = `<article class="article">
    <div class="article-figure" style="margin-top:0"><div class="fig-art">${agoraStill()}</div>
      <span class="fig-cap">图 · 五类市场参与者如集市中的摊主——ETF、机构、长期持有者、矿工与衍生品交易者各自定价、彼此博弈</span></div>
    ${pointsHTML ? `<ul class="article-points">${pointsHTML}</ul>` : ""}
    ${chartFigs}
  </article>`;
  const articlePanel = `<div id="market-summary" class="span-2">` + panel({ title: "市场综述", sub: `${L.date} · No. ${issueNo}`, className: "fade", body: articleBody }) + `</div>`;

  // HISTORY
  const histItems = rest.map((h, i) => {
    const m = verdictMeta(h.verdict);
    const title = h.title && h.title !== "BTC市场参与者日报" ? h.title : (h.bullets && h.bullets[0] ? h.bullets[0].slice(0, 40) : "BTC 市场参与者日报");
    const tags = [tagForBullet((h.bullets && h.bullets[0]) || ""), h.verdict].filter(Boolean);
    return `<a class="hist-item" onclick="return false">
      <div class="hist-date num">${esc(h.date.slice(5))}</div>
      <div class="hist-main"><div class="hist-title">${esc(title)}</div>
        <div class="hist-tags">${tags.map((t) => `<span class="t-tag">${esc(t)}</span>`).join("")}<span class="hist-issue mono">No.${issueNo - 1 - i}</span></div></div>
      ${delta(m.delta)}</a>`;
  }).join("");
  const historyPanel = panel({
    title: "历史记录", sub: "过往日报", className: "fade",
    right: `<span class="seg"><button data-on="true">全部</button></span>`,
    body: `<div class="history">${histItems || `<div class="empty-note" style="padding:20px 0">暂无历史记录</div>`}</div>`,
  });

  // VERDICT METER — 5-tier scale driven by the post's verdict
  const vLevelMap = { "极度看空": 1, "偏空": 2, "中性": 3, "偏多": 4, "极度看多": 5 };
  const vLevel = vLevelMap[L.verdict] || 3;
  const vIdx = vLevel - 1;
  const vLabels = ["极度看空", "偏空", "中性", "偏多", "极度看多"];
  const vBase = ["--neg", "--neg", "--text-3", "--pos", "--pos"];
  const vActiveAlpha = [100, 72, 85, 72, 100];
  const vTone = vLevel <= 2 ? "var(--neg)" : vLevel >= 4 ? "var(--pos)" : "var(--text-2)";
  const vSegs = [0, 1, 2, 3, 4].map((i) => {
    const a = i === vIdx ? vActiveAlpha[i] : 18;
    return `<div style="flex:1;height:9px;border-radius:3px;background:color-mix(in oklab, var(${vBase[i]}) ${a}%, transparent)"></div>`;
  }).join("");
  const vLabs = vLabels.map((t, i) => `<span style="flex:1;${i === vIdx ? `color:${vTone};font-weight:600` : ""}">${t}</span>`).join("");
  const vPointer = ((vIdx + 0.5) / 5) * 100;
  const vStateLabel = (brief && brief.state_label) ? brief.state_label : "";
  const verdictPanel = panel({
    title: "市场判断", className: "fade",
    right: `<span class="panel-sub">No.${issueNo}</span>`,
    body: `
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:16px">
        <span style="font-size:24px;font-weight:700;letter-spacing:-0.01em;color:${vTone}">${esc(L.verdict)}</span>
        ${vStateLabel ? `<span style="font-size:12px;color:var(--text-3)">${esc(vStateLabel)}</span>` : ""}
      </div>
      <div style="position:relative;margin-bottom:9px">
        <div style="position:absolute;top:-9px;left:${vPointer}%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${vTone}"></div>
        <div style="display:flex;gap:4px">${vSegs}</div>
      </div>
      <div style="display:flex;gap:4px;font-size:10.5px;color:var(--text-3);text-align:center">${vLabs}</div>`,
  });
  const sidebar = `<div style="display:flex;flex-direction:column;gap:var(--gap)">${verdictPanel}${historyPanel}</div>`;

  document.getElementById("report-body").innerHTML =
    hero +
    `<div class="grid cols-3" style="margin-top:var(--gap)">${articlePanel}${sidebar}</div>` +
    source("编辑部综合 · SoSoValue / CoinGlass / Glassnode");
}

// =====================================================
//  SHELL: nav, ticker, theme, routing
// =====================================================
const SECTIONS = [
  { id: "report", label: "今日报告", render: renderReport, async: true },
  { id: "etf", label: "ETF 资金流", render: renderETF, async: true },
  { id: "inst", label: "Strategy (MSTR)", render: renderInst, async: true },
  { id: "deriv", label: "衍生品市场", render: renderDeriv },
  { id: "miner", label: "矿工", render: renderMiner },
  { id: "onchain", label: "链上指标", render: renderOnchain },
];

function segMarkup(options, active) {
  return `<span class="seg">${options.map((o) => `<button data-on="${o === active}">${esc(o)}</button>`).join("")}</span>`;
}

function buildNav() {
  document.getElementById("nav").innerHTML = SECTIONS.map((s) =>
    `<button class="nav-tab" data-id="${s.id}" data-active="false"><span class="nav-dot"></span>${esc(s.label)}</button>`).join("");
  document.querySelectorAll(".nav-tab").forEach((btn) =>
    btn.addEventListener("click", () => setActive(btn.dataset.id)));
}

function buildTicker() {
  const dotFor = (tone) => TONE[tone] || TONE.neutral;
  const row = (k) => DASH.news.map((n, i) =>
    `<div class="ticker-item" key="${k}${i}"><span class="t-dot" style="background:${dotFor(n.tone)}"></span><span class="t-tag">${esc(n.tag)}</span><span class="t-text">${esc(n.text)}</span><span class="t-time">${esc(n.time)}</span></div>`).join("");
  document.getElementById("ticker").innerHTML = row("a") + row("b");
}

let _current = null;
function setActive(id) {
  if (_current === id) return;
  _current = id;
  document.querySelectorAll(".nav-tab").forEach((b) => b.setAttribute("data-active", String(b.dataset.id === id)));
  const view = document.getElementById("view");
  const sec = SECTIONS.find((s) => s.id === id) || SECTIONS[0];
  // re-trigger fade animation
  view.classList.remove("fade"); void view.offsetWidth; view.classList.add("fade");
  if (sec.async) { sec.render(); }
  else { view.innerHTML = sec.render(); initChartHovers(view); }
}

// ── live BTC chip ─────────────────────────────────────
async function fetchBTCPrice() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
    if (!res.ok) throw 0;
    const d = await res.json();
    return { price: parseFloat(d.lastPrice), change_pct: parseFloat(d.priceChangePercent) };
  } catch (_) {}
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true");
    if (!res.ok) throw 0;
    const d = await res.json();
    return { price: d.bitcoin.usd, change_pct: d.bitcoin.usd_24h_change };
  } catch (_) {}
  return null;
}
function renderBTCChip(data) {
  const el = document.getElementById("btc-chip");
  if (!el) return;
  if (!data) { el.innerHTML = `<span class="dot"></span><span class="num" style="font-weight:600">BTC --</span>`; return; }
  DASH.meta.btcPrice = data.price; DASH.meta.btcChange = +data.change_pct.toFixed(2);
  const price = "$" + Math.round(data.price).toLocaleString("en-US");
  const chg = data.change_pct;
  el.innerHTML = `<span class="dot"></span><span class="num" style="font-weight:600">BTC ${price}</span>
    <span class="num ${chg >= 0 ? "pos" : "neg"}" style="font-size:12px">${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%</span>`;
}
async function initBTCChip() {
  renderBTCChip(await fetchBTCPrice());
  setInterval(async () => renderBTCChip(await fetchBTCPrice()), 30_000);
}

// ── theme toggle ──────────────────────────────────────
function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem("htx-theme");
  if (saved) root.setAttribute("data-theme", saved);
  const btn = document.getElementById("theme-toggle");
  const sync = () => { btn.textContent = root.getAttribute("data-theme") === "dark" ? "☾" : "☀"; };
  sync();
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("htx-theme", next);
    sync();
  });
}

// ── chart hover tooltips ──────────────────────────────
function ensureTip() {
  let t = document.getElementById("chart-tip");
  if (!t) { t = document.createElement("div"); t.id = "chart-tip"; t.className = "chart-tip"; document.body.appendChild(t); }
  return t;
}
function initChartHovers(root) {
  const tip = ensureTip();
  // line / area / bar charts
  root.querySelectorAll(".chart-hit[data-points]").forEach((el) => {
    let pts; try { pts = JSON.parse(el.dataset.points); } catch (_) { return; }
    if (!pts.length) return;
    const guide = el.querySelector(".hit-line");
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const rel = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const p = pts[Math.round(rel * (pts.length - 1))];
      if (!p) return;
      tip.innerHTML = `<div class="tt-label">${esc(p.l)}</div><div class="tt-val">${esc(p.v)}</div>`;
      tip.style.left = e.clientX + "px";
      tip.style.top = r.top + "px";
      tip.style.transform = "translate(-50%, -112%)";
      tip.style.opacity = "1";
      if (guide) { guide.style.left = (rel * 100) + "%"; guide.style.opacity = "0.6"; }
    });
    el.addEventListener("mouseleave", () => { tip.style.opacity = "0"; if (guide) guide.style.opacity = "0"; });
  });
  // donut segments
  root.querySelectorAll("[data-seg]").forEach((seg) => {
    seg.addEventListener("mousemove", (e) => {
      tip.innerHTML = `<div class="tt-label">${esc(seg.dataset.label)}</div><div class="tt-val">${esc(seg.dataset.val)}</div>`;
      tip.style.left = e.clientX + "px";
      tip.style.top = e.clientY + "px";
      tip.style.transform = "translate(-50%, -132%)";
      tip.style.opacity = "1";
    });
    seg.addEventListener("mouseleave", () => { tip.style.opacity = "0"; });
  });
}

// ── lightbox ──────────────────────────────────────────
window.openLightbox = function (src) {
  document.getElementById("lightbox-img").src = src;
  document.getElementById("lightbox").classList.add("active");
  document.body.style.overflow = "hidden";
};
window.closeLightbox = function () {
  document.getElementById("lightbox").classList.remove("active");
  document.getElementById("lightbox-img").src = "";
  document.body.style.overflow = "";
};
document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.closeLightbox(); });

// =====================================================
//  BOOT
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  buildNav();
  buildTicker();
  initBTCChip();
  document.getElementById("brand-home").addEventListener("click", (e) => { e.preventDefault(); setActive("report"); });
  setActive("report");
});
