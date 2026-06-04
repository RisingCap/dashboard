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
  const colorMap = { "偏多": "green", "偏空": "red", "中性": "neutral" };
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

  // Source post (not publicly displayed)
  const sourcePost = document.getElementById("source-post").value.trim();

  const entry = {
    id:            date,
    date:          date,
    title:         "BTC市场参与者日报",
    verdict:       verdict,
    verdict_color: verdictColor,
    bullets:       bullets,
    source_post:   sourcePost,
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

// ── Set default date to today ─────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("post-date").value = today;

  // Seed with one empty bullet and one empty chart row
  addBulletRow();
  addChartRow();
});
