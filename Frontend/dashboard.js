// Fetch reports from API with sentiment analysis
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://bits-ufm-backend.onrender.com'; // Change this if you deploy under a different Render name

async function fetchReports() {
  try {
    const response = await fetch(`${API_BASE_URL}/reports-with-sentiment`);
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    // Use mock API if available, otherwise fallback to built-in sample
    if (window.MockAPI && typeof window.MockAPI.fetchReports === 'function') {
      return await window.MockAPI.fetchReports();
    }
    return [
      {
        id: 1,
        date: '2023-05-15',
        student_name: 'John Doe',
        course: 'Computer Science',
        unfair_means: '{"cheating": true, "plagiarism": false, "impersonation": false}',
        evidence_collected: true,
        incident_details: 'Student was caught using unauthorized materials during exam.',
        sentiment: 'NEGATIVE'
      },
      {
        id: 2,
        date: '2023-05-10',
        student_name: 'Jane Smith',
        course: 'Mathematics',
        unfair_means: '{"cheating": false, "plagiarism": true, "impersonation": false}',
        evidence_collected: false,
        incident_details: 'Submitted assignment with significant plagiarized content.',
        sentiment: 'NEGATIVE'
      },
      {
        id: 3,
        date: '2023-05-20',
        student_name: 'Alex Johnson',
        course: 'Physics',
        unfair_means: '{"cheating": false, "plagiarism": false, "impersonation": true}',
        evidence_collected: true,
        incident_details: 'Student had someone else take the exam on their behalf.',
        sentiment: 'NEGATIVE'
      },
      {
        id: 4,
        date: '2023-05-25',
        student_name: 'Emily Brown',
        course: 'English Literature',
        unfair_means: '{"cheating": false, "plagiarism": true, "impersonation": false}',
        evidence_collected: true,
        incident_details: 'Student showed remorse and admitted to plagiarism.',
        sentiment: 'POSITIVE'
      }
    ];
  }
}

// Create and apply filters
function createFilterContainer() {
  const filterContainer = document.getElementById('filter-container');
  if (!filterContainer) return;

  // Create filter elements
  const filterHTML = `
    <div class="filter-section">
      <h3>Filter Reports</h3>
      <div class="filter-row">
        <div class="filter-group">
          <label for="date-filter">Date Range:</label>
          <input type="date" id="date-filter-start" class="filter-input">
          <span>to</span>
          <input type="date" id="date-filter-end" class="filter-input">
        </div>
        <div class="filter-group">
          <label for="course-filter">Course:</label>
          <select id="course-filter" class="filter-input">
            <option value="">All</option>
          </select>
        </div>
      </div>
      <button id="apply-filters" class="filter-button">Apply Filters</button>
      <button id="reset-filters" class="filter-button">Reset</button>
    </div>
  `;

  filterContainer.innerHTML = filterHTML;

  // Set up filter event listeners
  document.getElementById('apply-filters').addEventListener('click', applyFilters);
  document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

// Apply filters to reports
async function applyFilters() {
  const startDate = document.getElementById('date-filter-start').value;
  const endDate = document.getElementById('date-filter-end').value;
  const sentiment = document.getElementById('sentiment-filter').value;
  const course = document.getElementById('course-filter').value;

  const reports = await fetchReports();

  const filteredReports = reports.filter(report => {
    // Date filter
    if (startDate && report.date < startDate) return false;
    if (endDate && report.date > endDate) return false;

    // Sentiment filter
    if (sentiment && report.sentiment !== sentiment) return false;

    // Course filter
    if (course && report.course !== course) return false;

    return true;
  });

  updateReportsTable(filteredReports);
}

// Reset all filters
async function resetFilters() {
  document.getElementById('date-filter-start').value = '';
  document.getElementById('date-filter-end').value = '';
  document.getElementById('course-filter').value = '';

  fetchAndUpdateDashboard();
}

// Analytics charts
let unfairMeansPieChartInstance = null;
let cityChartInstance = null;
let semesterChartInstance = null;
let evidenceChartInstance = null;

// Global chart instances for Analytics tab
let unfairMeansPieChartAnalyticsInstance = null;
let cityChartAnalyticsInstance = null;
let semesterChartAnalyticsInstance = null;
let evidenceChartAnalyticsInstance = null;

function initUnfairMeansPieChart(id, isAnalytics = false) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  const instance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{ data: [], backgroundColor: ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#475569'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
  if (isAnalytics) unfairMeansPieChartAnalyticsInstance = instance;
  else unfairMeansPieChartInstance = instance;
}

function initCityChart(id, isAnalytics = false) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  const instance = new Chart(ctx, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Reports', data: [], backgroundColor: '#6366f1' }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
  if (isAnalytics) cityChartAnalyticsInstance = instance;
  else cityChartInstance = instance;
}

function initSemesterChart(id, isAnalytics = false) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  const instance = new Chart(ctx, {
    type: 'bar',
    data: { labels: [], datasets: [{ label: 'Reports', data: [], backgroundColor: '#8b5cf6' }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
  if (isAnalytics) semesterChartAnalyticsInstance = instance;
  else semesterChartInstance = instance;
}

function initEvidenceChart(id, isAnalytics = false) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  const instance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Evidence: Yes', 'Evidence: No'],
      datasets: [{ data: [0, 0], backgroundColor: ['#10b981', '#f59e0b'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
  if (isAnalytics) evidenceChartAnalyticsInstance = instance;
  else evidenceChartInstance = instance;
}

function initAnalyticsCharts() {
  // Overview Tab Instances
  initUnfairMeansPieChart('unfair-means-pie-chart');
  initCityChart('city-chart');
  // Semester/Evidence not on overview grid usually, but init if exists
  initSemesterChart('semester-chart');
  initEvidenceChart('evidence-chart');

  // Analytics Tab Instances
  initUnfairMeansPieChart('unfair-means-pie-chart-analytics', true);
  initCityChart('city-chart-analytics', true);
  initSemesterChart('semester-chart-analytics', true);
  initEvidenceChart('evidence-chart-analytics', true);
}

// Update top statistics cards
function updateStats(reports) {
  const totalReportsEl = document.getElementById('total-reports');
  const monthlyReportsEl = document.getElementById('monthly-reports');
  const evidenceRateEl = document.getElementById('evidence-collected');
  const commonViolationEl = document.getElementById('common-violation');

  if (!totalReportsEl || !monthlyReportsEl || !evidenceRateEl || !commonViolationEl) return;

  const total = reports.length;
  totalReportsEl.textContent = total;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyCount = reports.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;
  monthlyReportsEl.textContent = monthlyCount;

  const withEvidence = reports.filter(r => r.evidence_collected).length;
  const rate = total > 0 ? Math.round((withEvidence / total) * 100) : 0;
  evidenceRateEl.textContent = `${rate}%`;

  const violationCounts = {};
  reports.forEach(r => {
    try {
      const um = typeof r.unfair_means === 'string' ? JSON.parse(r.unfair_means) : r.unfair_means;
      if (Array.isArray(um)) {
        um.forEach(v => { violationCounts[v] = (violationCounts[v] || 0) + 1; });
      } else if (um && typeof um === 'object') {
        Object.entries(um).forEach(([k, v]) => { if (v) violationCounts[k] = (counts[k] || 0) + 1; });
      }
    } catch (e) { }
  });

  let topViolation = '-';
  let maxCount = 0;
  Object.entries(violationCounts).forEach(([v, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topViolation = v.charAt(0).toUpperCase() + v.slice(1);
    }
  });
  commonViolationEl.textContent = topViolation;
}

// Update reports table with data (Recent Incidents)
function updateReportsTable(reports) {
  const tableBody = document.getElementById('reports-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  const recent = reports.slice(-5).reverse();

  recent.forEach(report => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = report.date;
    row.insertCell(1).textContent = report.student_name;
    row.insertCell(2).textContent = report.course;

    let unfairMeans = '';
    try {
      const um = typeof report.unfair_means === 'string' ? JSON.parse(report.unfair_means) : report.unfair_means;
      if (Array.isArray(um)) unfairMeans = um.map(u => u.charAt(0).toUpperCase() + u.slice(1)).join(', ');
      else if (um && typeof um === 'object') {
        unfairMeans = Object.entries(um)
          .filter(([_, v]) => v)
          .map(([k, _]) => k.charAt(0).toUpperCase() + k.slice(1))
          .join(', ');
      }
    } catch { unfairMeans = report.unfair_means || 'N/A'; }
    row.insertCell(3).textContent = unfairMeans;
  });
}


// Update analytics charts
function updateAnalyticsCharts(reports) {
  // Update Overview tab charts
  updateSpecificChart(unfairMeansPieChartInstance, reports, 'unfair_means');
  updateSpecificChart(cityChartInstance, reports, 'city');
  updateSpecificChart(semesterChartInstance, reports, 'semester');
  updateEvidenceChart(evidenceChartInstance, reports);

  // Update Analytics tab charts
  updateSpecificChart(unfairMeansPieChartAnalyticsInstance, reports, 'unfair_means');
  updateSpecificChart(cityChartAnalyticsInstance, reports, 'city');
  updateSpecificChart(semesterChartAnalyticsInstance, reports, 'semester');
  updateEvidenceChart(evidenceChartAnalyticsInstance, reports);
}

function updateSpecificChart(instance, reports, type) {
  if (!instance) return;
  const counts = {};
  reports.forEach(r => {
    if (type === 'unfair_means') {
      try {
        const um = typeof r.unfair_means === 'string' ? JSON.parse(r.unfair_means) : r.unfair_means;
        if (Array.isArray(um)) um.forEach(k => { counts[k] = (counts[k] || 0) + 1; });
        else if (um && typeof um === 'object') {
          Object.entries(um).forEach(([k, v]) => { if (v) counts[k] = (counts[k] || 0) + 1; });
        }
      } catch { }
    } else if (type === 'city') {
      const key = r.city || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    } else if (type === 'semester') {
      const key = r.semester ? `Sem ${r.semester}` : 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    }
  });

  const labels = Object.keys(counts).sort();
  const data = labels.map(l => counts[l]);
  instance.data.labels = labels;
  instance.data.datasets[0].data = data;
  instance.update();
}

function updateEvidenceChart(instance, reports) {
  if (!instance) return;
  let yes = 0, no = 0;
  reports.forEach(r => { if (r.evidence_collected) yes++; else no++; });
  instance.data.datasets[0].data = [yes, no];
  instance.update();
}

// Setup authentication elements and login functionality
function setupAuthElements() {
  const loginForm = document.getElementById('login-form');
  const loginContainer = document.getElementById('login-container');
  const dashboardContainer = document.getElementById('dashboard-container');

  // Drawer Elements
  const hambBtn = document.getElementById('hamburger-btn');
  const closeBtn = document.getElementById('close-drawer-btn');
  const sideDrawer = document.getElementById('side-drawer');
  const overlay = document.getElementById('drawer-overlay');

  const toggleDrawer = () => {
    sideDrawer.classList.toggle('open');
    overlay.classList.toggle('visible');
  };

  if (hambBtn) hambBtn.onclick = toggleDrawer;
  if (closeBtn) closeBtn.onclick = toggleDrawer;
  if (overlay) overlay.onclick = toggleDrawer;

  // Hide dashboard initially
  dashboardContainer.style.display = 'none';

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin') {
      loginContainer.style.display = 'none';
      dashboardContainer.style.display = 'block';
      initAnalyticsCharts();
      setupTabs();
      fetchAndUpdateDashboard();
    } else {
      const err = document.getElementById('login-error');
      if (err) err.textContent = 'Invalid credentials';
    }
  });

  document.getElementById('logout-btn').onclick = () => location.reload();
}

// Fetch and update dashboard with reports
async function fetchAndUpdateDashboard() {
  const raw = await fetchReports();
  const reports = normalizeReports(raw);
  window.__reports = reports;
  updateStats(reports);
  updateReportsTable(reports);
  updateAllReportsTable(reports);
  updateAnalyticsCharts(reports);

  // Populate course filter with unique courses
  const courseFilter = document.getElementById('course-filter');
  if (courseFilter) {
    const courses = [...new Set(reports.map(report => report.course).filter(Boolean))];

    // Clear existing options except the first one
    while (courseFilter.options.length > 1) {
      courseFilter.remove(1);
    }

    // Add course options
    courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course;
      option.textContent = course;
      courseFilter.appendChild(option);
    });
  }
  // Populate Unfair Means filter options
  const unfairFilter = document.getElementById('filter-unfair-means');
  if (unfairFilter) {
    const counts = {};
    reports.forEach(r => {
      try {
        const um = typeof r.unfair_means === 'string' ? JSON.parse(r.unfair_means) : r.unfair_means;
        if (um && typeof um === 'object') {
          Object.entries(um).forEach(([k, v]) => { if (v) counts[k] = (counts[k] || 0) + 1; });
        }
      } catch { }
    });
    const keys = Object.keys(counts).sort();
    while (unfairFilter.options.length > 1) unfairFilter.remove(1);
    keys.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = `${k}`;
      unfairFilter.appendChild(opt);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Set up authentication elements
  setupAuthElements();
  // Wire smoke test button if present
  const smokeBtn = document.getElementById('smoke-btn');
  if (smokeBtn) {
    smokeBtn.addEventListener('click', runSmokeTest);
  }
  // Reports tab filters
  const applyBtn = document.getElementById('apply-filters-reports');
  const resetBtn = document.getElementById('reset-filters-reports');
  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      const course = document.getElementById('filter-course').value;
      const unfair = document.getElementById('filter-unfair-means').value;
      const from = document.getElementById('filter-date-from').value;
      const to = document.getElementById('filter-date-to').value;
      const reports = window.__reports || normalizeReports(await fetchReports());
      const filtered = reports.filter(r => {
        if (course && !(r.course || '').includes(course)) return false;
        if (unfair) {
          try {
            const um = typeof r.unfair_means === 'string' ? JSON.parse(r.unfair_means) : r.unfair_means;
            if (!um || !um[unfair]) return false;
          } catch {
            return false;
          }
        }
        if (from && r.date < from) return false;
        if (to && r.date > to) return false;
        return true;
      });
      updateAllReportsTable(filtered);
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('filter-course').value = '';
      document.getElementById('filter-unfair-means').value = '';
      document.getElementById('filter-date-from').value = '';
      document.getElementById('filter-date-to').value = '';
      updateAllReportsTable(window.__reports || []);
    });
  }
});

// Run a simple smoke test: healthz -> seed-sample -> reports-with-sentiment
async function runSmokeTest() {
  const statusEl = document.getElementById('smoke-status');
  const btn = document.getElementById('smoke-btn');
  const setStatus = (msg, color = '#2c3e50') => {
    if (statusEl) statusEl.textContent = msg;
    if (statusEl) statusEl.style.color = color;
  };
  try {
    if (btn) btn.disabled = true;
    setStatus('Checking /healthz ...');
    const h = await fetch(`${API_BASE_URL}/healthz`);
    if (!h.ok) throw new Error('Healthz failed: ' + h.status);
    const hjson = await h.json();
    if (hjson.status !== 'ok') throw new Error('Healthz not ok');

    setStatus('Seeding sample report ...');
    const s = await fetch(`${API_BASE_URL}/seed-sample`);
    if (!s.ok) throw new Error('Seed failed: ' + s.status);
    await s.json().catch(() => { });

    setStatus('Fetching reports with sentiment ...');
    const raw = await fetchReports();
    const reports = normalizeReports(raw);
    updateStats(reports);
    updateReportsTable(reports);
    updateAllReportsTable(reports);
    updateUnfairMeansPieChart(reports);
    updateCityChart(reports);
    updateSemesterChart(reports);
    updateEvidenceChart(reports);

    setStatus(`Smoke test passed. Reports fetched: ${reports.length}`, '#27ae60');
  } catch (err) {
    console.error('Smoke test error:', err);
    setStatus('Smoke test failed: ' + err.message, '#c0392b');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// --- Enhancements: normalization, tabs, and additional table renderers ---

// Normalize backend report fields to UI schema
function normalizeReports(rawReports) {
  return rawReports.map(r => {
    const dateStr = r.exam_date
      ? String(r.exam_date)
      : (r.incident_datetime ? String(r.incident_datetime).split('T')[0] : (r.date || ''));
    const courseStr = r.course
      ? r.course
      : [r.course_code, r.course_name].filter(Boolean).join(' ').trim();
    return {
      id: r.id,
      date: dateStr,
      student_name: r.student_name || '',
      bits_id: r.bits_id || '',
      course: courseStr || '',
      unfair_means: r.unfair_means || '',
      evidence_collected: r.evidence_collected || false,
      incident_details: r.incident_details || '',
      city: r.exam_city || '',
      semester: r.semester || ''
    };
  });
}

function updateAllReportsTable(reports) {
  const tbody = document.getElementById('all-reports-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  reports.forEach(report => {
    const tr = document.createElement('tr');
    const unfairMeans = (() => {
      try {
        const um = typeof report.unfair_means === 'string' ? JSON.parse(report.unfair_means) : report.unfair_means;
        if (Array.isArray(um)) return um.join(', ');
        if (um && typeof um === 'object') {
          return Object.entries(um).filter(([_, v]) => !!v).map(([k]) => k).join(', ');
        }
        return um || 'N/A';
      } catch {
        return report.unfair_means || 'N/A';
      }
    })();
    const parts = (report.course || '').split(' ');
    const courseCode = parts[0] || '';
    const courseName = parts.slice(1).join(' ');
    tr.innerHTML = `
      <td>${report.date || '—'}</td>
      <td>${report.student_name || '—'}</td>
      <td>${report.bits_id || '—'}</td>
      <td>${courseCode || '—'}</td>
      <td>${courseName || '—'}</td>
      <td>${unfairMeans}</td>
      <td>${report.evidence_collected ? '<span class="badge badge-positive">Yes</span>' : '<span class="badge badge-neutral">No</span>'}</td>
      <td>${report.incident_details || '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const tabs = document.querySelectorAll('.tab-content');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabs.forEach(t => {
        if (t.id === target) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
    });
  });
}