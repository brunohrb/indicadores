// ==================== RADAR DE GASTOS (DIÁRIOS) ====================
// Detecção matemática de anomalias em gastos diários
// Sem tokens Claude: apenas detecção + projeção.
// Explicação com Claude: sob demanda (botão opcional).

const RADAR_GASTOS = {
  meses_atuais: [],
  categoria_filtro: null,
  anomalias: [],
};

// Mapeia abreviação ('JAN', 'FEV'...) → índice 0..11
const RADAR_MES_ABREV = { JAN:0, FEV:1, MAR:2, ABR:3, MAI:4, JUN:5, JUL:6, AGO:7, SET:8, OUT:9, NOV:10, DEZ:11 };

// Índice do mês (0..11) a partir da chave 'JAN/26'
function _radarMesIdx(mesKey) {
  const abrev = (mesKey.split('/')[0] || '').toUpperCase();
  return RADAR_MES_ABREV[abrev] != null ? RADAR_MES_ABREV[abrev] : 0;
}

// Ordena cronologicamente ('JAN/26' < 'FEV/26' < ... 'DEZ/26')
function _radarOrdemCronologica(mesKey) {
  const [abrev, yy] = mesKey.split('/');
  const ano = parseInt(yy) || 0;
  return ano * 12 + _radarMesIdx(mesKey);
}

function radarGastosAnalisarMes(mesKey) {
  // mesKey: 'JAN/26', 'FEV/26', etc.
  if (!dadosDiarios || !dadosDiarios[mesKey]) return null;

  const mesData = dadosDiarios[mesKey];
  const analise = {
    mes: mesKey,
    custos_anomalias: [],
    despesas_anomalias: [],
    projecoes: {},
    timestamp: new Date().toISOString(),
  };

  // Processa custos + despesas operacionais
  ['custos', 'despesas_operacionais'].forEach(function(cat) {
    const items = mesData[cat] || [];
    const anomalias = [];

    items.forEach(function(item) {
      const valores_array = Object.keys(item.valores)
        .filter(k => k.startsWith('dia_'))
        .map(k => parseFloat(item.valores[k]) || 0)
        .filter(v => v !== 0); // Ignora zeros

      if (valores_array.length === 0) return;

      // Cálculo simples de anomalia: >2 desvios padrão acima da média
      const media = valores_array.reduce((a,b)=>a+b,0) / valores_array.length;
      const variancia = valores_array.reduce((a,v)=>a + Math.pow(v-media,2), 0) / valores_array.length;
      const desvio_padrao = Math.sqrt(variancia);

      // Identifica picos: dias com valor > media + 2*desvio
      const limiar = media + (2 * desvio_padrao);
      const dias_pico = [];

      Object.keys(item.valores).forEach(function(dia_key) {
        const val = parseFloat(item.valores[dia_key]) || 0;
        if (val > limiar && val > media * 1.5) {
          const dia_num = parseInt(dia_key.replace('dia_',''));
          dias_pico.push({ dia: dia_num, valor: val, desvio_pct: ((val - media) / media * 100).toFixed(0) });
        }
      });

      if (dias_pico.length > 0) {
        anomalias.push({
          nome: item.nome,
          media: media,
          desvio_padrao: desvio_padrao,
          dias_pico: dias_pico,
          total_mes: item.total,
          impacto_valor: dias_pico.reduce((s,d)=>s+d.valor,0),
        });
      }
    });

    if (cat === 'custos') analise.custos_anomalias = anomalias;
    else analise.despesas_anomalias = anomalias;
  });

  return analise;
}

// Gasto acumulado por dia (array índice 1..31) de uma categoria num mês
function _radarAcumuladoPorDia(mesKey, cat, ateDia) {
  const m = dadosDiarios[mesKey];
  if (!m) return [];
  const items = m[cat] || [];
  const lim = ateDia || 31;
  const acum = [0]; // índice 0 não usado
  let soma = 0;
  for (let d = 1; d <= lim; d++) {
    items.forEach(function(item) { soma += parseFloat(item.valores['dia_' + d]) || 0; });
    acum[d] = soma;
  }
  return acum;
}

// Total do mês de uma categoria
function _radarTotalMes(mesKey, cat) {
  const m = dadosDiarios[mesKey];
  if (!m) return 0;
  return (m[cat] || []).reduce(function(s, item) { return s + (item.total || 0); }, 0);
}

// Constrói a REFERÊNCIA HISTÓRICA da categoria a partir dos meses ANTERIORES
// com dados. Retorna, por dia: o acumulado médio (R$) e a fração média do mês
// já gasta até aquele dia. Como os meses passados já contêm folha/impostos nos
// mesmos dias, a curva embute esses solavancos.
function radarGastosReferenciaHistorica(mesAtualKey, cat) {
  const ordemAtual = _radarOrdemCronologica(mesAtualKey);
  const mesesRef = Object.keys(dadosDiarios)
    .filter(function(k) { return k !== mesAtualKey && _radarOrdemCronologica(k) < ordemAtual && _radarMesTemDados(k); })
    .sort(function(a, b) { return _radarOrdemCronologica(a) - _radarOrdemCronologica(b); });

  if (mesesRef.length === 0) return null;

  const somaCumul = {};   // dia -> soma dos acumulados (R$)
  const contCumul = {};   // dia -> nº de meses com aquele dia
  const somaFrac = {};    // dia -> soma das frações
  const contFrac = {};

  mesesRef.forEach(function(mk) {
    const idx = _radarMesIdx(mk);
    const ano = parseInt('20' + (mk.split('/')[1] || '26')) || 2026;
    const diasMes = new Date(ano, idx + 1, 0).getDate();
    const total = _radarTotalMes(mk, cat);
    const acum = _radarAcumuladoPorDia(mk, cat, diasMes);
    for (let d = 1; d <= diasMes; d++) {
      somaCumul[d] = (somaCumul[d] || 0) + acum[d];
      contCumul[d] = (contCumul[d] || 0) + 1;
      if (total > 0) {
        somaFrac[d] = (somaFrac[d] || 0) + (acum[d] / total);
        contFrac[d] = (contFrac[d] || 0) + 1;
      }
    }
  });

  const avgCumul = {}, avgFrac = {};
  Object.keys(somaCumul).forEach(function(d) { avgCumul[d] = somaCumul[d] / contCumul[d]; });
  Object.keys(somaFrac).forEach(function(d) { avgFrac[d] = somaFrac[d] / contFrac[d]; });

  return { avgCumul: avgCumul, avgFrac: avgFrac, nMeses: mesesRef.length, meses: mesesRef };
}

function radarGastosProjetarMes(mesKey, mesIdx_ano) {
  if (!dadosDiarios || !dadosDiarios[mesKey]) return null;
  if (!DASHBOARD_ORCADO.orcamento) return null;

  const ano = parseInt('20' + (mesKey.split('/')[1] || '26')) || 2026;
  const hoje = new Date();
  const dias_totais = new Date(ano, mesIdx_ano + 1, 0).getDate();

  // Só projeta se for o mês corrente; mês encerrado mostra realizado completo.
  const mesCorrente = (ano === hoje.getFullYear() && mesIdx_ano === hoje.getMonth());
  const dias_passados = mesCorrente ? Math.min(hoje.getDate(), dias_totais) : dias_totais;

  const projecoes = {};
  const meses_arr = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const mes_key_lower = meses_arr[mesIdx_ano];
  const orcado_custos = (DASHBOARD_ORCADO.orcamento.custos || {})[mes_key_lower] || 0;
  const orcado_despesas = (DASHBOARD_ORCADO.orcamento.despesas || {})[mes_key_lower] || 0;

  ['custos', 'despesas_operacionais'].forEach(function(cat) {
    const acum = _radarAcumuladoPorDia(mesKey, cat, dias_passados);
    const total_atual = acum[dias_passados] || 0;
    const mes_completo = dias_passados >= dias_totais;

    const ref = radarGastosReferenciaHistorica(mesKey, cat);
    let normal_ate_hoje = null, ritmo_pct = null, total_projetado = total_atual, base_projecao = 'realizado';

    if (!mes_completo && ref) {
      // Ritmo vs normal (R$ acumulado médio no mesmo dia)
      const nrm = ref.avgCumul[dias_passados];
      if (nrm != null && nrm > 0) {
        normal_ate_hoje = nrm;
        ritmo_pct = ((total_atual - nrm) / nrm * 100);
      }
      // Estimativa de fechamento pela CURVA histórica
      const frac = ref.avgFrac[dias_passados];
      if (frac != null && frac > 0.02) {
        total_projetado = total_atual / frac;
        base_projecao = 'curva';
      }
    }

    const cat_key = cat === 'custos' ? 'custos' : 'despesas';
    const orcado_val = cat_key === 'custos' ? orcado_custos : orcado_despesas;
    const valor_vs_orcado = mes_completo ? total_atual : total_projetado;

    projecoes[cat] = {
      total_atual: total_atual,
      total_projetado: total_projetado,
      base_projecao: base_projecao,          // 'curva' | 'realizado'
      normal_ate_hoje: normal_ate_hoje,       // R$ médio dos meses anteriores no mesmo dia
      ritmo_pct: ritmo_pct,                   // +/- % vs ritmo normal
      ref_nMeses: ref ? ref.nMeses : 0,
      orcado: orcado_val,
      desvio_orcado_pct: orcado_val > 0 ? ((valor_vs_orcado - orcado_val) / orcado_val * 100).toFixed(1) : 0,
      dias_passados: dias_passados,
      dias_totais: dias_totais,
      mes_completo: mes_completo,
    };
  });

  return projecoes;
}


// Soma de custos+despesas do mês (pra saber se tem dado real)
function _radarMesTemDados(mesKey) {
  const m = dadosDiarios[mesKey];
  if (!m) return false;
  let soma = 0;
  ['custos', 'despesas_operacionais'].forEach(function(cat) {
    (m[cat] || []).forEach(function(item) { soma += Math.abs(item.total || 0); });
  });
  return soma > 0;
}

function renderRadarGastos(container) {
  // Se vier um container (da aba), escreve nele; senão usa #orcadoView direto
  const el = container || document.getElementById('orcadoView');
  if (!el) return;

  if (!dadosDiarios || Object.keys(dadosDiarios).length === 0) {
    el.innerHTML = '<div style="padding:1rem;color:#666;">Dados diários não carregados.</div>';
    return;
  }

  // Ordena cronologicamente e pega o ÚLTIMO mês COM dados reais (ignora meses futuros zerados)
  const meses_ordenados = Object.keys(dadosDiarios).sort(function(a, b) {
    return _radarOrdemCronologica(a) - _radarOrdemCronologica(b);
  });
  const meses_com_dados = meses_ordenados.filter(_radarMesTemDados);
  const mes_atual = meses_com_dados.length ? meses_com_dados[meses_com_dados.length - 1] : meses_ordenados[meses_ordenados.length - 1];
  const mesIdx = _radarMesIdx(mes_atual);

  // Seletor de mês (caso queira olhar outro mês)
  RADAR_GASTOS.meses_atuais = meses_com_dados;

  const analise = radarGastosAnalisarMes(mes_atual);
  const projecoes = radarGastosProjetarMes(mes_atual, mesIdx);

  let html = '<div style="background:white;border-radius:8px;padding:1.5rem;border:1px solid #e2e8f0;">';
  html += '<h3 style="margin:0 0 1rem 0;color:#0f3460;font-size:1.1rem;">📊 Radar de Gastos - Anomalias Diárias</h3>';
  html += '<p style="margin:0 0 1rem 0;color:#666;font-size:0.9rem;">Análise de ' + mes_atual + ' - Picos detectados automaticamente</p>';

  // Seção Projeções
  if (projecoes) {
    const algumCompleto = projecoes.custos && projecoes.custos.mes_completo;
    const tituloSecao = algumCompleto ? '📊 Realizado do mês vs Orçado' : '📈 Ritmo do mês (vs seu padrão histórico)';
    html += '<div style="background:#f8fafc;border-radius:6px;padding:1rem;margin-bottom:1.5rem;border:1px solid #cbd5e1;">';
    html += '<h4 style="margin:0 0 0.8rem 0;color:#0f3460;">' + tituloSecao + '</h4>';

    ['custos', 'despesas_operacionais'].forEach(function(cat) {
      const p = projecoes[cat];
      const cat_label = cat === 'custos' ? 'Custos' : 'Despesas';
      const fmt = v => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(v);

      html += '<div style="border-top:1px solid #e2e8f0;padding-top:0.7rem;margin-bottom:0.7rem;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.3rem;">';
      html += '<strong style="font-size:0.95rem;">' + cat_label + '</strong>';

      if (p.mes_completo) {
        const cor = p.desvio_orcado_pct < 0 ? '#22c55e' : (p.desvio_orcado_pct < 10 ? '#eab308' : '#ef4444');
        html += '<span style="font-weight:bold;color:' + cor + ';">' + (p.desvio_orcado_pct >= 0 ? '+' : '') + p.desvio_orcado_pct + '% vs orçado</span>';
        html += '</div>';
        html += '<div style="font-size:0.85rem;color:#666;">Realizado: ' + fmt(p.total_atual) + ' &nbsp;·&nbsp; Orçado: ' + fmt(p.orcado) + '</div>';
      } else {
        // Cabeçalho: RITMO vs normal (foco principal — robusto a folha/imposto)
        if (p.ritmo_pct != null) {
          const corR = p.ritmo_pct <= 0 ? '#22c55e' : (p.ritmo_pct <= 10 ? '#eab308' : '#ef4444');
          html += '<span style="font-weight:bold;color:' + corR + ';">' + (p.ritmo_pct >= 0 ? '+' : '') + p.ritmo_pct.toFixed(1) + '% vs seu ritmo normal</span>';
        } else {
          html += '<span style="font-size:0.8rem;color:#999;">sem histórico p/ comparar</span>';
        }
        html += '</div>';

        // Linha 1: gasto até hoje vs normal no mesmo dia
        html += '<div style="font-size:0.85rem;color:#666;">';
        html += 'Gasto até dia ' + p.dias_passados + ': <strong>' + fmt(p.total_atual) + '</strong>';
        if (p.normal_ate_hoje != null) {
          html += ' &nbsp;·&nbsp; normal p/ este dia: ' + fmt(p.normal_ate_hoje);
        }
        html += '</div>';

        // Linha 2: estimativa de fechamento pela curva + desvio vs orçado
        if (p.base_projecao === 'curva') {
          const corO = p.desvio_orcado_pct < 0 ? '#22c55e' : (p.desvio_orcado_pct < 10 ? '#eab308' : '#ef4444');
          html += '<div style="font-size:0.85rem;color:#666;margin-top:0.2rem;">';
          html += 'Estimativa de fechamento: <strong>' + fmt(p.total_projetado) + '</strong>';
          html += ' &nbsp;·&nbsp; orçado ' + fmt(p.orcado) + ' &nbsp;·&nbsp; ';
          html += '<span style="font-weight:bold;color:' + corO + ';">' + (p.desvio_orcado_pct >= 0 ? '+' : '') + p.desvio_orcado_pct + '%</span>';
          html += '</div>';
          html += '<div style="font-size:0.72rem;color:#94a3b8;margin-top:0.2rem;">Estimativa baseada na curva de ' + p.ref_nMeses + ' mês(es) anteriores (já inclui folha, impostos etc.)</div>';
        }
      }
      html += '</div>';
    });

    html += '<div style="font-size:0.72rem;color:#94a3b8;margin-top:0.3rem;">' + (algumCompleto ? '' : '🟢 abaixo / 🟡 levemente acima / 🔴 bem acima do esperado para esta altura do mês') + '</div>';
    html += '</div>';
  } else {
    html += '<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:0.8rem;margin-bottom:1.5rem;color:#92400e;font-size:0.85rem;">';
    html += 'ℹ️ Orçado não carregado — mostrando só as anomalias. A projeção vs orçado aparece quando o orçamento de 2026 estiver disponível.';
    html += '</div>';
  }

  // Seção Anomalias
  const total_anomalias = (analise.custos_anomalias || []).length + (analise.despesas_anomalias || []).length;
  if (total_anomalias > 0) {
    html += '<div style="margin-bottom:1.5rem;">';
    html += '<h4 style="margin:0 0 0.8rem 0;color:#dc2626;">⚠️ Anomalias Detectadas (' + total_anomalias + ')</h4>';

    [
      { cat: 'custos_anomalias', label: 'Custos' },
      { cat: 'despesas_anomalias', label: 'Despesas' }
    ].forEach(function(section) {
      const anomalias = analise[section.cat] || [];
      if (anomalias.length === 0) return;

      html += '<div style="margin-bottom:1rem;">';
      html += '<h5 style="margin:0.5rem 0;color:#7c3aed;font-size:0.9rem;">▸ ' + section.label + '</h5>';

      anomalias.forEach(function(anom) {
        const impacto_pct = ((anom.impacto_valor / anom.total_mes) * 100).toFixed(0);
        html += '<div style="background:#fef2f2;border-left:3px solid #dc2626;padding:0.8rem;margin-bottom:0.6rem;border-radius:4px;">';
        html += '<div style="font-weight:600;color:#1f2937;margin-bottom:0.3rem;">' + anom.nome + '</div>';
        html += '<div style="font-size:0.85rem;color:#666;">';
        html += anom.dias_pico.length + ' pico' + (anom.dias_pico.length > 1 ? 's' : '') + ' | ';
        html += 'Impacto: ' + new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(anom.impacto_valor) + ' (' + impacto_pct + '%)';
        html += '</div>';

        html += '<div style="font-size:0.8rem;color:#999;margin-top:0.4rem;">';
        anom.dias_pico.slice(0, 3).forEach(function(pico) {
          html += '<span style="display:inline-block;background:#fff3f0;padding:0.2rem 0.6rem;margin-right:0.4rem;border-radius:3px;">Dia ' + pico.dia + ': +' + pico.desvio_pct + '%</span>';
        });
        if (anom.dias_pico.length > 3) html += '<span>+' + (anom.dias_pico.length - 3) + ' mais</span>';
        html += '</div>';
        html += '</div>';
      });

      html += '</div>';
    });

    html += '</div>';
  } else {
    html += '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:1rem;color:#166534;text-align:center;">';
    html += '✅ Nenhuma anomalia detectada em ' + mes_atual + '. Gastos dentro do esperado.';
    html += '</div>';
  }

  // Botão Claude (opcional)
  html += '<div style="margin-top:1.5rem;border-top:1px solid #e2e8f0;padding-top:1rem;">';
  html += '<button onclick="radarGastosExplicarComClaude(\'' + mes_atual + '\')" style="padding:0.6rem 1.2rem;background:#8b5cf6;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:0.9rem;">';
  html += '🧠 Explicar com Claude (sob demanda)</button>';
  html += '<span style="font-size:0.8rem;color:#666;margin-left:1rem;">Análise textual detalhada das anomalias</span>';
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;
}

async function radarGastosExplicarComClaude(mesKey) {
  const analise = radarGastosAnalisarMes(mesKey);
  const projecoes = radarGastosProjetarMes(mesKey, _radarMesIdx(mesKey));

  if (!analise) {
    alert('Dados não encontrados para ' + mesKey);
    return;
  }

  // Monta resumo das projeções (se houver orçado)
  let projTxt = 'Orçado não carregado.';
  if (projecoes) {
    const fmt = v => 'R$ ' + (v || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    projTxt = ['custos', 'despesas_operacionais'].map(function(cat) {
      const p = projecoes[cat];
      const label = cat === 'custos' ? 'Custos' : 'Despesas';
      if (p.mes_completo) {
        return '- ' + label + ': realizado ' + fmt(p.total_atual) + ' vs orçado ' + fmt(p.orcado) + ' → ' + (p.desvio_orcado_pct >= 0 ? '+' : '') + p.desvio_orcado_pct + '%';
      }
      let s = '- ' + label + ': gasto até dia ' + p.dias_passados + ' = ' + fmt(p.total_atual);
      if (p.normal_ate_hoje != null) s += ' (normal p/ este dia: ' + fmt(p.normal_ate_hoje) + ', ritmo ' + (p.ritmo_pct >= 0 ? '+' : '') + p.ritmo_pct.toFixed(1) + '%)';
      if (p.base_projecao === 'curva') s += '; estimativa de fechamento pela curva histórica = ' + fmt(p.total_projetado) + ' vs orçado ' + fmt(p.orcado) + ' (' + (p.desvio_orcado_pct >= 0 ? '+' : '') + p.desvio_orcado_pct + '%)';
      return s;
    }).join('\n');
  }

  // Constrói prompt para Claude
  const prompt = `Você é um analista financeiro da TEXNET. Analise as anomalias de gastos diários detectadas para ${mesKey} e responda em português, direto ao ponto.

PROJEÇÃO vs ORÇADO:
${projTxt}

CUSTOS - Anomalias (picos diários acima do normal):
${analise.custos_anomalias.map(a => `- ${a.nome}: ${a.dias_pico.length} pico(s), impacto R$ ${a.impacto_valor.toFixed(2)} (${((a.impacto_valor / a.total_mes) * 100).toFixed(0)}% do total do mês); dias: ${a.dias_pico.map(d => 'dia ' + d.dia + ' (+' + d.desvio_pct + '%)').join(', ')}`).join('\n') || 'Nenhuma'}

DESPESAS - Anomalias:
${analise.despesas_anomalias.map(a => `- ${a.nome}: ${a.dias_pico.length} pico(s), impacto R$ ${a.impacto_valor.toFixed(2)} (${((a.impacto_valor / a.total_mes) * 100).toFixed(0)}% do total do mês); dias: ${a.dias_pico.map(d => 'dia ' + d.dia + ' (+' + d.desvio_pct + '%)').join(', ')}`).join('\n') || 'Nenhuma'}

Forneça uma análise concisa (2-3 parágrafos curtos) sobre:
1. Principais impulsionadores de gastos anormais;
2. Risco de estouro do orçamento;
3. Ações recomendadas. NÃO use ferramentas/tools — analise apenas os dados acima.`;

  // Mostra modal de carregamento
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10000;';
  modal.innerHTML = `<div style="background:white;border-radius:8px;padding:2rem;max-width:600px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 25px rgba(0,0,0,0.15);">
    <h3 style="margin:0 0 1rem 0;">🧠 Análise Claude — ${mesKey}</h3>
    <div id="claudeStatus" style="color:#666;font-size:0.9rem;margin-bottom:1rem;">Processando…</div>
    <div id="claudeOutput" style="min-height:100px;line-height:1.6;color:#333;"></div>
    <button onclick="this.parentElement.parentElement.remove()" style="margin-top:1rem;padding:0.6rem 1.2rem;background:#8b5cf6;color:white;border:none;border-radius:6px;cursor:pointer;">Fechar</button>
  </div>`;
  document.body.appendChild(modal);

  const outputDiv = modal.querySelector('#claudeOutput');
  const statusDiv = modal.querySelector('#claudeStatus');

  // Reutiliza a Edge Function coach-ia (já deployada, já tem ANTHROPIC_API_KEY).
  // Responde via SSE com eventos {type:'text'|'tool'|'done'|'error'}.
  try {
    if (typeof SB_URL === 'undefined' || typeof SB_KEY === 'undefined') {
      throw new Error('Configuração do Supabase não encontrada (SB_URL/SB_KEY).');
    }
    const res = await fetch(SB_URL + '/functions/v1/coach-ia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SB_KEY,
        'apikey': SB_KEY,
      },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] }),
    });

    if (!res.ok || !res.body) {
      const raw = await res.text().catch(() => '');
      throw new Error('Servidor respondeu ' + res.status + (raw ? ': ' + raw.slice(0, 200) : ''));
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '', acumulado = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const partes = buf.split('\n\n');
      buf = partes.pop() || '';
      for (const bloco of partes) {
        const linha = bloco.split('\n').find(l => l.startsWith('data:'));
        if (!linha) continue;
        const json = linha.slice(5).trim();
        if (!json) continue;
        let ev;
        try { ev = JSON.parse(json); } catch { continue; }
        if (ev.type === 'text') {
          acumulado += ev.text;
          statusDiv.style.display = 'none';
          outputDiv.innerHTML = (typeof iaMarkdown === 'function') ? iaMarkdown(acumulado) : acumulado.replace(/</g,'&lt;').replace(/>/g,'&gt;');
        } else if (ev.type === 'tool') {
          statusDiv.textContent = '🔎 Consultando dados…';
        } else if (ev.type === 'error') {
          throw new Error(String(ev.error || 'erro no servidor'));
        }
      }
    }

    if (!acumulado) outputDiv.innerHTML = '<span style="color:#94a3b8">Sem resposta.</span>';
  } catch (e) {
    statusDiv.style.display = 'none';
    outputDiv.innerHTML = '<div style="background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;border-radius:8px;padding:0.8rem;"><strong>Erro:</strong> ' + String(e.message || e).replace(/</g,'&lt;') + '</div>';
  }
}
