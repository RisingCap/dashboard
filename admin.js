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

  // Strategy 财库 form (Section 6)
  initStrategyForm();
});

// ══════════════════════════════════════════════════════
//  Strategy 财库 (strategy.json) — Section 6
//  Prefills from the current data/strategy.json so a weekly
//  update is edit-what-changed, not retype-everything.
// ══════════════════════════════════════════════════════

const ST_SERIES = ["STRK", "STRF", "STRD", "STRC", "STRE"];

const stUSD = (v) => {
  const n = Math.abs(v);
  if (n >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M";
  return "$" + Math.round(v).toLocaleString();
};

function stBuildPrefRows() {
  const tbody = document.getElementById("st-pref-rows");
  if (!tbody) return;
  tbody.innerHTML = ST_SERIES.map((tk, i) => `
    <tr>
      <td><span class="tk">${tk}</span></td>
      <td><input type="text" id="st-p-${i}-name" placeholder="名称" style="min-width:130px;"/></td>
      <td class="r"><input type="number" id="st-p-${i}-shares" placeholder="股数" style="width:130px;text-align:right;" oninput="stRecalcDivs()"/></td>
      <td class="r"><input type="number" id="st-p-${i}-rate" step="0.01" placeholder="%" style="width:80px;text-align:right;" oninput="stRecalcDivs()"/></td>
      <td class="r num" id="st-p-${i}-div" style="color:var(--text-2);white-space:nowrap;">—</td>
    </tr>`).join("");
}

// annual div per series = shares × $100 liq pref × rate%
function stRecalcDivs() {
  ST_SERIES.forEach((_, i) => {
    const sh = parseFloat(document.getElementById(`st-p-${i}-shares`).value);
    const rate = parseFloat(document.getElementById(`st-p-${i}-rate`).value);
    const cell = document.getElementById(`st-p-${i}-div`);
    cell.textContent = (isFinite(sh) && isFinite(rate)) ? stUSD(sh * 100 * (rate / 100)) : "—";
  });
}

async function initStrategyForm() {
  if (!document.getElementById("st-pref-rows")) return;
  stBuildPrefRows();
  const status = document.getElementById("st-load-status");
  try {
    const res = await fetch("data/strategy.json?v=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    const d = await res.json();

    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.value = v; };
    set("st-updated", d.updated);
    set("st-yield", d.btc_yield_ytd_pct);
    set("st-holdings", d.btc && d.btc.holdings);
    set("st-cost", d.btc && d.btc.cost_basis_avg);
    set("st-shares-basic", d.shares_basic);
    set("st-shares-diluted", d.shares_diluted);
    const M = (v) => v != null ? +(v / 1e6).toFixed(1) : null;
    set("st-debt", M(d.capital && d.capital.debt_usd));
    set("st-pref-value", M(d.capital && d.capital.pref_value_usd));
    set("st-reserve", M(d.reserves && d.reserves.usd_reserve_usd));
    set("st-div-total", M(d.reserves && d.reserves.annual_dividends_total_usd));
    set("st-strc-div", M(d.reserves && d.reserves.strc_annual_div_usd));

    (d.preferreds || []).forEach((p) => {
      const i = ST_SERIES.indexOf(p.ticker);
      if (i < 0) return;
      set(`st-p-${i}-name`, p.name);
      set(`st-p-${i}-shares`, p.shares);
      const rate = parseFloat(String(p.coupon).replace(/[^\d.]/g, ""));
      if (isFinite(rate)) set(`st-p-${i}-rate`, rate);
    });
    stRecalcDivs();

    const k = d.latest_8k || {};
    set("st-8k-date", k.date);
    set("st-8k-strc", M(k.strc_issued_week_usd));
    set("st-8k-btcweek", k.btc_bought_week);
    set("st-8k-btcusd", M(k.btc_bought_usd));

    if (status) status.innerHTML = `✓ 已载入当前 <code>strategy.json</code>（${d.updated || "?"}）— 只需修改变化的字段。带 <strong>$M</strong> 的字段以<strong>百万美元</strong>为单位。`;
  } catch (err) {
    if (status) status.innerHTML = `⚠️ 无法载入当前 strategy.json（${err.message}）— 请完整填写。带 <strong>$M</strong> 的字段以<strong>百万美元</strong>为单位。`;
  }
}

function generateStrategyJson() {
  const num = (id) => { const v = parseFloat(document.getElementById(id).value); return isFinite(v) ? v : null; };
  const str = (id) => document.getElementById(id).value.trim();
  const fromM = (id) => { const v = num(id); return v != null ? Math.round(v * 1e6) : null; };

  const updated = str("st-updated");
  const holdings = num("st-holdings");
  if (!updated || holdings == null) { alert("请填写数据日期与 BTC 持仓"); return; }

  const preferreds = ST_SERIES.map((tk, i) => {
    const shares = num(`st-p-${i}-shares`) || 0;
    const rate = num(`st-p-${i}-rate`);
    return {
      ticker: tk,
      name: str(`st-p-${i}-name`) || tk,
      shares: shares,
      coupon: rate != null ? rate.toFixed(2) + "%" : "—",
      liq_pref: 100,
      annual_div_usd: rate != null ? Math.round(shares * 100 * (rate / 100)) : 0,
    };
  });

  const entry = {
    updated: updated,
    btc: { holdings: holdings, cost_basis_avg: num("st-cost") },
    shares_basic: num("st-shares-basic"),
    shares_diluted: num("st-shares-diluted"),
    btc_yield_ytd_pct: num("st-yield"),
    capital: { debt_usd: fromM("st-debt"), pref_value_usd: fromM("st-pref-value") },
    reserves: {
      usd_reserve_usd: fromM("st-reserve"),
      annual_dividends_total_usd: fromM("st-div-total"),
      strc_annual_div_usd: fromM("st-strc-div"),
    },
    preferreds: preferreds,
    latest_8k: {
      date: str("st-8k-date") || updated,
      strc_issued_week_usd: fromM("st-8k-strc") || 0,
      btc_bought_week: num("st-8k-btcweek") || 0,
      btc_bought_usd: fromM("st-8k-btcusd") || 0,
      btc_cumulative: holdings,
    },
  };

  document.getElementById("st-json-output").value = JSON.stringify(entry, null, 2);
}

function copyStrategyJson() {
  copyFromTextarea("st-json-output", "st-copy-btn");
}

// ══════════════════════════════════════════════════════
//  Direct save → /api/save-file → GitHub commit → Vercel deploy
//  Works on the deployed admin page (needs the /api functions);
//  on the local python server it falls back with a clear message.
// ══════════════════════════════════════════════════════

function adminPassword(forceAsk) {
  let pw = localStorage.getItem("htx-admin-pw");
  if (!pw || forceAsk) {
    pw = prompt("管理密码（仅首次输入，之后记住在本浏览器）：");
    if (pw) localStorage.setItem("htx-admin-pw", pw);
  }
  return pw;
}

async function saveToSite(path, content, btn, message) {
  const pw = adminPassword(false);
  if (!pw) return;
  const orig = btn.textContent;
  btn.textContent = "保存中…";
  btn.disabled = true;
  try {
    const res = await fetch("/api/save-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw, path, content, message }),
    });
    let j = {};
    try { j = await res.json(); } catch (_) {}
    if (res.status === 401) {
      localStorage.removeItem("htx-admin-pw");
      throw new Error("密码错误，请重试（将重新询问）");
    }
    if (!res.ok) throw new Error(j.error || ("HTTP " + res.status));
    btn.textContent = "已保存 ✓ 部署中 (~1分钟)";
    btn.style.background = "rgba(22,163,74,0.2)";
    setTimeout(() => { btn.textContent = orig; btn.style.background = ""; btn.disabled = false; }, 5000);
  } catch (err) {
    btn.textContent = orig;
    btn.disabled = false;
    const hint = location.hostname === "localhost" || location.hostname === "127.0.0.1"
      ? "\n\n提示：本地 python 服务器没有 /api，直接保存只在部署后的 admin 页面可用（https://你的域名/admin.html）。本地请继续用「复制」。"
      : "";
    alert("保存失败：" + err.message + hint);
  }
}

// posts.json — prepend the generated entry (replacing same-id entry if it exists)
async function savePostToSite(btn) {
  const out = document.getElementById("json-output").value.trim();
  if (!out) { alert("请先点击「生成 JSON 条目」"); return; }
  let entry;
  try { entry = JSON.parse(out); } catch (e) { alert("生成的 JSON 无效：" + e.message); return; }
  let posts;
  try {
    const res = await fetch("data/posts.json?v=" + Date.now());
    if (!res.ok) throw new Error("HTTP " + res.status);
    posts = await res.json();
    if (!Array.isArray(posts)) throw new Error("posts.json 不是数组");
  } catch (e) { alert("无法读取当前 posts.json：" + e.message); return; }
  const filtered = posts.filter((p) => p.id !== entry.id);
  const replaced = filtered.length !== posts.length;
  filtered.unshift(entry);
  if (replaced && !confirm(`已存在 ${entry.id} 的日报，保存将覆盖它。继续？`)) return;
  await saveToSite("data/posts.json", JSON.stringify(filtered, null, 2), btn, `admin: post ${entry.id}`);
}

async function saveBriefToSite(btn) {
  const out = document.getElementById("brief-json-output").value.trim();
  if (!out) { alert("请先点击「生成 market_brief.json」"); return; }
  await saveToSite("data/market_brief.json", out, btn, "admin: update market brief");
}

async function saveStrategyToSite(btn) {
  const out = document.getElementById("st-json-output").value.trim();
  if (!out) { alert("请先点击「生成 strategy.json」"); return; }
  await saveToSite("data/strategy.json", out, btn, "admin: update strategy fundamentals");
}
