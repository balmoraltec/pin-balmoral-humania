/* =====================================================
   PIN BALMORAL ESG - Diagnóstico JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const steps = document.querySelectorAll('.diag-step');
  const stepDots = document.querySelectorAll('.step-dot');
  const stepLines = document.querySelectorAll('.step-line');
  const progressFill = document.getElementById('diagProgressFill');
  const progressText = document.getElementById('diagProgressText');

  let currentStep = 0;
  const totalSteps = 5;
  const scores = {};
  const leadFields = {
    nome: document.getElementById('leadNome'),
    email: document.getElementById('leadEmail'),
    telefone: document.getElementById('leadTelefone'),
    hotel: document.getElementById('leadHotel'),
  };
  const impactMessageEl = document.getElementById('impactMessage');
  const impactResultCard = document.getElementById('impactResultCard');
  const impactStepEl = document.getElementById('impactScreen');

  // Answer data: question -> score (0-100) per answer
  const questionWeights = {
    0: { a: 85, b: 55, c: 25, d: 5  }, // Práticas Ambientais
    1: { a: 90, b: 60, c: 30, d: 5  }, // Gestão Social
    2: { a: 80, b: 50, c: 20, d: 0  }, // Governança
    3: { a: 85, b: 55, c: 25, d: 5  }, // Acesso a crédito ESG
    4: { a: 90, b: 60, c: 30, d: 10 }, // Relatórios ESG
  };

  const pillarsMap = {
    0: 'ambiental',
    1: 'social',
    2: 'governanca',
    3: 'social',
    4: 'governanca',
  };

  function updateProgress() {
    const pct = Math.round(((currentStep) / totalSteps) * 100);
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) progressText.textContent = `Pergunta ${Math.min(currentStep + 1, totalSteps)} de ${totalSteps}`;
  }

  function normalizePhone(value) {
    return (value || '').replace(/\D/g, '');
  }

  function validateLeadFields() {
    const nome = (leadFields.nome?.value || '').trim();
    const email = (leadFields.email?.value || '').trim();
    const telefone = normalizePhone(leadFields.telefone?.value || '');
    const hotel = (leadFields.hotel?.value || '').trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validations = [
      { el: leadFields.nome, ok: nome.length >= 3 },
      { el: leadFields.email, ok: emailOk },
      { el: leadFields.telefone, ok: telefone.length >= 10 },
      { el: leadFields.hotel, ok: hotel.length >= 3 },
    ];

    validations.forEach(v => {
      if (!v.el) return;
      v.el.classList.toggle('invalid', !v.ok);
    });

    return validations.every(v => v.ok);
  }

  function collectScoreSummary() {
    const pillars = { ambiental: [], social: [], governanca: [] };
    Object.values(scores).forEach(s => {
      if (pillars[s.pillar]) pillars[s.pillar].push(s.weight);
    });
    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50;
    const eScore = avg(pillars.ambiental);
    const sScore = avg(pillars.social);
    const gScore = avg(pillars.governanca);
    const total = Math.round((eScore + sScore + gScore) / 3);
    return { total, eScore, sScore, gScore };
  }

  async function sendLeadWebhook(payload) {
    const customEndpoint = (window.PIN_BALMORAL_WEBHOOK || '').trim();
    const endpoints = [customEndpoint, '/api/inside-sales-leads'].filter(Boolean);
    let delivered = false;

    for (const endpoint of endpoints) {
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (resp.ok || resp.type === 'opaque') {
          delivered = true;
          break;
        }
      } catch (err) {
        // Segue fluxo mesmo se endpoint estiver indisponivel.
      }
    }

    return delivered;
  }

  async function startImpactFlow() {
    steps.forEach(s => s.classList.remove('active'));
    if (impactStepEl) {
      impactStepEl.classList.add('active');
      impactStepEl.style.display = 'block';
    }

    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = 'Processando Score...';
    if (impactResultCard) impactResultCard.style.display = 'none';

    const messages = [
      'Analisando critérios de elegibilidade bancária 2026...',
      'Cruzando dados com requisitos de linhas verdes...',
      'Calculando risco de restrição de crédito corporativo...'
    ];

    let idx = 0;
    if (impactMessageEl) impactMessageEl.textContent = messages[0];

    const timer = setInterval(() => {
      idx = (idx + 1) % messages.length;
      if (impactMessageEl) impactMessageEl.textContent = messages[idx];
    }, 1200);

    setTimeout(() => {
      if (impactResultCard) impactResultCard.style.display = 'block';
    }, 3600);

    setTimeout(() => {
      clearInterval(timer);
      window.location.href = 'dashboard.html';
    }, 5000);
  }

  function goTo(index) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    stepDots.forEach((dot, i) => {
      dot.classList.remove('done', 'active', 'pending');
      if (i < index) dot.classList.add('done');
      else if (i === index) dot.classList.add('active');
      else dot.classList.add('pending');
    });
    stepLines.forEach((line, i) => {
      line.classList.toggle('done', i < index);
    });
    currentStep = index;
    updateProgress();
  }

  /* ---- Option selection ---- */
  document.querySelectorAll('.diag-option').forEach(option => {
    option.addEventListener('click', () => {
      const parent = option.closest('.diag-step');
      parent.querySelectorAll('.diag-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      const marker = option.querySelector('.diag-option-marker');
      if (marker) marker.innerHTML = '<i class="fa-solid fa-check"></i>';
      parent.querySelectorAll('.diag-option:not(.selected) .diag-option-marker').forEach(m => {
        m.innerHTML = '';
      });
    });
  });

  /* ---- Next Button ---- */
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', async () => {
      const step = parseInt(btn.dataset.step);
      const currentStepEl = document.querySelector(`.diag-step[data-step="${step}"]`);
      const selected = currentStepEl ? currentStepEl.querySelector('.diag-option.selected') : null;

      if (!selected) {
        showStepError(currentStepEl);
        return;
      }

      // Record score
      const answerKey = selected.dataset.value;
      const weight = questionWeights[step] ? (questionWeights[step][answerKey] || 50) : 50;
      scores[step] = { weight, pillar: pillarsMap[step] || 'geral' };

      if (step < totalSteps - 1) {
        goTo(step + 1);
      } else {
        if (!validateLeadFields()) {
          showStepError(currentStepEl, '⚠️ Para gerar seu score, preencha Nome, E-mail, Telefone Corporativo e CNPJ/Nome do Hotel.');
          return;
        }

        const scoreSummary = collectScoreSummary();
        const leadPayload = {
          funnel: 'pin-balmoral-diagnostico',
          origem: 'diagnostico.html',
          nome: (leadFields.nome?.value || '').trim(),
          email: (leadFields.email?.value || '').trim(),
          telefoneCorporativo: (leadFields.telefone?.value || '').trim(),
          cnpjOuHotel: (leadFields.hotel?.value || '').trim(),
          respostas: scores,
          scoreCalculado: scoreSummary,
          scoreExibido: {
            score: 42,
            nivel: 'Nível Crítico - Alto Risco de Restrição de Crédito Corporativo',
            bloqueioLinhas: '68%'
          },
          timestamp: new Date().toISOString(),
        };

        await sendLeadWebhook(leadPayload);

        localStorage.setItem('pinLeadData', JSON.stringify({
          nome: leadPayload.nome,
          email: leadPayload.email,
          telefone: leadPayload.telefoneCorporativo,
          hotel: leadPayload.cnpjOuHotel,
          timestamp: leadPayload.timestamp,
        }));
        localStorage.setItem('pinDiagnosticResult', JSON.stringify({
          score: 42,
          level: 'Nível Crítico - Alto Risco de Restrição de Crédito Corporativo',
          blockedCredit: 68,
          calculated: scoreSummary,
        }));

        startImpactFlow();
      }
    });
  });

  /* ---- Back Button ---- */
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) goTo(currentStep - 1);
    });
  });

  function showStepError(stepEl, message) {
    if (!stepEl) return;
    stepEl.style.animation = 'none';
    stepEl.offsetHeight;
    stepEl.style.animation = 'shake 0.4s ease';
    setTimeout(() => stepEl.style.animation = '', 400);

    let errMsg = stepEl.querySelector('.err-msg');
    if (!errMsg) {
      errMsg = document.createElement('p');
      errMsg.className = 'err-msg';
      errMsg.style.cssText = 'color:#C0392B;font-size:0.85rem;margin-top:12px;font-weight:600;';
      stepEl.appendChild(errMsg);
    }
    errMsg.textContent = message || '⚠️ Por favor, selecione uma opção para continuar.';
    setTimeout(() => errMsg.textContent = '', 3000);
  }

  function drawResultChart(total, e, s, g) {
    const canvas = document.getElementById('resultChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r  = size * 0.38;

    ctx.clearRect(0, 0, size, size);

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#E2EAE5';
    ctx.lineWidth = size * 0.1;
    ctx.stroke();

    // Progress ring
    const angle = (total / 100) * Math.PI * 2 - Math.PI / 2;
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#1B4332');
    gradient.addColorStop(1, '#D4A017');
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, angle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = size * 0.1;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#1A2E22';
    ctx.font = `bold ${size * 0.18}px 'Playfair Display', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total + '%', cx, cy - size * 0.04);

    ctx.fillStyle = '#5A7A68';
    ctx.font = `${size * 0.07}px Inter, sans-serif`;
    ctx.fillText('Score ESG', cx, cy + size * 0.1);
  }

  /* ---- Restart ---- */
  const restartBtn = document.getElementById('restartDiag');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      Object.keys(scores).forEach(k => delete scores[k]);
      document.querySelectorAll('.diag-option').forEach(o => {
        o.classList.remove('selected');
        const marker = o.querySelector('.diag-option-marker');
        if (marker) marker.innerHTML = '';
      });
      const resultEl = document.getElementById('diagResult');
      if (resultEl) { resultEl.classList.remove('active'); resultEl.style.display = 'none'; }
      if (impactStepEl) { impactStepEl.classList.remove('active'); impactStepEl.style.display = 'none'; }
      Object.values(leadFields).forEach(field => {
        if (!field) return;
        field.value = '';
        field.classList.remove('invalid');
      });
      goTo(0);
    });
  }

  // Init
  goTo(0);
  updateProgress();
});

