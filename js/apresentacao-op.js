// ================================================================
// APRESENTAÇÃO COMISSÃO OPERACIONAL
// Gera deck mensal estilo PowerPoint da diretora operacional.
// Auto-preenche o que vem do Power BI; deixa contenteditable
// nos campos que ainda não temos automatizados (salva no Supabase).
// Ctrl+P / "Imprimir" do navegador exporta como PDF.
// ================================================================

(function () {
  const MESES_NOME = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  function _mesKey(mesIdx, ano) {
    return ano + '-' + String(mesIdx + 1).padStart(2, '0');
  }
  function _mesAntKey(mesIdx, ano) {
    let m = mesIdx - 1, a = ano;
    if (m < 0) { m = 11; a--; }
    return _mesKey(m, a);
  }
  function _mesAnoAntKey(mesIdx, ano) {
    return _mesKey(mesIdx, ano - 1);
  }

  function brl(v) {
    v = Number(v) || 0;
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  function num(v) {
    v = Number(v) || 0;
    return v.toLocaleString('pt-BR');
  }

  async function _lerPBI(chave) {
    try {
      const { data } = await sb.from('app_storage')
        .select('value').eq('key', chave).maybeSingle();
      if (!data) return null;
      return JSON.parse(data.value);
    } catch (e) { return null; }
  }

  async function _carregarMes(mes) {
    const dir = await _lerPBI('powerbi_diretoria_fechado_' + mes)
             || await _lerPBI('powerbi_diretoria_' + mes);
    const cpf = await _lerPBI('powerbi_comercial_pf_fechado_' + mes)
             || await _lerPBI('powerbi_comercial_pf_' + mes);
    const valores = {};
    if (cpf && cpf.valores) Object.assign(valores, cpf.valores);
    if (dir && dir.valores) Object.assign(valores, dir.valores);
    return Object.keys(valores).length ? valores : null;
  }

  function _v(obj, ...nomes) {
    if (!obj) return 0;
    for (const n of nomes) {
      if (obj[n] !== undefined && obj[n] !== null) return Number(obj[n]) || 0;
    }
    return 0;
  }

  // ── Carrega/salva manuais no Supabase: key = apresentacao_op_YYYY-MM ──
  async function _carregarManuais(mes) {
    try {
      const { data } = await sb.from('app_storage')
        .select('value').eq('key', 'apresentacao_op_' + mes).maybeSingle();
      if (!data) return {};
      return JSON.parse(data.value);
    } catch (e) { return {}; }
  }
  async function _salvarManuais(mes, dados) {
    try {
      await sb.from('app_storage').upsert(
        { key: 'apresentacao_op_' + mes, value: JSON.stringify(dados), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (e) { console.warn('salvar manuais:', e); }
  }

  let _manuaisAtuais = {};
  let _mesAtual = '';
  let _salvarPendente = null;

  function _agendarSalvar() {
    if (_salvarPendente) clearTimeout(_salvarPendente);
    _salvarPendente = setTimeout(() => _salvarManuais(_mesAtual, _manuaisAtuais), 800);
  }

  // Campo editável: usuário digita, valor persiste por mês
  function _edit(campo, placeholder = 'Preencher') {
    const v = _manuaisAtuais[campo] || '';
    return `<span class="ap-edit" data-campo="${campo}" contenteditable="true"
              data-placeholder="${placeholder}">${v}</span>`;
  }

  // ── Slides ─────────────────────────────────────────────────────────
  function slideCapa(mesNome, ano) {
    return `
      <section class="ap-slide ap-capa">
        <div class="ap-capa-box">
          <div class="ap-capa-mini">APRESENTAÇÃO MENSAL</div>
          <h1>${mesNome} ${ano}</h1>
          <div class="ap-capa-sub">Comercial PF · Relacionamento com Cliente</div>
          <div class="ap-capa-rod">TEXNET</div>
        </div>
      </section>`;
  }

  function slideVendasPF(val, valAnt, mesNome, mesAntNome, anoAnt) {
    const vendaPF      = _v(val, 'Novos Negócios PF', 'Total Venda PF');
    const vendaPFAnt   = _v(valAnt, 'Novos Negócios PF', 'Total Venda PF');
    const qtdPF        = _v(val, 'Novos Clientes PF');
    const cresc        = vendaPFAnt > 0 ? ((vendaPF - vendaPFAnt) / vendaPFAnt * 100) : 0;
    const crescStr     = (cresc >= 0 ? '+' : '') + cresc.toFixed(1).replace('.', ',') + '%';
    const corCresc     = cresc >= 0 ? '#10b981' : '#ef4444';

    return `
      <section class="ap-slide">
        <h2>📊 Vendas PF — Comparativo Anual</h2>
        <div class="ap-grid-2">
          <div class="ap-card ap-card-dest">
            <div class="ap-card-label">${mesNome}</div>
            <div class="ap-card-val">${brl(vendaPF)}</div>
            <div class="ap-card-sub">${num(qtdPF)} vendas</div>
          </div>
          <div class="ap-card">
            <div class="ap-card-label">${mesAntNome} ${anoAnt}</div>
            <div class="ap-card-val ap-card-val-pal">${brl(vendaPFAnt)}</div>
            <div class="ap-card-sub">Mesmo mês ano anterior</div>
          </div>
        </div>
        <div class="ap-cresc" style="border-color:${corCresc};color:${corCresc}">
          CRESCIMENTO: ${crescStr}
        </div>
        <h3>Detalhamento por Rede (preencher manualmente)</h3>
        <div class="ap-grid-3">
          <div class="ap-card-sm">
            <b>Rede Texnet</b><br>
            ${mesNome}: ${_edit('vendaPF_texnet_val', 'R$ 0,00')} · ${_edit('vendaPF_texnet_qtd', '0')} vendas<br>
            <span class="ap-mut">${mesAntNome}/${anoAnt}: ${_edit('vendaPF_texnet_val_ant', 'R$ 0,00')} · ${_edit('vendaPF_texnet_qtd_ant', '0')} vendas</span>
          </div>
          <div class="ap-card-sm">
            <b>Rede VTAL Fortaleza</b><br>
            ${mesNome}: ${_edit('vendaPF_vtalFor_val', 'R$ 0,00')} · ${_edit('vendaPF_vtalFor_qtd', '0')} vendas<br>
            <span class="ap-mut">${mesAntNome}/${anoAnt}: ${_edit('vendaPF_vtalFor_val_ant', 'R$ 0,00')} · ${_edit('vendaPF_vtalFor_qtd_ant', '0')} vendas</span>
          </div>
          <div class="ap-card-sm">
            <b>Rede VTAL Fora</b><br>
            ${mesNome}: ${_edit('vendaPF_vtalFora_val', 'R$ 0,00')} · ${_edit('vendaPF_vtalFora_qtd', '0')} vendas<br>
            <span class="ap-mut">${mesAntNome}/${anoAnt}: ${_edit('vendaPF_vtalFora_val_ant', 'R$ 0,00')} · ${_edit('vendaPF_vtalFora_qtd_ant', '0')} vendas</span>
          </div>
        </div>
      </section>`;
  }

  function slideVendasPJ(val, valAnt, mesNome, mesAntNome, anoAnt) {
    const vendaPJ    = _v(val, 'Novos Negócios PJ', 'Total Venda PJ');
    const vendaPJAnt = _v(valAnt, 'Novos Negócios PJ', 'Total Venda PJ');
    const qtdPJ      = _v(val, 'Novos Clientes PJ');
    const tkPJ       = _v(val, 'Ticket Médio Venda PJ');
    return `
      <section class="ap-slide">
        <h2>💼 Vendas PJ — Comparativo</h2>
        <div class="ap-grid-2">
          <div class="ap-card ap-card-dest">
            <div class="ap-card-label">${mesNome}</div>
            <div class="ap-card-val">${brl(vendaPJ)}</div>
            <div class="ap-card-sub">${num(qtdPJ)} vendas · Ticket Médio ${brl(tkPJ)}</div>
          </div>
          <div class="ap-card">
            <div class="ap-card-label">${mesAntNome} ${anoAnt}</div>
            <div class="ap-card-val ap-card-val-pal">${brl(vendaPJAnt)}</div>
            <div class="ap-card-sub">Mesmo mês ano anterior</div>
          </div>
        </div>
        <h3>Eventos (preencher manualmente)</h3>
        <div class="ap-grid-2">
          <div class="ap-card-sm">
            <b>Eventos ${mesNome}</b><br>
            Valor: ${_edit('eventos_val', 'R$ 0,00')}
          </div>
          <div class="ap-card-sm">
            <b>Eventos ${mesAntNome} ${anoAnt}</b><br>
            Valor: ${_edit('eventos_val_ant', 'R$ 0,00')}
          </div>
        </div>
      </section>`;
  }

  function slideResultadoPJ(val, mesNome) {
    const pagos      = _v(val, 'Novos Negócios PJ');
    const posPago    = _v(val, 'Pós Pago Novos Negocios', 'Pós Pago Novos Negócios');
    const taxa       = _v(val, 'Valor Taxa Instalação');
    return `
      <section class="ap-slide">
        <h2>📈 Resultado PJ — ${mesNome}</h2>
        <div class="ap-grid-4">
          <div class="ap-card-sm">
            <div class="ap-card-label">PAGOS</div>
            <div class="ap-card-val ap-card-val-md">${brl(pagos)}</div>
          </div>
          <div class="ap-card-sm">
            <div class="ap-card-label">PÓS-PAGO</div>
            <div class="ap-card-val ap-card-val-md">${brl(posPago)}</div>
          </div>
          <div class="ap-card-sm">
            <div class="ap-card-label">TAXA DE INSTALAÇÃO</div>
            <div class="ap-card-val ap-card-val-md">${brl(taxa)}</div>
          </div>
          <div class="ap-card-sm">
            <div class="ap-card-label">EVENTOS</div>
            <div class="ap-card-val ap-card-val-md">${_edit('result_eventos', 'R$ 0,00')}</div>
          </div>
        </div>
      </section>`;
  }

  function slidePosPago(mesNome) {
    return `
      <section class="ap-slide">
        <h2>💳 Pós-Pago — Acompanhamento</h2>
        <h3>Fechamento Pós ${_edit('pos_fech_mes', 'Mês/Ano')}</h3>
        <div class="ap-grid-4">
          <div class="ap-card-sm"><b>Total Vendidos</b><br><span class="ap-big">${_edit('pos_fech_total', '0')} vendas</span></div>
          <div class="ap-card-sm"><b>% Recebidos</b><br><span class="ap-big">${_edit('pos_fech_perc', '0%')}</span></div>
          <div class="ap-card-sm"><b>Pagos</b><br>${_edit('pos_fech_pagos_qtd', '0')} clientes · ${_edit('pos_fech_pagos_val', 'R$ 0,00')}</div>
          <div class="ap-card-sm"><b>Cancelados</b><br>${_edit('pos_fech_canc_qtd', '0')} clientes · ${_edit('pos_fech_canc_val', 'R$ 0,00')}</div>
        </div>
        <h3>Acompanhamento Pós ${mesNome}</h3>
        <div class="ap-grid-4">
          <div class="ap-card-sm"><b>Total Vendidos</b><br><span class="ap-big">${_edit('pos_acomp_total', '0')} vendas</span></div>
          <div class="ap-card-sm"><b>% Recebidos</b><br><span class="ap-big">${_edit('pos_acomp_perc', '0%')}</span></div>
          <div class="ap-card-sm"><b>Pagos</b><br>${_edit('pos_acomp_pagos_qtd', '0')} clientes · ${_edit('pos_acomp_pagos_val', 'R$ 0,00')}</div>
          <div class="ap-card-sm"><b>Em Acompanhamento</b><br>${_edit('pos_acomp_acomp_qtd', '0')} clientes · ${_edit('pos_acomp_acomp_val', 'R$ 0,00')}</div>
        </div>
      </section>`;
  }

  function slideRetiradas(val, mesNome) {
    const retiradas = _v(val, 'Retiradas Realizadas', 'Retiradas');
    return `
      <section class="ap-slide">
        <h2>🔧 Retiradas / OS 1ª Mensalidade — ${mesNome}</h2>
        <div class="ap-grid-3">
          <div class="ap-card-sm">
            <div class="ap-card-label">OS Abertas 1ª Mensalidade</div>
            <div class="ap-card-val ap-card-val-md">${_edit('ret_osAbertas', '0')}</div>
          </div>
          <div class="ap-card-sm">
            <div class="ap-card-label">Equip. Recolhidos no Mês</div>
            <div class="ap-card-val ap-card-val-md">${num(retiradas)}</div>
            <div class="ap-card-sub">(${_edit('ret_recolhAcum', '0')} acumulado)</div>
          </div>
          <div class="ap-card-sm">
            <div class="ap-card-label">Reativações</div>
            <div class="ap-card-val ap-card-val-md">${_v(val, 'Reativações Retiradas') || _edit('ret_reativacoes', '0')}</div>
          </div>
          <div class="ap-card-sm">
            <div class="ap-card-label">Retiradas Pendentes</div>
            <div class="ap-card-val ap-card-val-md">${_edit('ret_pendMes', '0')}</div>
            <div class="ap-card-sub">(${_edit('ret_pendAcum', '0')} acumulado)</div>
          </div>
          <div class="ap-card-sm">
            <div class="ap-card-label">Equip. Perdidos</div>
            <div class="ap-card-val ap-card-val-md">${_edit('ret_perdMes', '0')}</div>
            <div class="ap-card-sub">(${_edit('ret_perdAcum', '0')} acumulado)</div>
          </div>
        </div>
      </section>`;
  }

  function slideEstoque(mesNome) {
    return `
      <section class="ap-slide">
        <h2>📦 Estoque / Testes de Equipamentos — ${mesNome}</h2>
        <div class="ap-grid-2">
          <div class="ap-card">
            <div class="ap-card-label">Total Testado no Mês</div>
            <div class="ap-card-val">${_edit('est_total', '0')}</div>
            <div class="ap-card-sub">Aptos: ${_edit('est_total_aptos', '0')} · % reaproveit.: ${_edit('est_total_perc', '0%')}</div>
          </div>
          <div class="ap-card">
            <div class="ap-card-label">Equip. de Retirada</div>
            <div class="ap-card-val ap-card-val-pal">${_edit('est_ret', '0')}</div>
            <div class="ap-card-sub">Aptos: ${_edit('est_ret_aptos', '0')} · % reaproveit.: ${_edit('est_ret_perc', '0%')}</div>
          </div>
          <div class="ap-card">
            <div class="ap-card-label">Equip. de Troca</div>
            <div class="ap-card-val ap-card-val-pal">${_edit('est_tro', '0')}</div>
            <div class="ap-card-sub">Aptos: ${_edit('est_tro_aptos', '0')} · % reaproveit.: ${_edit('est_tro_perc', '0%')}</div>
          </div>
          <div class="ap-card">
            <div class="ap-card-label">Equip. de Pintura</div>
            <div class="ap-card-val ap-card-val-pal">${_edit('est_pin', '0')}</div>
            <div class="ap-card-sub">Aptos: ${_edit('est_pin_aptos', '0')} · % reaproveit.: ${_edit('est_pin_perc', '0%')}</div>
          </div>
        </div>
        <h3>Equipamentos Retirados do Cofre</h3>
        <div class="ap-card-sm" style="grid-column:1/-1">
          Total: <b>${_edit('cofre_total', '0')} equipamentos</b><br>
          ONT Huawei EG8145V5-V2: ${_edit('cofre_huawei8145', '0')} unidades<br>
          ONT Nokia: ${_edit('cofre_nokia', '0')} unidades<br>
          Roteador Huawei AX3S: ${_edit('cofre_ax3s', '0')} unidades<br>
          ONU C-DATA: ${_edit('cofre_cdata', '0')} unidades
        </div>
      </section>`;
  }

  function slideCancInadimplencia(val, valAnt, mesNome, mesAntNome, anoAnt) {
    const cancPF   = _v(val, 'Cancelamento PF');
    const cancPJ   = _v(val, 'Cancelam. PME + PJ', 'Cancelamento PME + PJ');
    const valCancPF= _v(val, 'Valor Cancelamento PF');
    const valCancPJ= _v(val, 'Valor Canc. PJ + PME');
    const cancPFA  = _v(valAnt, 'Cancelamento PF');
    const cancPJA  = _v(valAnt, 'Cancelam. PME + PJ', 'Cancelamento PME + PJ');
    const valCancPFA= _v(valAnt, 'Valor Cancelamento PF');
    const valCancPJA= _v(valAnt, 'Valor Canc. PJ + PME');

    return `
      <section class="ap-slide">
        <h2>❌ Cancelamento por Inadimplência</h2>
        <h3>${mesAntNome} ${anoAnt}</h3>
        <table class="ap-tbl">
          <tr><th></th><th>Quantidade</th><th>Valor</th></tr>
          <tr><td>OS</td><td>${_edit('canc_ant_os_qtd', '0')}</td><td>${_edit('canc_ant_os_val', 'R$ 0,00')}</td></tr>
          <tr><td>Retenção</td><td>${_edit('canc_ant_ret_qtd', '0')}</td><td>${_edit('canc_ant_ret_val', 'R$ 0,00')}</td></tr>
          <tr><td>Canc. Texnet</td><td>${num(cancPFA + cancPJA)}</td><td>${brl(valCancPFA + valCancPJA)}</td></tr>
          <tr><td>Canc. VTAL</td><td>${_edit('canc_ant_vtal_qtd', '0')}</td><td>${_edit('canc_ant_vtal_val', 'R$ 0,00')}</td></tr>
          <tr class="ap-tbl-tot"><td>Total Cancelado</td><td>${_edit('canc_ant_tot_qtd', '0')}</td><td>${_edit('canc_ant_tot_val', 'R$ 0,00')}</td></tr>
        </table>
        <h3>${mesNome}</h3>
        <table class="ap-tbl">
          <tr><th></th><th>Quantidade</th><th>Valor</th></tr>
          <tr><td>OS</td><td>${_edit('canc_mes_os_qtd', '0')}</td><td>${_edit('canc_mes_os_val', 'R$ 0,00')}</td></tr>
          <tr><td>Retenção</td><td>${_edit('canc_mes_ret_qtd', '0')}</td><td>${_edit('canc_mes_ret_val', 'R$ 0,00')}</td></tr>
          <tr><td>Canc. Texnet</td><td>${num(cancPF + cancPJ)}</td><td>${brl(valCancPF + valCancPJ)}</td></tr>
          <tr><td>Canc. VTAL</td><td>${_edit('canc_mes_vtal_qtd', '0')}</td><td>${_edit('canc_mes_vtal_val', 'R$ 0,00')}</td></tr>
          <tr class="ap-tbl-tot"><td>Total Cancelado</td><td>${_edit('canc_mes_tot_qtd', '0')}</td><td>${_edit('canc_mes_tot_val', 'R$ 0,00')}</td></tr>
        </table>
      </section>`;
  }

  function slideCobranca(mesNome) {
    return `
      <section class="ap-slide">
        <h2>💰 Cobrança Terceirizada — ${mesNome}</h2>
        <div class="ap-grid-3">
          <div class="ap-card">
            <div class="ap-card-label">Quantidade</div>
            <div class="ap-card-val">${_edit('cob_qtd', '0')}</div>
          </div>
          <div class="ap-card ap-card-dest">
            <div class="ap-card-label">Valor Recuperado no Mês</div>
            <div class="ap-card-val">${_edit('cob_valMes', 'R$ 0,00')}</div>
          </div>
          <div class="ap-card">
            <div class="ap-card-label">Total Recuperado Ano</div>
            <div class="ap-card-val">${_edit('cob_valAno', 'R$ 0,00')}</div>
          </div>
        </div>
        <h3>Equipamentos Recolhidos via Cobrança</h3>
        <div class="ap-card-sm" style="grid-column:1/-1">
          ${_edit('cob_equip', '0')} equipamento(s)
        </div>
      </section>`;
  }

  function slideReclameAqui() {
    return `
      <section class="ap-slide">
        <h2>⭐ Reclame Aqui</h2>
        <h3>Texnet — Período: ${_edit('ra_periodo', '__/__/____ a __/__/____')}</h3>
        <div class="ap-grid-3">
          <div class="ap-card ap-card-dest">
            <div class="ap-card-label">Nota Geral</div>
            <div class="ap-card-val">${_edit('ra_nota', '0,0')} / 10</div>
            <div class="ap-card-sub">${_edit('ra_classif', 'Classificação')}</div>
          </div>
          <div class="ap-card-sm"><b>Reclamações</b><br>${_edit('ra_reclQtd', '0')}</div>
          <div class="ap-card-sm"><b>Respondidas</b><br>${_edit('ra_respQtd', '0')} (${_edit('ra_respPerc', '0%')})</div>
          <div class="ap-card-sm"><b>Avaliadas</b><br>${_edit('ra_avalQtd', '0')}</div>
          <div class="ap-card-sm"><b>Voltariam a Fazer Negócio</b><br>${_edit('ra_voltar', '0%')}</div>
          <div class="ap-card-sm"><b>Índice de Solução</b><br>${_edit('ra_solucao', '0%')}</div>
          <div class="ap-card-sm"><b>Nota do Consumidor</b><br>${_edit('ra_notaCons', '0,0')}</div>
          <div class="ap-card-sm"><b>Tempo Médio Resposta</b><br>${_edit('ra_tempo', '0 dias')}</div>
        </div>
        <h3>Comparativo Concorrentes</h3>
        <table class="ap-tbl">
          <tr><th>Empresa</th><th>Nota</th><th>Classificação</th></tr>
          <tr><td>${_edit('ra_c1_nome', 'Concorrente 1')}</td><td>${_edit('ra_c1_nota', '0,0')}</td><td>${_edit('ra_c1_class', '—')}</td></tr>
          <tr><td>${_edit('ra_c2_nome', 'Concorrente 2')}</td><td>${_edit('ra_c2_nota', '0,0')}</td><td>${_edit('ra_c2_class', '—')}</td></tr>
          <tr><td>${_edit('ra_c3_nome', 'Concorrente 3')}</td><td>${_edit('ra_c3_nota', '0,0')}</td><td>${_edit('ra_c3_class', '—')}</td></tr>
        </table>
      </section>`;
  }

  function slideObrigado() {
    return `
      <section class="ap-slide ap-capa">
        <div class="ap-capa-box">
          <h1 style="font-size:5rem">Obrigada!</h1>
          <div class="ap-capa-sub">Comercial PF · Relacionamento com Cliente</div>
          <div class="ap-capa-rod">TEXNET</div>
        </div>
      </section>`;
  }

  // ── Estilos (injetados uma vez) ────────────────────────────────────
  function _injetarEstilos() {
    if (document.getElementById('apOpStyles')) return;
    const css = `
      #apOpOverlay { position:fixed; inset:0; background:#0a0e1a; z-index:9999; overflow-y:auto; padding:0; display:none; }
      #apOpOverlay.aberto { display:block; }
      #apOpToolbar { position:sticky; top:0; z-index:10; background:rgba(10,14,26,0.95); backdrop-filter:blur(8px); padding:0.75rem 1.25rem; display:flex; gap:0.75rem; align-items:center; border-bottom:1px solid #1e293b; }
      #apOpToolbar button { padding:0.55rem 1.1rem; border-radius:8px; border:1px solid #334155; background:#1e293b; color:#e2e8f0; cursor:pointer; font-weight:600; font-size:0.85rem; }
      #apOpToolbar button:hover { background:#334155; }
      #apOpToolbar button.ap-primary { background:linear-gradient(135deg,#7c3aed,#db2777); border-color:#a78bfa; }
      #apOpToolbar .ap-spacer { flex:1; }
      #apOpToolbar .ap-info { color:#94a3b8; font-size:0.85rem; }
      .ap-slide { max-width:1100px; margin:1.5rem auto; background:white; color:#0f172a; border-radius:14px; padding:2.5rem 3rem; box-shadow:0 20px 50px rgba(0,0,0,0.4); page-break-after:always; min-height:calc(100vh - 6rem); }
      .ap-slide h2 { font-size:2rem; color:#1e3a8a; margin:0 0 1.25rem; border-bottom:3px solid #7c3aed; padding-bottom:0.5rem; }
      .ap-slide h3 { font-size:1.15rem; color:#475569; margin:1.5rem 0 0.75rem; }
      .ap-capa { background:linear-gradient(135deg,#1e3a8a 0%,#7c3aed 50%,#db2777 100%); color:white; display:flex; align-items:center; justify-content:center; }
      .ap-capa-box { text-align:center; }
      .ap-capa-mini { font-size:1rem; letter-spacing:8px; opacity:0.8; margin-bottom:1rem; }
      .ap-capa h1 { font-size:4.5rem; margin:0; font-weight:800; }
      .ap-capa-sub { font-size:1.25rem; opacity:0.85; margin-top:1rem; }
      .ap-capa-rod { font-size:1.5rem; font-weight:800; margin-top:3rem; letter-spacing:4px; opacity:0.9; }
      .ap-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
      .ap-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1rem; }
      .ap-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1rem; }
      .ap-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; }
      .ap-card-dest { background:linear-gradient(135deg,#1e3a8a,#7c3aed); color:white; border:none; }
      .ap-card-sm { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:0.85rem 1rem; font-size:0.9rem; }
      .ap-card-label { font-size:0.78rem; font-weight:600; letter-spacing:1px; opacity:0.8; margin-bottom:0.5rem; }
      .ap-card-val { font-size:2rem; font-weight:800; }
      .ap-card-val-md { font-size:1.4rem; }
      .ap-card-val-pal { color:#475569; }
      .ap-card-sub { font-size:0.85rem; opacity:0.75; margin-top:0.35rem; }
      .ap-cresc { text-align:center; font-size:1.5rem; font-weight:800; padding:0.85rem; border:3px solid; border-radius:12px; margin:1rem 0 1.5rem; }
      .ap-tbl { width:100%; border-collapse:collapse; margin-bottom:1rem; }
      .ap-tbl th, .ap-tbl td { padding:0.6rem 0.85rem; border:1px solid #e2e8f0; text-align:left; font-size:0.9rem; }
      .ap-tbl th { background:#1e3a8a; color:white; font-weight:700; }
      .ap-tbl-tot { background:#fef3c7; font-weight:800; }
      .ap-mut { color:#64748b; font-size:0.85rem; }
      .ap-big { font-size:1.1rem; font-weight:700; color:#1e3a8a; }
      .ap-edit { display:inline-block; min-width:60px; padding:0.1rem 0.4rem; background:#fef9c3; border:1px dashed #facc15; border-radius:4px; outline:none; cursor:text; }
      .ap-edit:focus { background:#fef08a; border-style:solid; }
      .ap-edit:empty::before { content:attr(data-placeholder); color:#a3a3a3; font-style:italic; }
      @media print {
        body * { visibility:hidden; }
        #apOpOverlay, #apOpOverlay * { visibility:visible; }
        #apOpToolbar { display:none !important; }
        #apOpOverlay { position:static; background:white; padding:0; }
        .ap-slide { box-shadow:none; margin:0; border-radius:0; page-break-after:always; min-height:auto; }
        .ap-edit { background:transparent; border:none; }
      }
    `;
    const style = document.createElement('style');
    style.id = 'apOpStyles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── Abrir apresentação ─────────────────────────────────────────────
  async function abrirApresentacaoOp() {
    _injetarEstilos();

    // Lê mês/ano dos filtros da aba operacional
    const mesIdx = parseInt((typeof msGetFirst === 'function' ? msGetFirst('opMesFiltro') : null) || new Date().getMonth());
    const ano    = parseInt((typeof msGetFirst === 'function' ? msGetFirst('opAnoFiltro') : null) || new Date().getFullYear());

    const mesNome    = MESES_NOME[mesIdx];
    const mesAntIdx  = mesIdx === 0 ? 11 : mesIdx - 1;
    const mesAntNome = MESES_NOME[mesAntIdx];
    const anoAnt     = ano - 1;
    const mes        = _mesKey(mesIdx, ano);
    _mesAtual = mes;

    // Carrega tudo em paralelo
    const [valMes, valAnoAnt, manuais] = await Promise.all([
      _carregarMes(mes),
      _carregarMes(_mesAnoAntKey(mesIdx, ano)),
      _carregarManuais(mes),
    ]);
    _manuaisAtuais = manuais;

    let overlay = document.getElementById('apOpOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'apOpOverlay';
      document.body.appendChild(overlay);
    }

    const semDados = !valMes;
    const aviso = semDados
      ? `<div style="max-width:1100px;margin:1.5rem auto;background:#fef3c7;border:1px solid #fde68a;color:#92400e;padding:1rem 1.5rem;border-radius:10px;font-size:0.9rem">
           ⚠️ <b>Sem dados do Power BI para ${mesNome}/${ano}.</b> Os números automáticos virão em branco. Você pode preencher tudo manualmente nos campos amarelos.
         </div>`
      : '';

    overlay.innerHTML = `
      <div id="apOpToolbar">
        <button onclick="apOpFechar()">✕ Fechar</button>
        <span class="ap-info">📅 ${mesNome} ${ano}</span>
        <span class="ap-spacer"></span>
        <span class="ap-info">💡 Campos amarelos são editáveis — clique e digite. Salva automático.</span>
        <button class="ap-primary" onclick="window.print()">🖨️ Imprimir / PDF</button>
      </div>
      ${aviso}
      ${slideCapa(mesNome, ano)}
      ${slideVendasPF(valMes, valAnoAnt, mesNome, mesNome, anoAnt)}
      ${slideVendasPJ(valMes, valAnoAnt, mesNome, mesNome, anoAnt)}
      ${slideResultadoPJ(valMes, mesNome)}
      ${slidePosPago(mesNome)}
      ${slideRetiradas(valMes, mesNome)}
      ${slideEstoque(mesNome)}
      ${slideCancInadimplencia(valMes, valAnoAnt, mesNome, mesNome, anoAnt)}
      ${slideCobranca(mesNome)}
      ${slideReclameAqui()}
      ${slideObrigado()}
    `;

    // Liga eventos nos contenteditable
    overlay.querySelectorAll('.ap-edit').forEach(el => {
      el.addEventListener('input', () => {
        _manuaisAtuais[el.dataset.campo] = el.textContent;
        _agendarSalvar();
      });
    });

    overlay.classList.add('aberto');
    overlay.scrollTop = 0;
  }

  function fecharApresentacaoOp() {
    const overlay = document.getElementById('apOpOverlay');
    if (overlay) overlay.classList.remove('aberto');
    // Flush salvar pendente
    if (_salvarPendente) { clearTimeout(_salvarPendente); _salvarManuais(_mesAtual, _manuaisAtuais); _salvarPendente = null; }
  }

  // Expor globalmente
  window.abrirApresentacaoOp = abrirApresentacaoOp;
  window.apOpFechar = fecharApresentacaoOp;
})();
