/* =====================================================
   PIN BALMORAL ESG - Dashboard JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const forcedScore = 42;
  const forcedPillars = { e: 39, s: 44, g: 43 };

  /* ---- Sidebar Navigation ---- */
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  const dashSections = document.querySelectorAll('.dash-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.section;
      sidebarLinks.forEach(l => l.classList.remove('active'));
      dashSections.forEach(s => s.classList.remove('active'));
      link.classList.add('active');
      const section = document.getElementById('sec-' + target);
      if (section) section.classList.add('active');
      document.querySelector('.dash-header-title').textContent = link.querySelector('span')?.textContent || 'Dashboard';
    });
  });

  /* ---- Main Score Ring (Canvas) ---- */
  function drawScoreRing(canvasId, score, color1, color2) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r  = size * 0.38;

    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(27,67,50,0.08)';
    ctx.lineWidth = size * 0.1;
    ctx.stroke();

    // Animate fill
    let current = 0;
    const target = (score / 100) * Math.PI * 2;

    function draw() {
      ctx.clearRect(0, 0, size, size);

      // Track
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(27,67,50,0.08)';
      ctx.lineWidth = size * 0.1;
      ctx.stroke();

      // Fill
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + current);
      ctx.strokeStyle = grad;
      ctx.lineWidth = size * 0.1;
      ctx.lineCap = 'round';
      ctx.stroke();

      if (current < target) {
        current += target / 60;
        requestAnimationFrame(draw);
      } else {
        current = target;
        draw();
      }
    }
    draw();
  }

  // Score Ring
  setTimeout(() => {
    drawScoreRing('scoreRing', forcedScore, '#8E2D1F', '#D4A017');
  }, 400);

  /* ---- Pillar Progress Bars ---- */
  const pillarBars = [
    { id: 'barE', value: forcedPillars.e },
    { id: 'barS', value: forcedPillars.s },
    { id: 'barG', value: forcedPillars.g },
  ];

  setTimeout(() => {
    pillarBars.forEach(bar => {
      const el = document.getElementById(bar.id);
      if (el) el.style.width = bar.value + '%';
    });
  }, 600);

  /* ---- Task Checkboxes ---- */
  document.querySelectorAll('.task-check').forEach(check => {
    check.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = check.closest('.task-item');
      const isDone = item.classList.toggle('done');
      check.innerHTML = isDone ? '<i class="fa-solid fa-check"></i>' : '';
      showToast(isDone ? 'Tarefa concluída! ✅' : 'Tarefa reaberta.', isDone ? 'fa-check-circle' : 'fa-circle');
    });
  });

  /* ---- Counter Metrics ---- */
  function animateNum(el, target, suffix, prefix, duration = 1500) {
    if (!el) return;
    const isFloat = String(target).includes('.');
    const step = 16;
    const totalSteps = duration / step;
    const inc = target / totalSteps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= target) { cur = target; clearInterval(timer); }
      el.textContent = (prefix || '') + (isFloat ? cur.toFixed(1) : Math.floor(cur)) + (suffix || '');
    }, step);
  }

  setTimeout(() => {
    animateNum(document.getElementById('metricScore'),   forcedScore, '', '',   1500);
    animateNum(document.getElementById('metricTarefas'), 12, '', '',   1200);
    animateNum(document.getElementById('metricModulos'),  4, '/6', '', 1000);
    animateNum(document.getElementById('metricDias'),    47, '', '',   1300);
  }, 500);

  /* ---- Lead context from diagnostico ---- */
  try {
    const leadRaw = localStorage.getItem('pinLeadData');
    if (leadRaw) {
      const lead = JSON.parse(leadRaw);
      const userNameEl = document.querySelector('.user-name');
      const userRoleEl = document.querySelector('.user-role');
      const headerSubEl = document.getElementById('dashHotelSub');
      const hotelName = (lead.hotel || '').trim();

      if (userNameEl && hotelName) userNameEl.textContent = hotelName;
      if (userRoleEl) userRoleEl.textContent = 'Score 42% • Alto Risco de Restricao de Credito';
      if (headerSubEl && hotelName) headerSubEl.textContent = `Maio 2026 • ${hotelName}`;
    }
  } catch (err) {
    // Mantem fallback visual se localStorage estiver indisponivel.
  }

  /* ---- Docs hover effect ---- */
  document.querySelectorAll('.doc-card').forEach(card => {
    card.addEventListener('click', () => {
      showToast('Documento: ' + card.querySelector('.doc-name')?.textContent, 'fa-file');
    });
  });

  /* ---- Notification Bell ---- */
  document.querySelectorAll('.notif-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('3 notificações pendentes — Veja suas tarefas ESG!', 'fa-bell');
    });
  });

  /* ---- Toast (local) ---- */
  window.showToast = function(msg, icon = 'fa-check-circle') {
    let toast = document.getElementById('toastMsg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastMsg';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  };

  /* ---- Trilha Module Progress ---- */
  const trilhaItems = document.querySelectorAll('.dash-trilha-item');
  trilhaItems.forEach(item => {
    const progress = parseInt(item.dataset.progress || 0);
    const fill = item.querySelector('.dash-trilha-fill');
    if (fill) setTimeout(() => { fill.style.width = progress + '%'; }, 700);
  });

  /* ---- Welcome message ---- */
  setTimeout(() => {
    showToast('Seu painel esta bloqueado ate ativacao da licenca corporativa.', 'fa-lock');
  }, 1200);

  console.log('%c📊 Dashboard PIN Balmoral ESG', 'color:#D4A017;font-size:1.2rem;font-weight:bold;');
});

