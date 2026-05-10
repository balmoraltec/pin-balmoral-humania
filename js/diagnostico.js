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
    btn.addEventListener('click', () => {
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
        showResults();
      }
    });
  });

  /* ---- Back Button ---- */
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) goTo(currentStep - 1);
    });
  });

  function showStepError(stepEl) {
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
    errMsg.textContent = '⚠️ Por favor, selecione uma opção para continuar.';
    setTimeout(() => errMsg.textContent = '', 3000);
  }

  function showResults() {
    // Calculate scores per pillar
    const pillars = { ambiental: [], social: [], governanca: [] };
    Object.values(scores).forEach(s => {
      if (pillars[s.pillar]) pillars[s.pillar].push(s.weight);
    });

    const avg = arr => arr.length ? Math.round(arr.reduce((a,b) => a+b, 0) / arr.length) : 50;
    const eScore = avg(pillars.ambiental);
    const sScore = avg(pillars.social);
    const gScore = avg(pillars.governanca);
    const total  = Math.round((eScore + sScore + gScore) / 3);

    // Update DOM
    document.getElementById('resultTotalScore').textContent = total;
    document.getElementById('resultEScore').textContent   = eScore + '%';
    document.getElementById('resultSScore').textContent   = sScore + '%';
    document.getElementById('resultGScore').textContent   = gScore + '%';

    const fillE = document.getElementById('fillE');
    const fillS = document.getElementById('fillS');
    const fillG = document.getElementById('fillG');
    setTimeout(() => {
      if (fillE) fillE.style.width = eScore + '%';
      if (fillS) fillS.style.width = sScore + '%';
      if (fillG) fillG.style.width = gScore + '%';
    }, 300);

    // Result level
    const resultLevel = document.getElementById('resultLevel');
    const resultDesc  = document.getElementById('resultDesc');
    if (total >= 75) {
      resultLevel.textContent = '🏆 Excelente — Seu Hotel está Pronto para a Certificação!';
      resultDesc.textContent  = 'Parabéns! Seu hotel já possui bases sólidas em ESG. Com nosso suporte, você garante o PIN Balmoral ESG e amplia seu acesso a crédito e investidores.';
    } else if (total >= 50) {
      resultLevel.textContent = '📈 Em Desenvolvimento — Você está no Caminho Certo!';
      resultDesc.textContent  = 'Seu hotel tem iniciativas ESG, mas ainda há lacunas importantes. Nossa Trilha de Capacitação vai acelerar sua jornada e eliminar os gargalos de crédito.';
    } else if (total >= 25) {
      resultLevel.textContent = '⚠️ Atenção — Riscos ESG Identificados';
      resultDesc.textContent  = 'Seu hotel enfrenta riscos significativos relacionados ao ESG. Bancos e investidores estão monitorando isso. Inicie agora nossa Trilha ESG para proteção imediata.';
    } else {
      resultLevel.textContent = '🚨 Crítico — Ação Urgente Necessária';
      resultDesc.textContent  = 'Seu hotel está em zona de risco alta para restrições de crédito e pressão de mercado. A PIN Balmoral ESG pode ajudá-lo a reverter este cenário rapidamente.';
    }

    // Draw canvas chart
    drawResultChart(total, eScore, sScore, gScore);

    // Show result step
    steps.forEach(s => s.classList.remove('active'));
    const resultEl = document.getElementById('diagResult');
    if (resultEl) {
      resultEl.classList.add('active');
      resultEl.style.display = 'block';
    }

    // Update progress to 100%
    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.textContent = 'Diagnóstico Concluído!';

    stepDots.forEach(dot => {
      dot.classList.remove('active', 'pending');
      dot.classList.add('done');
    });
    stepLines.forEach(line => line.classList.add('done'));
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
      goTo(0);
    });
  }

  // Init
  goTo(0);
  updateProgress();
});

