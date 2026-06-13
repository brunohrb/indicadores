// ==================== ANÁLISE Q1 + ORÇAMENTO ====================
// Referência de gasto (baseline) e comparativos. Pronto pra orçamento.

const Q1_CONFIG = {
  meses_q1: ['jan', 'fev', 'mar'],
  modo: 'q1', // 'q1' ou 'orcamento'
  orcamento: null, // carregado do Supabase se existir
};

// Calcula referência Q1 (média mensal dos 3 primeiros meses)
function calcularReferenciaQ1(dados, categoria) {
  const items = dados[categoria] || [];
  const MESES = Q1_CONFIG.meses_q1; // ['jan', 'fev', 'mar']

  const q1_medio = {};
  items.forEach(item => {
    const valores_q1 = MESES.map(m => item[m] || 0);
    const media = valores_q1.reduce((a,b) => a+b, 0) / MESES.length;
    q1_medio[item.nome] = {
      media: parseFloat(media.toFixed(2)),
      jan: item.jan || 0,
      fev: item.fev || 0,
      mar: item.mar || 0,
      q1_total: valores_q1.reduce((a,b) => a+b, 0),
    };
  });
  return q1_medio;
}

// Calcula desvios de cada mês vs. referência Q1 (%)
function calcularDesviosQ1(dados, categoria) {
  const q1_medio = calcularReferenciaQ1(dados, categoria);
  const items = dados[categoria] || [];
  const MESES = ['abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  const desvios = []; // [{nome, mes, valor, ref, delta_abs, delta_pct, status}...]

  items.forEach(item => {
    const ref = q1_medio[item.nome]?.media || 0;
    if (ref === 0) return; // pula itens sem Q1

    MESES.forEach(mes => {
      const valor = item[mes] || 0;
      const delta_abs = valor - ref;
      const delta_pct = ref !== 0 ? ((delta_abs / ref) * 100) : 0;

      // Status: "normal" (±20%), "alerta" (20-50%), "crítico" (>50% ou negativo para receita)
      let status = 'normal';
      if (Math.abs(delta_pct) > 50) status = 'critico';
      else if (Math.abs(delta_pct) > 20) status = 'alerta';

      desvios.push({
        nome: item.nome,
        mes: mes,
        valor: parseFloat(valor.toFixed(2)),
        ref: parseFloat(ref.toFixed(2)),
        delta_abs: parseFloat(delta_abs.toFixed(2)),
        delta_pct: parseFloat(delta_pct.toFixed(2)),
        status: status,
      });
    });
  });

  return desvios.sort((a, b) => Math.abs(b.delta_pct) - Math.abs(a.delta_pct));
}

// Renderiza painel lateral com análise
function renderPainelAnaliseQ1(dados, categoria) {
  const desvios = calcularDesviosQ1(dados, categoria);
  const criticos = desvios.filter(d => d.status === 'critico');
  const alertas = desvios.filter(d => d.status === 'alerta');

  let html = `
    <div id="painelAnaliseQ1" style="position:fixed;right:0;top:0;width:380px;height:100vh;background:white;border-left:1px solid #e2e8f0;overflow-y:auto;padding:1.5rem;z-index:99;box-shadow:-2px 0 8px rgba(0,0,0,0.08)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap">
        <h3 style="margin:0;font-size:1.1rem;color:#1e293b">📊 Análise Q1</h3>
        <button onclick="fecharPainelAnaliseQ1()" style="background:#e2e8f0;border:none;border-radius:6px;padding:0.3rem 0.8rem;cursor:pointer;font-size:0.8rem">✕ Fechar</button>
      </div>

      <!-- Seletor Modo: Q1 vs Orçamento -->
      <div style="margin-bottom:1.5rem;padding:1rem;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">
        <label style="font-size:0.75rem;color:#64748b;font-weight:600;display:block;margin-bottom:0.5rem">📋 Comparar com:</label>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          <button onclick="Q1_CONFIG.modo='q1';renderPainelAnaliseQ1(dadosFluxoAtual, window._categoria_atual || 'custos')"
            style="padding:0.4rem 0.8rem;background:${Q1_CONFIG.modo==='q1'?'#0f3460':'#e2e8f0'};color:${Q1_CONFIG.modo==='q1'?'white':'#64748b'};border:none;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer">
            🔵 Ref. Q1
          </button>
          <button onclick="Q1_CONFIG.modo='orcamento';renderPainelAnaliseQ1(dadosFluxoAtual, window._categoria_atual || 'custos')"
            style="padding:0.4rem 0.8rem;background:${Q1_CONFIG.modo==='orcamento'?'#0f3460':'#e2e8f0'};color:${Q1_CONFIG.modo==='orcamento'?'white':'#64748b'};border:none;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer;opacity:${Q1_CONFIG.orcamento?'1':'0.5'}">
            💰 Orçamento ${Q1_CONFIG.orcamento?'✓':'(vazio)'}
          </button>
        </div>
      </div>

      <!-- Resumo -->
      <div style="margin-bottom:1.5rem;padding:1rem;background:#fef3c7;border-radius:10px;border-left:4px solid #f59e0b">
        <div style="font-size:0.85rem;color:#92400e;font-weight:600;margin-bottom:0.5rem">⚠️ Resumo de Desvios</div>
        <div style="font-size:0.8rem;color:#92400e">
          <div style="margin-bottom:0.3rem">🔴 Críticos (>50%): <strong>${criticos.length}</strong></div>
          <div>🟡 Alertas (20-50%): <strong>${alertas.length}</strong></div>
        </div>
      </div>

      <!-- Itens Críticos -->
      ${criticos.length > 0 ? `
        <div style="margin-bottom:1.5rem">
          <div style="font-size:0.85rem;font-weight:600;color:#dc2626;margin-bottom:0.7rem">🔴 CRÍTICOS (> 50% de desvio)</div>
          ${criticos.slice(0, 10).map(d => `
            <div style="padding:0.8rem;background:#fef2f2;border-left:3px solid #dc2626;border-radius:6px;margin-bottom:0.6rem;font-size:0.75rem">
              <div style="font-weight:600;color:#7f1d1d;margin-bottom:0.3rem">${d.nome} • ${d.mes.toUpperCase()}</div>
              <div style="color:#991b1b;margin-bottom:0.2rem">💰 Valor: ${formatCurrency(d.valor)} vs Ref: ${formatCurrency(d.ref)}</div>
              <div style="color:#991b1b;font-weight:600">📊 Desvio: ${d.delta_pct > 0 ? '+' : ''}${d.delta_pct.toFixed(1)}% (${formatCurrency(d.delta_abs)})</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Itens em Alerta -->
      ${alertas.length > 0 ? `
        <div style="margin-bottom:1.5rem">
          <div style="font-size:0.85rem;font-weight:600;color:#ea580c;margin-bottom:0.7rem">🟡 ALERTAS (20-50% de desvio)</div>
          ${alertas.slice(0, 8).map(d => `
            <div style="padding:0.8rem;background:#fef5f0;border-left:3px solid #ea580c;border-radius:6px;margin-bottom:0.6rem;font-size:0.75rem">
              <div style="font-weight:600;color:#7c2d12;margin-bottom:0.3rem">${d.nome} • ${d.mes.toUpperCase()}</div>
              <div style="color:#9a3412;margin-bottom:0.2rem">💰 Valor: ${formatCurrency(d.valor)} vs Ref: ${formatCurrency(d.ref)}</div>
              <div style="color:#9a3412;font-weight:600">📊 Desvio: ${d.delta_pct > 0 ? '+' : ''}${d.delta_pct.toFixed(1)}% (${formatCurrency(d.delta_abs)})</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${criticos.length === 0 && alertas.length === 0 ? `
        <div style="padding:1rem;background:#d1fae5;border-radius:10px;border-left:4px solid #10b981;color:#065f46;font-size:0.85rem;font-weight:600">
          ✅ Sem anomalias detectadas nesta categoria
        </div>
      ` : ''}

      <!-- Ação: Carregar Orçamento -->
      ${Q1_CONFIG.modo === 'orcamento' && !Q1_CONFIG.orcamento ? `
        <div style="margin-top:2rem;padding:1rem;background:#dbeafe;border-radius:10px;border-left:4px solid #0284c7">
          <div style="font-size:0.8rem;color:#0c4a6e;font-weight:600;margin-bottom:0.5rem">💡 Não há orçamento carregado</div>
          <div style="font-size:0.75rem;color:#0c4a6e;margin-bottom:0.8rem">Carregue um arquivo XLSX com a estrutura de orçamento esperada.</div>
          <button onclick="alert('Em desenvolvimento: carregamento de orçamento')"
            style="width:100%;padding:0.5rem;background:#0284c7;color:white;border:none;border-radius:6px;font-size:0.8rem;font-weight:600;cursor:pointer">
            📁 Carregar Orçamento
          </button>
        </div>
      ` : ''}
    </div>
  `;

  let painelExistente = document.getElementById('painelAnaliseQ1');
  if (!painelExistente) {
    document.body.insertAdjacentHTML('beforeend', html);
  } else {
    painelExistente.outerHTML = html;
  }
}

function fecharPainelAnaliseQ1() {
  const painel = document.getElementById('painelAnaliseQ1');
  if (painel) painel.remove();
  document.body.style.marginRight = '0';
}

function abrirPainelAnaliseQ1(categoria) {
  window._categoria_atual = categoria;
  renderPainelAnaliseQ1(dadosFluxoAtual, categoria);
  document.body.style.marginRight = '380px';
}

// Salva referência Q1 no Supabase (persistência entre sessões)
async function salvarReferenciaQ1(dados, categoria) {
  const q1_medio = calcularReferenciaQ1(dados, categoria);
  const chave = `ref_q1_${categoria}_2026`; // prefix com ano pra organizar

  try {
    await sbStorage.set(chave, JSON.stringify(q1_medio));
    console.log('✅ Referência Q1 salva:', chave);
  } catch(e) {
    console.warn('❌ Erro ao salvar referência Q1:', e);
  }
}

// Carrega referência Q1 do Supabase
async function carregarReferenciaQ1(categoria) {
  const chave = `ref_q1_${categoria}_2026`;
  try {
    const raw = await sbStorage.get(chave);
    if (raw) return JSON.parse(raw);
  } catch(e) {
    console.warn('Referência Q1 não encontrada ou erro:', e);
  }
  return null;
}

// Salva orçamento no Supabase (para futuro uso)
async function salvarOrcamento(orcamentoObj, categoria) {
  const chave = `orcamento_${categoria}_2026`;
  try {
    await sbStorage.set(chave, JSON.stringify(orcamentoObj));
    console.log('✅ Orçamento salvo:', chave);
    Q1_CONFIG.orcamento = orcamentoObj;
  } catch(e) {
    console.warn('❌ Erro ao salvar orçamento:', e);
  }
}

// Carrega orçamento do Supabase
async function carregarOrcamento(categoria) {
  const chave = `orcamento_${categoria}_2026`;
  try {
    const raw = await sbStorage.get(chave);
    if (raw) {
      Q1_CONFIG.orcamento = JSON.parse(raw);
      return Q1_CONFIG.orcamento;
    }
  } catch(e) {
    console.warn('Orçamento não encontrado ou erro:', e);
  }
  return null;
}

// Ao inicializar dados, carrega referências
async function q1_inicializar() {
  try {
    await salvarReferenciaQ1(dadosFinanceiros, 'custos');
    await salvarReferenciaQ1(dadosFinanceiros, 'despesas');
    console.log('✅ Referências Q1 inicializadas');
  } catch(e) {
    console.warn('Erro ao inicializar Q1:', e);
  }
}
