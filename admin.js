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
        <option value="TradingView">TradingView</option>
        <option value="X">X</option>
        <option value="CheckOnChain">CheckOnChain</option>
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

// ── Generate JSON entry ───────────────────────────────

function generateJSON() {
  const date    = document.getElementById("post-date").value;
  const verdict = document.getElementById("post-verdict").value;
  const title   = document.getElementById("post-title").value.trim();

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

  const entry = {
    id:            date,
    date:          date,
    title:         title || "BTC市场参与者日报",
    verdict:       verdict,
    verdict_color: verdictColor,
    bullets:       bullets,
    charts:        charts
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

// ══════════════════════════════════════════════════════
//  市场简报 JSON generator
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

  // Pre-fill date fields
  ["brief-date"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });

  // Theme toggle (matches dashboard)
  const root = document.documentElement;
  const saved = localStorage.getItem("htx-theme");
  if (saved) root.setAttribute("data-theme", saved);
  const tbtn = document.getElementById("theme-toggle");
  if (tbtn) {
    const sync = () => { tbtn.textContent = root.getAttribute("data-theme") === "dark" ? "☾" : "☀"; };
    sync();
    tbtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("htx-theme", next);
      sync();
    });
  }

  // Seed with one empty bullet and one empty chart row
  addBulletRow();
  addChartRow();
});
