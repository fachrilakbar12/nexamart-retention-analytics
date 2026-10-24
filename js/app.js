/**
 * NexaMart Analytics - Application Logic
 * Customer Retention, Cohort Matrix & RFM Churn Analytics Dashboard
 */

// State Management
let filteredRecords = typeof rawCustomerData !== 'undefined' ? [...rawCustomerData] : [];
let currentPage = 1;
const itemsPerPage = 10;
let sortKey = 'id';
let sortAsc = true;

// Chart.js Instances
let revenueChurnChart = null;
let rfmDonutChart = null;

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  renderCohortHeatmap();
  runFilterPipeline();
  updateSimulator();
});

/**
 * 1. Tab Navigation System
 * Switches between Executive BI Dashboard, Data Explorer, SQL & Python Pipeline, and Executive Story
 */
function setTab(tabId) {
  const allTabs = ['dashboard', 'data', 'tech', 'story'];
  allTabs.forEach(t => {
    const tabEl = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-btn-${t}`);
    const mNavBtn = document.getElementById(`m-nav-${t}`);

    if (t === tabId) {
      if (tabEl) tabEl.classList.remove('hidden');
      if (navBtn) {
        navBtn.className = "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm transition-all";
      }
      if (mNavBtn) {
        mNavBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white whitespace-nowrap";
      }
    } else {
      if (tabEl) tabEl.classList.add('hidden');
      if (navBtn) {
        navBtn.className = "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition-all";
      }
      if (mNavBtn) {
        mNavBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 whitespace-nowrap";
      }
    }
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * 2. Multi-Dimensional Filter Pipeline
 * Filters customer records across Channel, RFM Segment, and Product Category
 */
function runFilterPipeline() {
  const channelEl = document.getElementById('filter-channel');
  const segmentEl = document.getElementById('filter-segment');
  const categoryEl = document.getElementById('filter-category');

  const channelVal = channelEl ? channelEl.value : 'SEMUA';
  const segmentVal = segmentEl ? segmentEl.value : 'SEMUA';
  const categoryVal = categoryEl ? categoryEl.value : 'SEMUA';

  filteredRecords = rawCustomerData.filter(item => {
    const matchChannel = (channelVal === 'SEMUA' || item.channel === channelVal);
    const matchSegment = (segmentVal === 'SEMUA' || item.segment === segmentVal);
    const matchCategory = (categoryVal === 'SEMUA' || item.category === categoryVal);
    return matchChannel && matchSegment && matchCategory;
  });

  currentPage = 1;
  updateKPICards(filteredRecords);
  renderDashboardCharts(filteredRecords);
  renderTable();
}

/**
 * Reset all active filters back to default
 */
function resetGlobalFilters() {
  const channelEl = document.getElementById('filter-channel');
  const segmentEl = document.getElementById('filter-segment');
  const categoryEl = document.getElementById('filter-category');

  if (channelEl) channelEl.value = 'SEMUA';
  if (segmentEl) segmentEl.value = 'SEMUA';
  if (categoryEl) categoryEl.value = 'SEMUA';

  runFilterPipeline();
  showToast("Filter analitik berhasil direset ke kondisi awal.");
}

/**
 * 3. Update KPI Metric Cards
 */
function updateKPICards(data) {
  const totalRev = data.reduce((acc, cur) => acc + cur.monetary, 0);
  const totalCust = data.length;
  const avgCLV = totalCust > 0 ? (totalRev / totalCust) : 0;
  const avgChurn = totalCust > 0 ? (data.reduce((acc, cur) => acc + cur.churnProb, 0) / totalCust).toFixed(1) : "0.0";

  // Indonesian Rupiah Formatter
  const formatRupiah = (num) => "Rp" + Math.round(num).toLocaleString('id-ID');

  const kpiRevEl = document.getElementById('kpi-revenue');
  const kpiClvEl = document.getElementById('kpi-clv');
  const kpiChurnEl = document.getElementById('kpi-churn');
  const kpiRetEl = document.getElementById('kpi-retention');

  if (kpiRevEl) kpiRevEl.innerText = formatRupiah(totalRev);
  if (kpiClvEl) kpiClvEl.innerText = formatRupiah(avgCLV);
  if (kpiChurnEl) kpiChurnEl.innerText = avgChurn + "%";

  if (kpiRetEl) {
    if (data.length === rawCustomerData.length) {
      kpiRetEl.innerText = "31,2%";
    } else {
      const loyalCount = data.filter(d => d.segment === 'Champions' || d.segment === 'Loyal Customers').length;
      const dynRate = totalCust > 0 ? ((loyalCount / totalCust) * 100).toFixed(1) : "0.0";
      kpiRetEl.innerText = dynRate + "%";
    }
  }
}

/**
 * 4. Render Cohort Retention Heatmap
 */
function renderCohortHeatmap() {
  const tbody = document.getElementById('cohort-table-body');
  if (!tbody || typeof cohortMatrix === 'undefined') return;
  tbody.innerHTML = '';

  cohortMatrix.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-800/30 transition";

    const formatCell = (val) => {
      if (val === null || val === undefined) return '<td class="py-2.5 px-2 text-slate-600">-</td>';
      let colorClass = "bg-emerald-950 text-emerald-300 border border-emerald-800/40";
      if (val >= 90) colorClass = "bg-emerald-600 text-white font-bold";
      else if (val >= 45) colorClass = "bg-emerald-700/80 text-emerald-100 font-semibold";
      else if (val >= 35) colorClass = "bg-emerald-800/60 text-emerald-200";
      else colorClass = "bg-slate-800/80 text-slate-300";

      return `
        <td class="py-2.5 px-1.5" title="Retensi ${row.cohort}: ${val.toFixed(1)}%">
          <span class="inline-block w-full py-1 rounded heat-cell ${colorClass}">
            ${val.toFixed(1)}%
          </span>
        </td>
      `;
    };

    tr.innerHTML = `
      <td class="py-2.5 px-3 text-left font-sans font-semibold text-slate-200">${row.cohort}</td>
      <td class="py-2.5 px-2 text-slate-400 font-sans">${row.users.toLocaleString('id-ID')}</td>
      ${formatCell(row.m0)}
      ${formatCell(row.m1)}
      ${formatCell(row.m2)}
      ${formatCell(row.m3)}
      ${formatCell(row.m4)}
      ${formatCell(row.m5)}
    `;
    tbody.appendChild(tr);
  });
}

/**
 * 5. Chart.js Engine
 * Combines Monthly Revenue Bar + Churn Rate Line, and RFM Segmentation Donut
 */
function renderDashboardCharts(data) {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'Inter';

  // 5A. Revenue vs Churn Combination Chart
  const months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'Mei 2024', 'Jun 2024'];
  const revenueMillions = [124.5, 142.0, 185.2, 168.4, 210.0, 241.8];
  const churnRatePerMonth = [28.4, 27.1, 25.0, 26.2, 24.8, 23.5];

  const canvasRev = document.getElementById('chart-revenue-churn');
  if (canvasRev) {
    if (revenueChurnChart) revenueChurnChart.destroy();
    const ctxRev = canvasRev.getContext('2d');
    revenueChurnChart = new Chart(ctxRev, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            type: 'line',
            label: 'Laju Churn (%)',
            data: churnRatePerMonth,
            borderColor: '#f43f5e',
            backgroundColor: '#f43f5e',
            borderWidth: 2,
            pointRadius: 4,
            tension: 0.3,
            yAxisID: 'y1'
          },
          {
            type: 'bar',
            label: 'Omzet Kotor (Juta Rp)',
            data: revenueMillions,
            backgroundColor: 'rgba(16, 185, 129, 0.75)',
            hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
            borderRadius: 6,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(148, 163, 184, 0.1)' } },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { callback: (v) => 'Rp' + v + 'Jt' }
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { callback: (v) => v + '%' }
          }
        }
      }
    });
  }

  // 5B. RFM Segmentation Donut Chart
  const segmentCounts = {
    'Champions': data.filter(d => d.segment === 'Champions').length,
    'Loyal Customers': data.filter(d => d.segment === 'Loyal Customers').length,
    'Potential Loyalist': data.filter(d => d.segment === 'Potential Loyalist').length,
    'At Risk': data.filter(d => d.segment === 'At Risk').length,
    'Lost': data.filter(d => d.segment === 'Lost').length
  };

  const canvasRFM = document.getElementById('chart-rfm-donut');
  if (canvasRFM) {
    if (rfmDonutChart) rfmDonutChart.destroy();
    const ctxRFM = canvasRFM.getContext('2d');
    rfmDonutChart = new Chart(ctxRFM, {
      type: 'doughnut',
      data: {
        labels: Object.keys(segmentCounts),
        datasets: [{
          data: Object.values(segmentCounts),
          backgroundColor: [
            '#6366f1', // Champions
            '#10b981', // Loyal Customers
            '#06b6d4', // Potential Loyalist
            '#f59e0b', // At Risk
            '#f43f5e'  // Lost
          ],
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, padding: 8, font: { size: 10 } }
          }
        },
        cutout: '70%'
      }
    });
  }
}

/**
 * 6. Data Table Manager (Search, Sort, Pagination)
 */
function handleTableSearch() {
  const searchEl = document.getElementById('table-search');
  const q = searchEl ? searchEl.value.toLowerCase().trim() : '';
  
  filteredRecords = rawCustomerData.filter(item => {
    return item.id.toLowerCase().includes(q) ||
           item.name.toLowerCase().includes(q) ||
           item.segment.toLowerCase().includes(q) ||
           item.channel.toLowerCase().includes(q) ||
           item.category.toLowerCase().includes(q);
  });
  currentPage = 1;
  renderTable();
}

function sortTable(key) {
  if (sortKey === key) {
    sortAsc = !sortAsc;
  } else {
    sortKey = key;
    sortAsc = true;
  }

  filteredRecords.sort((a, b) => {
    let valA = a[key];
    let valB = b[key];
    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? (valA - valB) : (valB - valA);
  });

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('raw-data-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
  const displayedItems = filteredRecords.slice(startIndex, endIndex);

  if (displayedItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-6 text-slate-500 font-sans">Tidak ada data pelanggan yang cocok dengan kriteria pencarian.</td></tr>`;
  } else {
    displayedItems.forEach(row => {
      let segColor = "bg-slate-800 text-slate-300";
      if (row.segment === 'Champions') segColor = "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
      else if (row.segment === 'Loyal Customers') segColor = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      else if (row.segment === 'Potential Loyalist') segColor = "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
      else if (row.segment === 'At Risk') segColor = "bg-amber-500/20 text-amber-300 border border-amber-500/30";
      else if (row.segment === 'Lost') segColor = "bg-rose-500/20 text-rose-300 border border-rose-500/30";

      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-800/40 transition";
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-semibold text-slate-200">${row.id}</td>
        <td class="py-2.5 px-3 font-sans text-slate-300">${row.name}</td>
        <td class="py-2.5 px-3 text-slate-400 font-sans">${row.channel}</td>
        <td class="py-2.5 px-3 text-slate-300">${row.recency} hari lalu</td>
        <td class="py-2.5 px-3 text-slate-300">${row.frequency}x</td>
        <td class="py-2.5 px-3 font-semibold text-emerald-400">Rp${row.monetary.toLocaleString('id-ID')}</td>
        <td class="py-2.5 px-3 font-mono text-indigo-400 font-bold">${row.rfm}</td>
        <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${segColor}">${row.segment}</span></td>
        <td class="py-2.5 px-3 font-semibold ${row.churnProb > 60 ? 'text-rose-400' : 'text-emerald-400'}">${row.churnProb}%</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Pagination Metadata
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const countEl = document.getElementById('table-record-count');
  const pageIndEl = document.getElementById('page-indicator');
  const btnPrev = document.getElementById('btn-prev-page');
  const btnNext = document.getElementById('btn-next-page');

  if (countEl) countEl.innerText = `Menampilkan ${filteredRecords.length > 0 ? startIndex + 1 : 0} sampai ${endIndex} dari ${filteredRecords.length} baris data`;
  if (pageIndEl) pageIndEl.innerText = `${currentPage} / ${totalPages}`;
  if (btnPrev) btnPrev.disabled = (currentPage === 1);
  if (btnNext) btnNext.disabled = (currentPage === totalPages);
}

function changePage(delta) {
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  currentPage += delta;
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  renderTable();
}

/**
 * 7. Churn ROI Simulator
 */
function updateSimulator() {
  const sliderEl = document.getElementById('sim-slider');
  if (!sliderEl) return;
  const sliderVal = parseInt(sliderEl.value, 10);
  
  const pctDisplay = document.getElementById('sim-pct-display');
  if (pctDisplay) pctDisplay.innerText = sliderVal + "%";

  // Financial Business Constants
  const totalActiveAnnualUsers = 2900;
  const averageCLVPerCustomer = 1665000; // Rp1.665.000
  const savedUsers = Math.round(totalActiveAnnualUsers * (sliderVal / 100));
  const projectedRevenueGain = savedUsers * averageCLVPerCustomer;

  const revResultEl = document.getElementById('sim-revenue-result');
  const custSavedEl = document.getElementById('sim-customers-saved');

  if (revResultEl) revResultEl.innerText = "+Rp" + projectedRevenueGain.toLocaleString('id-ID');
  if (custSavedEl) custSavedEl.innerText = "~" + savedUsers.toLocaleString('id-ID') + " Pelanggan";
}

/**
 * 8. Download Dataset CSV
 */
function exportCSV() {
  const headers = ["ID_Pelanggan", "Nama_Pelanggan", "Kanal_Akuisisi", "Kategori_Produk", "Recency_Hari", "Frekuensi", "Total_Belanja_IDR", "Skor_RFM", "Segmen", "Probabilitas_Churn_Persen"];
  const rows = [headers.join(",")];

  filteredRecords.forEach(item => {
    const row = [
      item.id,
      `"${item.name}"`,
      `"${item.channel}"`,
      `"${item.category}"`,
      item.recency,
      item.frequency,
      item.monetary,
      `"${item.rfm}"`,
      `"${item.segment}"`,
      item.churnProb
    ];
    rows.push(row.join(","));
  });

  const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `NexaMart_Data_Customer_Retention_${new Date().toISOString().slice(0, 10)}.csv`);
  link.click();
  window.URL.revokeObjectURL(url);
  showToast("File dataset CSV berhasil diunduh ke komputer Anda!");
}

/**
 * 9. Formula Modal
 */
function toggleFormulaModal(isOpen) {
  const modal = document.getElementById('modal-formula');
  if (!modal) return;
  if (isOpen) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

/**
 * 10. Copy Snippet & Clipboard Helpers
 */
function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    }).catch(() => {
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
}

function fallbackCopy(text, successMessage) {
  const dummy = document.createElement('textarea');
  dummy.value = text;
  dummy.style.position = 'fixed';
  dummy.style.left = '-9999px';
  document.body.appendChild(dummy);
  dummy.focus();
  dummy.select();
  try {
    document.execCommand('copy');
    showToast(successMessage);
  } catch (err) {
    showToast("Gagal menyalin teks.");
  }
  document.body.removeChild(dummy);
}

function copySnippet(snippetId) {
  const el = document.getElementById(snippetId);
  if (!el) return;
  copyToClipboard(el.innerText, "Kueri / skrip berhasil disalin ke clipboard!");
}

function copyProjectLink() {
  copyToClipboard(window.location.href, "Tautan portofolio berhasil disalin!");
}

/**
 * 11. Toast Notifications
 */
let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toast-text');
  if (!toast || !text) return;

  text.innerText = msg;
  toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-3');
  toast.classList.add('opacity-100', 'translate-y-0');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-3');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 3000);
}

