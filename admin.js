// =====================================================
//  Rising Capital Dashboard — admin.js
//  Local-use admin form logic.
//  Generates JSON entry for copy-paste into posts.json.
// =====================================================

// ── Dynamic bullet rows ───────────────────────────────

function addBulletRow(text = "") {
  const list = document.getElementById("bullets-list");
  const row  = document.createElement("div");
  row.className = "dynamic-row";
  row.innerHTML = `
    <input type="text" placeholder="输入要点内容…" value="${escAttr(text)}"/>
    <button type="button" class="btn-remove-row" onclick="this.closest('.dynamic-row').remove()" title="删除">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>`;
  list.appendChild(row);
  row.querySelector("input").focus();
}

// ── Dynamic chart rows ────────────────────────────────

function addChartRow() {
  const list = document.getElementById("charts-list");
  const row  = document.createElement("div");
  row.className = "chart-row-group";
  row.innerHTML = `
    <div class="chart-row-sub">
      <input type="text" placeholder="文件名，例：2026-06-04-etf-flow.png" class="chart-filename"/>
      <button type="button" class="btn-remove-row" onclick="this.closest('.chart-row-group').remove()" title="删除">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
    <div class="chart-row-sub">
      <input type="text" placeholder="图表说明，例：ETF资金流向" class="chart-caption"/>
      <select class="chart-source">
        <option value="SoSoValue">SoSoValue</option>
        <option value="CoinGlass">CoinGlass</option>
        <option value="Glassnode">Glassnode</option>
        <option value="Hyperliquid">Hyperliquid</option>
        <option value="Velo">Velo</option>
        <option value="Hashrate Index">Hashrate Index</option>
        <option value="其他">其他</option>
      </select>
    </div>`;
  list.appendChild(row);
  row.querySelector(".chart-filename").focus();
}

// ── Escape helper ─────────────────────────────────────

function escAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Auto-convert tweet text to bullet points ──────────

function autoConvertTweet() {
  const src = document.getElementById("source-post").value.trim();
  if (!src) {
    alert("请先在「原始推文」输入框中粘贴推文内容");
    return;
  }

  // Split on newlines, then on ". " for long sentences
  const rawLines = src.split(/\n+/);
  const bullets  = [];

  rawLines.forEach(line => {
    line = line.trim();
    if (!line) return;
    // Skip lines that look like metadata / tags / handles
    if (/^[@#]/.test(line)) return;
    if (/^(net pressure|source:|snapshot)/i.test(line)) return;
    if (line.length < 10) return;

    // Split long lines on period+space boundaries
    const subs = line.split(/(?<=[一-龥a-z0-9%$])\. (?=[A-Z一-龥])/);
    subs.forEach(s => {
      s = s.trim().replace(/\.$/, "");
      if (s.length >= 8) bullets.push(s);
    });
  });

  if (bullets.length === 0) {
    alert("未能自动识别出要点，请手动填写");
    return;
  }

  // Clear existing bullet rows
  document.getElementById("bullets-list").innerHTML = "";
  bullets.forEach(b => addBulletRow(b));
}

// ── Generate JSON entry ───────────────────────────────

function generateJSON() {
  const date    = document.getElementById("post-date").value;
  const verdict = document.getElementById("post-verdict").value;

  if (!date) {
    alert("请选择日期");
    return;
  }

  // Verdict color mapping
  const colorMap = {
    "极度看多": "very_bullish",
    "偏多":    "green",
    "中性":    "neutral",
    "偏空":    "red",
    "极度看空": "very_bearish"
  };
  const verdictColor = colorMap[verdict] || "neutral";

  // Bullets
  const bulletInputs = document.querySelectorAll("#bullets-list .dynamic-row input");
  const bullets = Array.from(bulletInputs)
    .map(i => i.value.trim())
    .filter(Boolean);

  // Charts
  const chartGroups = document.querySelectorAll("#charts-list .chart-row-group");
  const charts = Array.from(chartGroups).map(g => ({
    filename: g.querySelector(".chart-filename").value.trim(),
    caption:  g.querySelector(".chart-caption").value.trim(),
    source:   g.querySelector(".chart-source").value
  })).filter(c => c.filename);

  // Indicators
  const indicators = {
    btc_price:    document.getElementById("ind-price").value.trim(),
    funding_rate: document.getElementById("ind-funding").value.trim(),
    etf_flow:     document.getElementById("ind-etf").value.trim(),
    oi:           document.getElementById("ind-oi").value.trim()
  };

  const entry = {
    id:            date,
    date:          date,
    title:         "BTC市场参与者日报",
    verdict:       verdict,
    verdict_color: verdictColor,
    bullets:       bullets,
    charts:        charts,
    indicators:    indicators
  };

  const json = JSON.stringify(entry, null, 2);
  const output = document.getElementById("json-output");
  output.value = json;
  output.closest(".admin-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Copy JSON to clipboard ────────────────────────────

function copyJSON() {
  const output = document.getElementById("json-output");
  if (!output.value.trim()) {
    alert("请先点击「生成JSON条目」");
    return;
  }
  navigator.clipboard.writeText(output.value).then(() => {
    const btn = document.getElementById("copy-json-btn");
    const orig = btn.textContent;
    btn.textContent = "已复制 ✓";
    btn.style.background = "rgba(22,163,74,0.25)";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
    }, 2000);
  }).catch(() => {
    output.select();
    document.execCommand("copy");
  });
}

// ══════════════════════════════════════════════════════
//  V2 — ETF流入 JSON generator
// ══════════════════════════════════════════════════════

function generateETFJson() {
  const date   = document.getElementById("etf-date").value;
  const flow   = parseFloat(document.getElementById("etf-flow-val").value);
  const source = document.getElementById("etf-source").value;
  const note   = document.getElementById("etf-note").value.trim();

  if (!date || isNaN(flow)) {
    alert("请填写日期和净流入金额");
    return;
  }

  const sign  = flow >= 0 ? "+" : "";
  const label = sign + "$" + Math.abs(flow).toFixed(2) + "M";

  const entry = { date, net_flow_usd_million: flow, label, source, note };
  document.getElementById("etf-json-output").value = JSON.stringify(entry, null, 2);
}

function copyETFJson() {
  copyFromTextarea("etf-json-output", "etf-copy-btn");
}

// ══════════════════════════════════════════════════════
//  V2 — 市场简报 JSON generator
// ══════════════════════════════════════════════════════

// Auto-fill brief form from latest post in posts.json
async function autoGenerateBrief() {
  const btn = document.getElementById("brief-auto-btn");
  btn.textContent = "读取中…";
  btn.disabled = true;

  try {
    const res = await fetch("data/posts.json?v=" + Date.now());
    if (!res.ok) throw new Error("无法读取 posts.json");
    const posts = await res.json();
    if (!posts || posts.length === 0) throw new Error("posts.json 为空");

    // Get latest post
    posts.sort((a, b) => b.date.localeCompare(a.date));
    const latest = posts[0];

    // Set date to today
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("brief-date").value = today;

    // Map verdict → stance dropdown value
    const verdictToStance = {
      "极度看多": "极度看多", "偏多": "偏多",
      "中性": "中性",
      "偏空": "偏空", "极度看空": "极度看空"
    };
    const stance = verdictToStance[latest.verdict] || "中性";
    document.getElementById("brief-stance").value = stance;

    // Auto state label from verdict
    const labelMap = {
      "极度看多": "强势多头 / 趋势明确",
      "偏多":    "结构性偏多 / 需持续观察",
      "中性":    "方向待定 / 关注宏观",
      "偏空":    "结构性偏空 / 注意风险",
      "极度看空": "高风险区间 / 防御为主"
    };
    document.getElementById("brief-state-label").value = labelMap[latest.verdict] || "";

    // Join bullets into a brief paragraph
    const bullets = latest.bullets || [];
    const brief = bullets.join("。") + (bullets.length ? "。" : "");
    document.getElementById("brief-text").value = brief;

    btn.textContent = "✓ 已从最新日报生成，请检查并编辑后再保存";
    btn.style.background = "rgba(22,163,74,0.15)";
    btn.style.borderColor = "#16a34a";
    btn.style.color = "#16a34a";
  } catch (err) {
    alert("自动生成失败：" + err.message);
    btn.textContent = "从最新日报自动生成";
  } finally {
    btn.disabled = false;
  }
}

function generateBriefJson() {
  const date        = document.getElementById("brief-date").value;
  const state_label = document.getElementById("brief-state-label").value.trim();
  const brief       = document.getElementById("brief-text").value.trim();
  const stance      = document.getElementById("brief-stance").value;

  if (!date || !brief) {
    alert("请填写日期和简报内容");
    return;
  }

  const colorMap = { "偏多": "bull", "极度看多": "bull", "偏空": "bear", "极度看空": "bear", "中性": "neutral" };
  const entry = { date, state_label, brief, stance, stance_color: colorMap[stance] || "neutral" };
  document.getElementById("brief-json-output").value = JSON.stringify(entry, null, 2);
}

function copyBriefJson() {
  copyFromTextarea("brief-json-output", "brief-copy-btn");
}

// ══════════════════════════════════════════════════════
//  V2 — 指标快照 JSON generator (OI only)
//  BTC price → live Binance   (no manual input needed)
//  Fear & Greed → live Alt.me (no manual input needed)
//  ETF flow → etf.json form   (Section 7)
//  OI → this form only
// ══════════════════════════════════════════════════════

function generateMetricsJson() {
  const date      = document.getElementById("metrics-date").value;
  const oi_value  = document.getElementById("oi-value").value.trim();
  const oi_delta  = document.getElementById("oi-delta").value.trim();
  const oi_dir    = document.getElementById("oi-dir").value;
  const oi_source = document.getElementById("oi-source").value.trim();

  if (!date) { alert("请填写日期"); return; }

  const entry = { date, oi_value, oi_delta, oi_delta_dir: oi_dir, oi_source };
  document.getElementById("metrics-json-output").value = JSON.stringify(entry, null, 2);
}

function copyMetricsJson() {
  copyFromTextarea("metrics-json-output", "metrics-copy-btn");
}

// ── Shared copy helper ────────────────────────────────

function copyFromTextarea(textareaId, btnId) {
  const ta  = document.getElementById(textareaId);
  const btn = document.getElementById(btnId);
  if (!ta.value.trim()) { alert("请先点击「生成JSON」"); return; }
  navigator.clipboard.writeText(ta.value).then(() => {
    const orig = btn.textContent;
    btn.textContent = "已复制 ✓";
    btn.style.background = "rgba(22,163,74,0.25)";
    setTimeout(() => { btn.textContent = orig; btn.style.background = ""; }, 2000);
  }).catch(() => { ta.select(); document.execCommand("copy"); });
}

// ── Set default date to today ─────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("post-date").value = today;

  // Pre-fill v2 date fields
  ["etf-date", "brief-date", "metrics-date"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });

  // Seed with one empty bullet and one empty chart row
  addBulletRow();
  addChartRow();
});
