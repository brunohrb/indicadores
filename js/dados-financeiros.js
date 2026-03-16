// ==================== DADOS FINANCEIROS ====================
    const dadosFinanceiros = {
      receitas: [
        { nome:"Link Pessoa Física",jan:1463928.46,fev:1235675.95,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:2699604.41 },
        { nome:"Link Pessoa Jurídica",jan:1189771.05,fev:788162.94,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:1977933.99 },
        { nome:"Juros/Multa",jan:56504.43,fev:38890.31,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:95394.74 },
        { nome:"Taxa de instalação",jan:7135.13,fev:2266.66,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:9401.79 },
        { nome:"Eventos",jan:3150.0,fev:3497.01,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:6647.01 },
        { nome:"Multa fidelidade e equipamento",jan:663.87,fev:1139.97,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:1803.84 },
        { nome:"Rendimentos financeiros",jan:2160.49,fev:2472.71,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:4633.2 },
        { nome:"V. Ativos imobilizados",jan:0,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:0.0 },
        { nome:"Vendas canceladas e estornos",jan:-2757.11,fev:-572.13,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:-3329.24 }
      ],
      impostos: [
        { nome:"ICMS",jan:88221.38,fev:99080.62,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:187302.0 },
        { nome:"COFINS",jan:52907.2,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:52907.2 },
        { nome:"PIS",jan:11417.3,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:11417.3 },
        { nome:"IRPJ",jan:70847.45,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:70847.45 },
        { nome:"CSLL",jan:27665.08,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:27665.08 },
        { nome:"ISS",jan:5745.14,fev:6285.8,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:12030.94 },
        { nome:"ISS Retido",jan:1218.24,fev:1267.39,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:2485.63 },
        { nome:"Simples Nacional",jan:1626.28,fev:1343.8,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:2970.08 },
        { nome:"FUST/FUNTTEL",jan:17091.99,fev:12526.67,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:29618.66 }
      ],
      custos: [
        { nome:"Kit Instalação",jan:152053.14,fev:174266.31,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:326319.45 },
        { nome:"Materiais de Rede",jan:49341.66,fev:22670.74,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:72012.4 },
        { nome:"Links de Dados / Voip",jan:57341.58,fev:56833.25,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:114174.83 },
        { nome:"Vtal",jan:62847.53,fev:64036.63,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:126884.16 },
        { nome:"Alugueis de Postes",jan:17793.58,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:17793.58 },
        { nome:"Alugueis de Torre e POP",jan:14480.49,fev:10440.56,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:24921.05 },
        { nome:"Custo com SVA",jan:13393.41,fev:13393.41,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:26786.82 },
        { nome:"Energia / POP",jan:29532.99,fev:11047.02,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:40580.01 },
        { nome:"Manutenção POP",jan:2795.5,fev:691.69,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:3487.19 },
        { nome:"Comissões de vendas",jan:38831.33,fev:29272.77,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:68104.1 },
        { nome:"Combustivel técnico",jan:31157.92,fev:32876.03,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:64033.95 },
        { nome:"Manut. Veículo",jan:17987.66,fev:14486.91,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:32474.57 },
        { nome:"Folha - Direta",jan:709835.26,fev:561211.24,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:1271046.5 },
        { nome:"Telefonia",jan:4632.76,fev:4393.22,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:9025.98 },
        { nome:"Man. Equipamento",jan:779.28,fev:140.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:919.28 },
        { nome:"Ferramentas",jan:8224.74,fev:6483.02,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:14707.76 },
        { nome:"Moveis e equipamentos escritório TI",jan:1241.88,fev:1233.53,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:2475.41 },
        { nome:"Tercerização de Serv. (Instalações)",jan:0.0,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:0.0 },
        { nome:"Custos Lastmile",jan:34330.68,fev:33940.41,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:68271.09 }
      ],
      despesas: [
        { nome:"Marketing",jan:54183.69,fev:51344.74,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:105528.43 },
        { nome:"Serv. Terceiros, jurídicos e consultorias",jan:39654.73,fev:29887.23,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:69541.96 },
        { nome:"Viagens/Estadia",jan:0.0,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:0.0 },
        { nome:"Segurança Trabalho/ EPI",jan:332.5,fev:2041.42,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:2373.92 },
        { nome:"Desp. Aluguel de escritório",jan:25978.9,fev:26994.1,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:52973.0 },
        { nome:"Desp. Reformas empresa",jan:3552.5,fev:2193.71,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:5746.21 },
        { nome:"Material de uso, consumo e papelaria",jan:2463.51,fev:327.8,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:2791.31 },
        { nome:"Combustivel Adm",jan:954.05,fev:801.72,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:1755.77 },
        { nome:"Despesas e taxas com Veiculos",jan:955.76,fev:13047.56,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:14003.32 },
        { nome:"Despesas Tributárias/ Taxas legais",jan:3609.38,fev:571.43,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:4180.81 },
        { nome:"Despesas Judiciais",jan:606.02,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:606.02 },
        { nome:"Treinamentos",jan:0.0,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0,nov:0.0,dez:0.0,total:0.0 },
        { nome:"Pró-Labore",jan:200000.0,fev:200000.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:400000.0 },
        { nome:"Sistema",jan:18131.16,fev:21847.41,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:39978.57 },
        { nome:"Taxas Boleto",jan:9409.45,fev:6727.14,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:16136.59 },
        { nome:"Enérgia Elétrica escritório",jan:2307.66,fev:4977.36,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:7285.02 },
        { nome:"Despesas Diversas / Estacionamento",jan:1412.13,fev:3715.51,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:5127.64 },
        { nome:"Tarifas bancárias",jan:1402.08,fev:101.29,mar:447.44,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:1950.81 }
      ],
      ebitda: [
        { nome:"EBITDA",jan:832261.35,fev:549104.45,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:1381365.8 }
      ],
      ebitda_ajustado: [
        { nome:"IRPJ (Previsão)",jan:20713.14,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:20713.14 },
        { nome:"CSSL (Previsão)",jan:8176.73,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:8176.73 },
        { nome:"Trimestral",jan:98512.53,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:98512.53 },
        { nome:"Compra de Provedor",jan:11708.33,fev:11708.33,mar:11708.33,abr:11708.33,mai:11708.33,jun:11708.33,jul:11708.33,ago:11708.33,set:11708.33,out:11708.33,nov:11708.33,dez:11708.33,total:140499.96 },
        { nome:"Credito ICMS",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
        { nome:"Ajuste (Mark/Equip)",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
        { nome:"Datora",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
        { nome:"Inclusão 2",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
        { nome:"Inclusão 3",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
        { nome:"Inclusão 4",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
        { nome:"Inclusão 5",jan:0,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:0 },
        { nome:"Ajuste (Postes)",jan:30497.32,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:30497.32 },
        { nome:"Ajuste Vtal Fora",jan:14996.53,fev:0,mar:0,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0,total:14996.53 },
        { nome:"EBITDA (Ajustado)",jan:844681.83,fev:537396.12,mar:-11708.33,abr:-11708.33,mai:-11708.33,jun:-11708.33,jul:-11708.33,ago:-11708.33,set:-11708.33,out:-11708.33,nov:-11708.33,dez:-11708.33,total:1264994.65 }
      ],
      ajustes: [
        { nome:"Compra de veículos",jan:8448.44,fev:57977.36,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:66425.8 },
        { nome:"Invest. técnico e administrativo",jan:18531.78,fev:1831.78,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:20363.56 },
        { nome:"Aq. de provedor",jan:0.0,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:0.0 },
        { nome:"Parcel. Impostos",jan:44979.14,fev:45327.44,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:90306.58 },
        { nome:"Investimentos POP",jan:35186.47,fev:73528.4,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:108714.87 },
        { nome:"Empréstimos para giro",jan:44067.64,fev:22495.76,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:66563.4 },
        { nome:"Reneg. Débitos",jan:0.0,fev:1000.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:1000.0 },
        { nome:"Sócios ou Retiradas",jan:293512.31,fev:299669.73,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:593182.04 }
      ]
    };

    const dadosComparativos = {
      2026:{receitas:2851389.90,custos:1700000,despesas:700000,ebitda:938703.66,ebitdaAjustado:852829.83},
      2025:{receitas:2500000,custos:1500000,despesas:600000,ebitda:850000,ebitdaAjustado:750000},
      2024:{receitas:2200000,custos:1400000,despesas:550000,ebitda:750000,ebitdaAjustado:650000}
    };

    function formatCurrency(v) {
      if (v===null||v===undefined) return '-';
      return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2}).format(v);
    }

    function selectMenu(el,view) {
      document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
      el.classList.add('active');
      document.getElementById('viewType').value = view;
      changeView();
    }

    // ========== HISTÓRICO FLUXO DE CAIXA ==========
    // dadosFluxoAtual: variável LOCAL do Fluxo de Caixa — não afeta Dashboard nem Comissões
    let dadosFluxoAtual = dadosFinanceiros; // começa com 2026
    const _tableCache = new Map(); // cache HTML por categoria+ano

    function mudarAnoFluxo(ano, btn) {
      _tableCache.clear(); // invalida cache ao trocar ano
      document.querySelectorAll('#anosBtnGroup .year-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      const mapas = {
        2023: typeof dadosFinanceiros2023 !== 'undefined' ? dadosFinanceiros2023 : null,
        2024: typeof dadosFinanceiros2024 !== 'undefined' ? dadosFinanceiros2024 : null,
        2025: typeof dadosFinanceiros2025 !== 'undefined' ? dadosFinanceiros2025 : null,
        2026: dadosFinanceiros,
      };
      dadosFluxoAtual = mapas[ano] || dadosFinanceiros;
      // Atualiza label do cabeçalho
      const lbl = document.querySelector('#consolidadoView .fluxo-ano-label');
      if (lbl) lbl.textContent = ano;
      // Re-renderiza a tab ativa
      const activeTab = document.querySelector('#consolidadoView .tab-btn.active');
      const tabId = activeTab ? activeTab.dataset.tab : 'receitas';
      showTab(tabId);
    }

        function changeView() {
      const v = document.getElementById('viewType').value;
      document.querySelectorAll('.view-container').forEach(c=>{c.classList.remove('active');c.style.display='none';});
      
      const hideHeader = ['consolidado','comparativo','powerbi','ia-estrategica','diretoria','comissao-financeiro','comissao-operacional','indicadores','demonstrativo'];
      document.getElementById('mainHeader').style.display = hideHeader.includes(v) ? 'none' : 'block';
      const show = id => { const el=document.getElementById(id); el.style.display='block'; el.classList.add('active'); };
      if (v==='dashboard') { show('dashboardView'); renderizarGraficos();  }
      else if (v==='consolidado') { show('consolidadoView'); showTab('receitas'); }
      else if (v==='comparativo') { show('comparativoView'); renderComparisonCards(); renderCompTab('receitas-comp'); }
      else if (v==='powerbi') show('powerbiView');
      else if (v==='ia-estrategica') { show('iaEstrategicaView'); carregarApiKey(); }
      else if (v==='indicadores') { show('indicadoresView'); renderIndicadores(); }
      else if (v==='demonstrativo') {
        show('demonstrativoView');
        setTimeout(function() { if (typeof carregarDemonstrativo === 'function') carregarDemonstrativo(); }, 100);
      }
      else if (v==='diretoria') { show('diretoriaView'); carregarParams(); diretoriaCarregarUltimoMes(); filtrarHist2025('Dezembro'); }
      else if (v==='comissao-financeiro') { show('comissaoFinanceiroView'); carregarParams().then(()=>renderComissao()); }
      else if (v==='prb') { show('prbView'); if(typeof prbRender==='function') prbRender(); }
      else if (v==='comissao-operacional') { show('comissaoOperacionalView'); carregarParams().then(()=>renderComissaoOp()); }
    }

    function updatePeriod() {}
    function applyFilters() { alert('Filtros aplicados!\nPeríodo: '+document.getElementById('periodFilter').value); }
    function fecharModal() { document.getElementById('dailyModal').classList.remove('active'); }
    function iaCopiar() {
      const el = document.getElementById('iaResultadoTexto');
      const text = el ? el.innerText : '';
      navigator.clipboard.writeText(text).catch(()=>{});
    }

    function iaMarkdown(text) {
      let h = text
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/###\s(.+)/g,'<h3>$1</h3>')
        .replace(/##\s(.+)/g,'<h2>$1</h2>')
        .replace(/#\s(.+)/g,'<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,'<em>$1</em>')
        .replace(/`(.+?)`/g,'<code>$1</code>');
      const paraLines = h.split('\n');
      let out = [];
      let inList = false;
      for(const line of paraLines) {
        const li = line.match(/^[\*\-]\s(.+)/);
        const li2 = line.match(/^\d+\.\s(.+)/);
        if(li||li2) {
          if(!inList) { out.push('<ul>'); inList=true; }
          out.push('<li>'+(li?li[1]:li2[1])+'</li>');
        } else {
          if(inList) { out.push('</ul>'); inList=false; }
          if(line.startsWith('>')) out.push('<blockquote>'+line.slice(1).trim()+'</blockquote>');
          else if(line.startsWith('<h')||line.startsWith('<ul')||line.startsWith('</ul')) out.push(line);
          else if(line.trim()==='') out.push('<br>');
          else out.push('<p>'+line+'</p>');
        }
      }
      if(inList) out.push('</ul>');
      return out.join('');
    }
    function iaMontarContexto(mesKey, mesNome, statusMes) {
      const df = dadosFinanceiros;
      const fc = v => 'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
      const fp = v => (Number(v)*100).toFixed(2).replace('.',',')+' %';
      const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const receitas = df.receitas?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
      const custos   = df.custos?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
      const despesas = df.despesas?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
      const impostos = df.impostos?.reduce((s,r)=>s+(r[mesKey]||0),0)||0;
      const ebitdaItem = df.ebitda_ajustado?.find(r=>r.nome==='EBITDA (Ajustado)');
      const ebitda = ebitdaItem ? (ebitdaItem[mesKey]||0) : 0;
      const lines = [];
      lines.push('EMPRESA: TEXNET (Provedor de Internet - ISP)');
      lines.push('PERIODO DE ANALISE: '+mesNome+'/2026');
      lines.push('STATUS DOS DADOS: '+statusMes);
      lines.push('');
      lines.push('=== RESUMO FINANCEIRO ===');
      lines.push('Receitas Totais: '+fc(receitas));
      lines.push('Impostos: '+fc(impostos)+' ('+fp(receitas>0?impostos/receitas:0)+' da receita)');
      lines.push('Custos Operacionais: '+fc(custos));
      lines.push('Despesas Operacionais: '+fc(despesas));
      lines.push('Total Despesas: '+fc(impostos+custos+despesas));
      lines.push('EBITDA Ajustado: '+fc(ebitda)+' | Margem: '+fp(receitas>0?ebitda/receitas:0));
      lines.push('');
      lines.push('=== DETALHAMENTO RECEITAS ===');
      (df.receitas||[]).filter(r=>(r[mesKey]||0)>0).forEach(r=>lines.push('  '+r.nome+': '+fc(r[mesKey])));
      lines.push('');
      lines.push('=== IMPOSTOS ===');
      (df.impostos||[]).filter(r=>(r[mesKey]||0)>0).forEach(r=>lines.push('  '+r.nome+': '+fc(r[mesKey])));
      lines.push('');
      lines.push('=== TOP 10 CUSTOS ===');
      [...(df.custos||[])].sort((a,b)=>(b[mesKey]||0)-(a[mesKey]||0)).slice(0,10).forEach(c=>lines.push('  '+c.nome+': '+fc(c[mesKey]||0)));
      lines.push('');
      lines.push('=== DESPESAS OPERACIONAIS ===');
      (df.despesas||[]).filter(d=>(d[mesKey]||0)>0).forEach(d=>lines.push('  '+d.nome+': '+fc(d[mesKey])));
      lines.push('');
      lines.push('=== EVOLUCAO ANUAL (receitas acumuladas por mes) ===');
      meses.forEach(m=>{ const v=df.receitas?.reduce((s,r)=>s+(r[m]||0),0)||0; if(v>0) lines.push('  '+m.toUpperCase()+': '+fc(v)); });
      return lines.join('\n');
    }

    async function iaAnalisar(tipo) {
      const mesIdx  = parseInt(document.getElementById('iaMesFiltro')?.value||'1');
      const MESES   = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const MESES_N = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const mesKey  = MESES[mesIdx];
      const mesNome = MESES_N[mesIdx];

      // Detecta se o mês é o atual ou passado
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtualIdx = hoje.getMonth();
      const isMesAtual = (parseInt(document.getElementById('iaAnoFiltro')?.value||'2026') === anoAtual) && (mesIdx === mesAtualIdx);
      const isMesFuturo = (parseInt(document.getElementById('iaAnoFiltro')?.value||'2026') === anoAtual) && (mesIdx > mesAtualIdx);
      const statusMes = isMesFuturo ? 'MES FUTURO (sem dados reais ainda)' : isMesAtual ? ('MES EM ANDAMENTO — dados parciais ate o dia '+hoje.getDate()+'/'+String(hoje.getMonth()+1).padStart(2,'0')) : 'MES FECHADO (dados completos)';

      const contexto = iaMontarContexto(mesKey, mesNome, statusMes);

      const systemPrompt = 'Voce e um analista financeiro senior especialista em provedores de internet (ISP) brasileiro. '
        + 'REGRAS OBRIGATORIAS: '
        + '1) Responda SEMPRE em portugues do Brasil com markdown formatado e emojis estrategicos. '
        + '2) Cite SEMPRE os numeros reais dos dados fornecidos — nunca invente valores. '
        + '3) STATUS DO PERIODO ANALISADO: '+statusMes+'. '
        + (isMesAtual ? 'MUITO IMPORTANTE: os dados deste mes sao PARCIAIS (mes ainda em andamento). NUNCA compare com meses fechados como se fosse queda — sempre mencione que o mes esta em andamento e os valores tendem a crescer ate o fechamento. ' : '')
        + (isMesFuturo ? 'ATENCAO: este mes ainda nao ocorreu. Baseie-se apenas em tendencias historicas dos meses anteriores para projecoes. ' : '')
        + '4) Para meses fechados: compare com benchmarks do setor ISP (margem EBITDA saudavel: 25-35%, churn saudavel: abaixo de 2%). '
        + '5) Seja direto e objetivo — executivos nao querem rodeios.';

      const prompts = {
        cenario:     'Com base nos dados financeiros da TEXNET, faca uma ANALISE DE CENARIO: resumo executivo, situacao financeira, principais receitas, analise dos custos, margem EBITDA vs benchmark ISP (25-35%), pontos de atencao e conclusao. Use markdown com secoes claras.\n\nDADOS:\n'+contexto,
        estrategias: 'Com base nos dados da TEXNET, desenvolva ESTRATEGIAS CONCRETAS para: 1) crescimento de receita, 2) reducao dos 3 maiores custos, 3) melhoria da margem EBITDA, 4) eficiencia operacional. Para cada estrategia: acao especifica, impacto esperado, prazo e dificuldade.\n\nDADOS:\n'+contexto,
        orcamento:   'Com base na evolucao dos dados da TEXNET, projete um ORCAMENTO PARA O PROXIMO TRIMESTRE com tabela de receitas/custos/EBITDA por mes, taxa de crescimento com justificativa, premissas e riscos.\n\nDADOS:\n'+contexto,
        mes:         'Elabore um RELATORIO COMPLETO DE FECHAMENTO DO MES com: resumo executivo, destaques positivos (min 3), pontos de atencao (min 3), analise de cada grupo de custo vs padroes ISP, e recomendacoes concretas para o proximo mes.\n\nDADOS:\n'+contexto,
        previsoes:   'Com base nos dados historicos da TEXNET, elabore PREVISOES para os proximos 3 meses: tendencia de receita, comportamento dos custos, projecao de EBITDA, riscos e oportunidades, e um semaforo de saude financeira (verde/amarelo/vermelho).\n\nDADOS:\n'+contexto,
        alertas:     'Analise os dados e gere ALERTAS INTELIGENTES priorizados: CRITICO (acao imediata), ATENCAO (monitorar), POSITIVO (destaques). Verifique: custos acima do padrao ISP, margem EBITDA fora do benchmark 25-35%, concentracao de receita, anomalias.\n\nDADOS:\n'+contexto,
        chat: ''
      };

      let userPrompt = prompts[tipo];
      if(tipo === 'chat') {
        const pergunta = document.getElementById('iaPergunta').value.trim();
        if(!pergunta) { alert('Digite sua pergunta antes de enviar.'); return; }
        userPrompt = 'Responda objetivamente com base nos dados financeiros abaixo.\n\nDADOS:\n'+contexto+'\n\nPERGUNTA: '+pergunta;
      }

      const titulos = {
        cenario: '📊 Analise de Cenario — '+mesNome+'/2026',
        estrategias: '🎯 Estrategias Recomendadas',
        orcamento: '💰 Orcamento Trimestral',
        mes: '📅 Relatorio de '+mesNome+'/2026',
        previsoes: '🔮 Previsoes Proximos Meses',
        alertas: '⚠️ Alertas Inteligentes',
        chat: '💬 Resposta GPT-4o'
      };

      const sbResult = await sbStorage.get('openaiKey').catch(()=>null);
      const apiKey = sbResult?.value || localStorage.getItem('openaiKey') || '';
      if(!apiKey || !apiKey.startsWith('sk-')) {
        document.getElementById('openaiApiKey')?.focus();
        alert('Cole sua API Key do ChatGPT no campo no topo e clique 💾');
        return;
      }

      document.getElementById('iaLoading').style.display='block';
      document.getElementById('iaResultado').style.display='none';
      document.getElementById('iaLoadingMsg').textContent = 'GPT-4o analisando os dados de '+mesNome+'/2026...';

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '+apiKey
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            max_tokens: 2000,
            temperature: 0.7,
            messages: [{role:'system',content:systemPrompt},{role:'user',content:userPrompt}]
          })
        });

        if(!response.ok) {
          const err = await response.json().catch(()=>({}));
          throw new Error(err.error?.message || 'Erro HTTP '+response.status);
        }

        const data = await response.json();
        const texto = data.choices?.[0]?.message?.content || 'Sem resposta.';

        document.getElementById('iaLoading').style.display='none';
        document.getElementById('iaResultadoTitulo').textContent = titulos[tipo] || 'Resultado';
        document.getElementById('iaResultadoTexto').innerHTML = iaMarkdown(texto);
        document.getElementById('iaResultado').style.display='block';
        document.getElementById('iaResultado').scrollIntoView({behavior:'smooth',block:'start'});

      } catch(e) {
        document.getElementById('iaLoading').style.display='none';
        document.getElementById('iaResultadoTitulo').textContent = 'Erro';
        document.getElementById('iaResultadoTexto').textContent = 'Erro: '+e.message;
        document.getElementById('iaResultado').style.display='block';
      }
    }

    function iaKeyStatus() {
      const v = document.getElementById('openaiApiKey')?.value || '';
      const badge = document.getElementById('iaKeyBadge');
      if(badge) badge.textContent = v.startsWith('sk-') ? '✓ válida' : '';
    }
    async function salvarApiKey() {
      const v = (document.getElementById('openaiApiKey')?.value || '').trim();
      if(!v.startsWith('sk-')) { alert('Key inválida — deve começar com sk-'); return; }
      const badge = document.getElementById('iaKeyBadge');
      try {
        await sbStorage.set('openaiKey', v);
        localStorage.setItem('openaiKey', v);
        if(badge) { badge.textContent = '✓ salva!'; setTimeout(()=>{badge.textContent='✓ pronto';},1500); }
      } catch(e) {
        localStorage.setItem('openaiKey', v);
        if(badge) { badge.textContent = '✓ salva (local)'; setTimeout(()=>{badge.textContent='✓ pronto';},1500); }
      }
    }
    async function carregarApiKey() {
      const el = document.getElementById('openaiApiKey');
      const badge = document.getElementById('iaKeyBadge');
      try {
        const result = await sbStorage.get('openaiKey');
        const k = result?.value || localStorage.getItem('openaiKey');
        if(k && el) { el.value = k; if(badge) badge.textContent = '✓ pronto'; }
      } catch(e) {
        const k = localStorage.getItem('openaiKey');
        if(k && el) { el.value = k; if(badge) badge.textContent = '✓ pronto'; }
      }
    }
    function onConsolidadoPeriodoChange() {
      const [ano,mes] = document.getElementById('consolidadoPeriodo').value.split('-');
      consolidadoMesSelecionado = mes;
      consolidadoAnoSelecionado = ano;
      document.querySelector('#consolidadoView h2').innerText = 'Fluxo de Caixa - '+ano;
      showTab('receitas');
    }

    const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    const MTHS_L = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    // Dados diários extraídos da planilha
    const dadosDiarios = {
      'JAN/26': {
      "receitas": [{"nome":"Link Pessoa Física","valores":{"dia_1":18490.49,"dia_2":73584.34,"dia_3":24444.98,"dia_4":19226.01,"dia_5":153731.9,"dia_6":79364.24,"dia_7":74939.99,"dia_8":61382.16,"dia_9":72314.52,"dia_10":36164.5,"dia_11":12990.18,"dia_12":100216.1,"dia_13":57733.98,"dia_14":42441.74,"dia_15":74528.01,"dia_16":49717.59,"dia_17":16632.81,"dia_18":10813.16,"dia_19":52250.31,"dia_20":81383.88,"dia_21":43048.5,"dia_22":31823.28,"dia_23":24541.81,"dia_24":14676.12,"dia_25":13372.35,"dia_26":59350.48,"dia_27":38567.01,"dia_28":24774.73,"dia_29":24982.53,"dia_30":49145.23,"dia_31":27295.53},"total":1463928.46},
            {"nome":"Link Pessoa Jurídica","valores":{"dia_1":0.0,"dia_2":2413.88,"dia_3":362.32,"dia_4":179.53,"dia_5":29855.8,"dia_6":102006.14,"dia_7":10098.24,"dia_8":10304.25,"dia_9":25551.65,"dia_10":2030.52,"dia_11":640.94,"dia_12":46627.59,"dia_13":162710.64,"dia_14":21072.7,"dia_15":31460.63,"dia_16":109222.44,"dia_17":109.9,"dia_18":183.56,"dia_19":14894.89,"dia_20":56018.0,"dia_21":134195.5,"dia_22":24515.87,"dia_23":14575.8,"dia_24":230.8,"dia_25":731.3,"dia_26":74637.71,"dia_27":253333.63,"dia_28":37875.55,"dia_29":14886.28,"dia_30":8957.97,"dia_31":87.02},"total":1189771.05},
            {"nome":"Juros/Multa","valores":{"dia_1":422.29,"dia_2":1533.56,"dia_3":626.95,"dia_4":515.07,"dia_5":4963.59,"dia_6":3873.97,"dia_7":2843.68,"dia_8":1928.78,"dia_9":3318.48,"dia_10":987.61,"dia_11":290.11,"dia_12":2266.62,"dia_13":1898.71,"dia_14":2452.3,"dia_15":1852.27,"dia_16":2036.48,"dia_17":608.01,"dia_18":366.69,"dia_19":2728.17,"dia_20":2411.1,"dia_21":1746.8,"dia_22":1974.16,"dia_23":1366.32,"dia_24":473.62,"dia_25":378.63,"dia_26":3509.36,"dia_27":2152.75,"dia_28":1720.61,"dia_29":1382.02,"dia_30":2730.01,"dia_31":1145.71},"total":56504.43},
            {"nome":"Taxa de instalação","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":200.0,"dia_6":590.0,"dia_7":100.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":200.0,"dia_16":200.0,"dia_17":0.0,"dia_18":0.0,"dia_19":400.0,"dia_20":400.0,"dia_21":2600.0,"dia_22":350.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":150.0,"dia_27":1725.34,"dia_28":0.0,"dia_29":219.79,"dia_30":0.0,"dia_31":0.0},"total":7135.13},
            {"nome":"Eventos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":650.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":2500.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":3150.0},
            {"nome":"Multa fidelidade e equipamento","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":242.73,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":25.47,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":251.79,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":143.88,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":663.87},
            {"nome":"Rendimentos financeiros","valores":{"dia_1":0.0,"dia_2":118.32,"dia_3":0.0,"dia_4":0.0,"dia_5":139.38,"dia_6":47.9,"dia_7":218.24,"dia_8":17.84,"dia_9":19.43,"dia_10":0.0,"dia_11":0.0,"dia_12":22.5,"dia_13":15.39,"dia_14":17.56,"dia_15":46.2,"dia_16":138.02,"dia_17":0.0,"dia_18":0.0,"dia_19":174.02,"dia_20":239.73,"dia_21":79.29,"dia_22":53.42,"dia_23":77.82,"dia_24":0.0,"dia_25":0.0,"dia_26":136.08,"dia_27":106.91,"dia_28":140.23,"dia_29":139.99,"dia_30":212.22,"dia_31":0.0},"total":2160.49},
            {"nome":"V. Ativos imobilizados","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Vendas canceladas e estornos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":-290.1,"dia_6":-48.75,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":-103.04,"dia_14":0.0,"dia_15":-69.9,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":-2101.67,"dia_20":0.0,"dia_21":-43.75,"dia_22":-99.9,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":-2757.11}
      ],
      "impostos": [{"nome":"ICMS","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":88221.38,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":88221.38},
            {"nome":"COFINS","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":52907.2,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":52907.2},
            {"nome":"PIS","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":11417.3,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":11417.3},
            {"nome":"IRPJ","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":70847.45,"dia_31":0.0},"total":70847.45},
            {"nome":"CSLL","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":27665.08,"dia_31":0.0},"total":27665.08},
            {"nome":"ISS","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":5745.14,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":5745.14},
            {"nome":"ISS Retido","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":1218.24,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1218.24},
            {"nome":"Simples Nacional","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":1626.28,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1626.28},
            {"nome":"FUST/FUNTTEL","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":11394.66,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":5697.33,"dia_30":0.0,"dia_31":0.0},"total":17091.99}
      ],
      "custos": [{"nome":"Kit Instalação","valores":{"dia_1":0.0,"dia_2":2142.43,"dia_3":0.0,"dia_4":0.0,"dia_5":4578.39,"dia_6":1197.14,"dia_7":0.0,"dia_8":3919.17,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":6892.34,"dia_13":299.81,"dia_14":0.0,"dia_15":3199.33,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":10947.25,"dia_20":243.41,"dia_21":417.25,"dia_22":834.5,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":639.33,"dia_27":29774.87,"dia_28":15945.62,"dia_29":0.0,"dia_30":71022.3,"dia_31":0.0},"total":152053.14},
            {"nome":"Materiais de Rede","valores":{"dia_1":0.0,"dia_2":785.0,"dia_3":0.0,"dia_4":0.0,"dia_5":730.0,"dia_6":0.0,"dia_7":0.0,"dia_8":3432.28,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":1246.25,"dia_13":450.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":124.4,"dia_20":0.0,"dia_21":380.0,"dia_22":0.0,"dia_23":31340.93,"dia_24":0.0,"dia_25":0.0,"dia_26":472.5,"dia_27":7592.55,"dia_28":0.0,"dia_29":2787.75,"dia_30":0.0,"dia_31":0.0},"total":49341.66},
            {"nome":"Links de Dados / Voip","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":848.86,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":471.04,"dia_14":0.0,"dia_15":5430.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":5218.84,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":24285.15,"dia_24":0.0,"dia_25":0.0,"dia_26":19682.02,"dia_27":0.0,"dia_28":0.0,"dia_29":1405.67,"dia_30":0.0,"dia_31":0.0},"total":57341.58},
            {"nome":"Vtal","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":62847.53,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":62847.53},
            {"nome":"Alugueis de Postes","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":17793.58,"dia_31":0.0},"total":17793.58},
            {"nome":"Alugueis de Torre e POP","valores":{"dia_1":0.0,"dia_2":4603.75,"dia_3":0.0,"dia_4":0.0,"dia_5":2987.87,"dia_6":0.0,"dia_7":1200.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":700.0,"dia_13":350.0,"dia_14":0.0,"dia_15":100.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":1570.0,"dia_21":1800.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":500.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":668.87,"dia_31":0.0},"total":14480.49},
            {"nome":"Custo com SVA","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":13393.41,"dia_31":0.0},"total":13393.41},
            {"nome":"Energia / POP","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":221.53,"dia_13":5770.78,"dia_14":0.0,"dia_15":6870.64,"dia_16":39.83,"dia_17":0.0,"dia_18":0.0,"dia_19":238.35,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":15584.75,"dia_27":807.11,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":29532.99},
            {"nome":"Manutenção POP","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":400.0,"dia_9":1075.5,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":570.0,"dia_17":0.0,"dia_18":0.0,"dia_19":750.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":2795.5},
            {"nome":"Comissões de vendas","valores":{"dia_1":0.0,"dia_2":4902.08,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":3589.8,"dia_7":0.0,"dia_8":0.0,"dia_9":15583.16,"dia_10":0.0,"dia_11":0.0,"dia_12":299.8,"dia_13":1087.59,"dia_14":159.9,"dia_15":539.4,"dia_16":3249.5,"dia_17":0.0,"dia_18":0.0,"dia_19":59.9,"dia_20":120.0,"dia_21":0.0,"dia_22":0.0,"dia_23":9112.4,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":127.8,"dia_31":0.0},"total":38831.33},
            {"nome":"Combustivel técnico","valores":{"dia_1":0.0,"dia_2":17331.74,"dia_3":0.0,"dia_4":0.0,"dia_5":100.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":13606.18,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":120.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":31157.92},
            {"nome":"Manut. Veículo","valores":{"dia_1":0.0,"dia_2":3284.42,"dia_3":0.0,"dia_4":0.0,"dia_5":750.79,"dia_6":602.46,"dia_7":694.76,"dia_8":0.0,"dia_9":645.3,"dia_10":0.0,"dia_11":0.0,"dia_12":419.27,"dia_13":152.0,"dia_14":0.0,"dia_15":329.6,"dia_16":3259.5,"dia_17":0.0,"dia_18":0.0,"dia_19":1142.28,"dia_20":200.0,"dia_21":519.33,"dia_22":0.0,"dia_23":886.8,"dia_24":0.0,"dia_25":0.0,"dia_26":1507.3,"dia_27":60.0,"dia_28":2413.5,"dia_29":639.0,"dia_30":481.35,"dia_31":0.0},"total":17987.66},
            {"nome":"Folha - Direta","valores":{"dia_1":0.0,"dia_2":19596.16,"dia_3":0.0,"dia_4":0.0,"dia_5":5365.6,"dia_6":7312.26,"dia_7":295149.54,"dia_8":2937.81,"dia_9":6323.94,"dia_10":0.0,"dia_11":0.0,"dia_12":5737.52,"dia_13":1389.6,"dia_14":7852.73,"dia_15":2170.16,"dia_16":2197.98,"dia_17":0.0,"dia_18":0.0,"dia_19":60617.87,"dia_20":185577.62,"dia_21":50.0,"dia_22":2500.0,"dia_23":250.0,"dia_24":0.0,"dia_25":0.0,"dia_26":33150.57,"dia_27":1007.66,"dia_28":2652.05,"dia_29":66466.59,"dia_30":1529.6,"dia_31":0.0},"total":709835.26},
            {"nome":"Telefonia","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":3620.08,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":827.51,"dia_17":0.0,"dia_18":0.0,"dia_19":185.17,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":4632.76},
            {"nome":"Man. Equipamento","valores":{"dia_1":0.0,"dia_2":379.28,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":100.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":300.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":779.28},
            {"nome":"Ferramentas","valores":{"dia_1":0.0,"dia_2":5900.08,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":1982.16,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":302.5,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":40.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":8224.74},
            {"nome":"Moveis e equipamentos escritório TI","valores":{"dia_1":0.0,"dia_2":-353.21,"dia_3":0.0,"dia_4":0.0,"dia_5":617.5,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":77.57,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":900.02,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1241.88},
            {"nome":"Tercerização de Serv. (Instalações)","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Custos Lastmile","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":400.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":2377.42,"dia_13":1163.04,"dia_14":0.0,"dia_15":4070.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":4654.56,"dia_20":8550.54,"dia_21":0.0,"dia_22":0.0,"dia_23":2184.8,"dia_24":0.0,"dia_25":0.0,"dia_26":6820.52,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":4109.8,"dia_31":0.0},"total":34330.68}
      ],
      "despesas_operacionais": [{"nome":"Marketing","valores":{"dia_1":0.0,"dia_2":4021.95,"dia_3":0.0,"dia_4":0.0,"dia_5":20109.4,"dia_6":4306.28,"dia_7":0.0,"dia_8":1065.0,"dia_9":4899.0,"dia_10":0.0,"dia_11":0.0,"dia_12":6770.98,"dia_13":875.0,"dia_14":777.19,"dia_15":1799.0,"dia_16":1420.0,"dia_17":0.0,"dia_18":0.0,"dia_19":177.45,"dia_20":112.44,"dia_21":0.0,"dia_22":450.0,"dia_23":4200.0,"dia_24":0.0,"dia_25":0.0,"dia_26":1600.0,"dia_27":600.0,"dia_28":0.0,"dia_29":0.0,"dia_30":1000.0,"dia_31":0.0},"total":54183.69},
            {"nome":"Serv. Terceiros, jurídicos e consultorias","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":2449.75,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":645.0,"dia_10":0.0,"dia_11":0.0,"dia_12":11120.05,"dia_13":7000.0,"dia_14":426.2,"dia_15":5490.0,"dia_16":200.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":786.23,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":11000.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":537.5,"dia_31":0.0},"total":39654.73},
            {"nome":"Viagens/Estadia","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Segurança Trabalho/ EPI","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":332.5,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":332.5},
            {"nome":"Desp. Aluguel de escritório","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":582.75,"dia_6":0.0,"dia_7":0.0,"dia_8":24741.15,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":65.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":590.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":25978.9},
            {"nome":"Desp. Reformas empresa","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":446.72,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":70.0,"dia_15":2155.78,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":880.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":3552.5},
            {"nome":"Material de uso, consumo e papelaria","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":405.0,"dia_14":0.0,"dia_15":1346.06,"dia_16":404.05,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":308.4,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":2463.51},
            {"nome":"Combustivel Adm","valores":{"dia_1":0.0,"dia_2":486.96,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":467.09,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":954.05},
            {"nome":"Despesas e taxas com Veiculos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":741.61,"dia_20":214.15,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":955.76},
            {"nome":"Despesas Tributárias/ Taxas legais","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":479.7,"dia_20":0.0,"dia_21":0.0,"dia_22":108.39,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":2750.0,"dia_28":271.29,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":3609.38},
            {"nome":"Despesas Judiciais","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":606.02,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":606.02},
            {"nome":"Treinamentos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Pró-Labore","valores":{"dia_1":0.0,"dia_2":2809.14,"dia_3":0.0,"dia_4":0.0,"dia_5":81152.21,"dia_6":66885.0,"dia_7":18923.84,"dia_8":3372.61,"dia_9":26857.2,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":200000.0},
            {"nome":"Sistema","valores":{"dia_1":0.0,"dia_2":39.9,"dia_3":0.0,"dia_4":0.0,"dia_5":189.9,"dia_6":3316.26,"dia_7":1086.01,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":5007.57,"dia_13":978.0,"dia_14":0.0,"dia_15":746.6,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":6766.92,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":18131.16},
            {"nome":"Taxas Boleto","valores":{"dia_1":8.88,"dia_2":45.24,"dia_3":17.76,"dia_4":15.12,"dia_5":347.37,"dia_6":763.04,"dia_7":1859.72,"dia_8":180.25,"dia_9":173.73,"dia_10":19.68,"dia_11":5.76,"dia_12":265.34,"dia_13":698.19,"dia_14":149.01,"dia_15":184.38,"dia_16":513.45,"dia_17":14.64,"dia_18":7.92,"dia_19":122.15,"dia_20":314.58,"dia_21":566.16,"dia_22":123.44,"dia_23":87.37,"dia_24":12.0,"dia_25":13.68,"dia_26":123.29,"dia_27":621.4,"dia_28":91.71,"dia_29":56.49,"dia_30":110.55,"dia_31":1897.15},"total":9409.45},
            {"nome":"Enérgia Elétrica escritório","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":2307.66,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":2307.66},
            {"nome":"Despesas Diversas / Estacionamento","valores":{"dia_1":0.0,"dia_2":170.75,"dia_3":0.0,"dia_4":0.0,"dia_5":54.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":167.34,"dia_13":31.0,"dia_14":18.0,"dia_15":0.0,"dia_16":19.99,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":10.0,"dia_23":821.05,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":120.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1412.13},
            {"nome":"Tarifas bancárias","valores":{"dia_1":0.0,"dia_2":183.85,"dia_3":0.0,"dia_4":0.0,"dia_5":444.62,"dia_6":378.68,"dia_7":17.57,"dia_8":13.47,"dia_9":5.44,"dia_10":0.0,"dia_11":0.0,"dia_12":13.57,"dia_13":122.14,"dia_14":13.35,"dia_15":6.85,"dia_16":17.47,"dia_17":0.0,"dia_18":0.0,"dia_19":6.74,"dia_20":5.44,"dia_21":10.63,"dia_22":2.72,"dia_23":18.88,"dia_24":0.0,"dia_25":0.0,"dia_26":17.01,"dia_27":12.39,"dia_28":5.54,"dia_29":105.72,"dia_30":0.0,"dia_31":0.0},"total":1402.08}
      ],
      "despesas_financeiras": [{"nome":"EBITDA","valores":{"dia_1":18903.9,"dia_2":11320.58,"dia_3":25416.49,"dia_4":19905.49,"dia_5":67293.7,"dia_6":97725.31,"dia_7":-230731.29,"dia_8":33571.29,"dia_9":44146.95,"dia_10":39162.95,"dia_11":13915.47,"dia_12":21065.0,"dia_13":200605.46,"dia_14":56517.92,"dia_15":57198.48,"dia_16":148595.25,"dia_17":17336.08,"dia_18":11355.49,"dia_19":-17171.26,"dia_20":-153933.85,"dia_21":177002.97,"dia_22":54587.78,"dia_23":-96950.13,"dia_24":15368.54,"dia_25":14468.6,"dia_26":47696.32,"dia_27":251771.26,"dia_28":43275.29,"dia_29":-35547.94,"dia_30":-148241.86,"dia_31":26631.11},"total":832261.35}],
      "ajustes_caixa": [{"nome":"Investimento","valores":{"dia_1":0.0,"dia_2":1900.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":5443.58,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":1265.56,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":1671.08,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":16700.0,"dia_31":0.0},"total":26980.22},
            {"nome":"Parcel. Impostos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":44979.14,"dia_31":0.0},"total":44979.14},
            {"nome":"Sócios ou Retiradas","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":8116.8,"dia_10":0.0,"dia_11":0.0,"dia_12":24333.54,"dia_13":9635.28,"dia_14":279.08,"dia_15":54020.61,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":12199.33,"dia_21":2081.79,"dia_22":72257.12,"dia_23":14013.02,"dia_24":0.0,"dia_25":0.0,"dia_26":69701.36,"dia_27":4166.25,"dia_28":13397.48,"dia_29":0.0,"dia_30":9310.65,"dia_31":0.0},"total":293512.31}
      ]
      },
      'FEV/26': {
      "receitas": [{"nome":"Link Pessoa Física","valores":{"dia_1":18184.37,"dia_2":96736.12,"dia_3":82457.85,"dia_4":67146.92,"dia_5":96160.62,"dia_6":75821.63,"dia_7":25361.08,"dia_8":18778.52,"dia_9":93497.82,"dia_10":114221.41,"dia_11":59115.93,"dia_12":42174.05,"dia_13":45532.27,"dia_14":17145.79,"dia_15":17148.85,"dia_16":638.71,"dia_17":13461.79,"dia_18":76241.95,"dia_19":62132.97,"dia_20":80628.21,"dia_21":21493.56,"dia_22":12338.72,"dia_23":66015.11,"dia_24":33241.7,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1235675.95},
            {"nome":"Link Pessoa Jurídica","valores":{"dia_1":0.0,"dia_2":15859.74,"dia_3":21422.69,"dia_4":19260.08,"dia_5":24208.54,"dia_6":78594.82,"dia_7":229.1,"dia_8":131.06,"dia_9":16314.01,"dia_10":56170.39,"dia_11":146880.99,"dia_12":48995.64,"dia_13":25480.83,"dia_14":345.0,"dia_15":278.04,"dia_16":17349.48,"dia_17":139.6,"dia_18":27736.72,"dia_19":95607.43,"dia_20":51082.51,"dia_21":167.9,"dia_22":0.0,"dia_23":141908.37,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":788162.94},
            {"nome":"Juros/Multa","valores":{"dia_1":453.97,"dia_2":2642.06,"dia_3":1983.14,"dia_4":2676.09,"dia_5":1725.26,"dia_6":1965.21,"dia_7":969.43,"dia_8":485.14,"dia_9":3601.36,"dia_10":2234.93,"dia_11":1991.99,"dia_12":1946.24,"dia_13":1903.88,"dia_14":728.54,"dia_15":426.47,"dia_16":511.67,"dia_17":494.8,"dia_18":2268.62,"dia_19":3640.92,"dia_20":3426.87,"dia_21":1085.53,"dia_22":636.99,"dia_23":1091.2,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":38890.31},
            {"nome":"Taxa de instalação","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":200.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":1200.0,"dia_10":200.0,"dia_11":66.66,"dia_12":0.0,"dia_13":600.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":2266.66},
            {"nome":"Eventos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":2500.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":997.01,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":3497.01},
            {"nome":"Multa fidelidade e equipamento","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":202.47,"dia_4":0.0,"dia_5":0.0,"dia_6":194.85,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":332.01,"dia_11":230.79,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":179.85,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1139.97},
            {"nome":"Rendimentos financeiros","valores":{"dia_1":0.0,"dia_2":212.6,"dia_3":165.93,"dia_4":155.86,"dia_5":175.36,"dia_6":186.88,"dia_7":0.0,"dia_8":0.0,"dia_9":148.71,"dia_10":87.82,"dia_11":102.99,"dia_12":123.08,"dia_13":115.86,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.01,"dia_19":525.67,"dia_20":248.29,"dia_21":0.0,"dia_22":0.0,"dia_23":119.81,"dia_24":103.84,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":2472.71},
            {"nome":"V. Ativos imobilizados","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Vendas canceladas e estornos","valores":{"dia_1":0.0,"dia_2":-67.47,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":-118.6,"dia_10":0.0,"dia_11":-187.19,"dia_12":-105.98,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":-92.89,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":-572.13}
      ],
      "impostos": [{"nome":"ICMS","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":99080.62,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":99080.62},
            {"nome":"COFINS","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"PIS","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"IRPJ","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"CSLL","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"ISS","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":6285.8,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":6285.8},
            {"nome":"ISS Retido","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":1267.39,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1267.39},
            {"nome":"Simples Nacional","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":1343.8,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1343.8},
            {"nome":"FUST/FUNTTEL","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":12526.67,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":12526.67}
      ],
      "custos": [{"nome":"Kit Instalação","valores":{"dia_1":0.0,"dia_2":2737.22,"dia_3":35991.69,"dia_4":2139.9,"dia_5":93348.64,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":2936.25,"dia_10":2196.4,"dia_11":299.81,"dia_12":3367.5,"dia_13":12681.12,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":15355.2,"dia_20":1127.25,"dia_21":0.0,"dia_22":0.0,"dia_23":2085.33,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":174266.31},
            {"nome":"Materiais de Rede","valores":{"dia_1":0.0,"dia_2":4533.83,"dia_3":0.0,"dia_4":399.5,"dia_5":3431.46,"dia_6":100.0,"dia_7":0.0,"dia_8":0.0,"dia_9":430.0,"dia_10":816.25,"dia_11":0.0,"dia_12":0.0,"dia_13":8367.5,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":4592.2,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":22670.74},
            {"nome":"Links de Dados / Voip","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":12973.53,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":471.04,"dia_12":0.0,"dia_13":18753.53,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":24635.15,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":56833.25},
            {"nome":"Vtal","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":64036.63,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":64036.63},
            {"nome":"Alugueis de Postes","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Alugueis de Torre e POP","valores":{"dia_1":0.0,"dia_2":2608.34,"dia_3":0.0,"dia_4":0.0,"dia_5":2981.88,"dia_6":930.34,"dia_7":0.0,"dia_8":0.0,"dia_9":1200.0,"dia_10":700.0,"dia_11":0.0,"dia_12":0.0,"dia_13":450.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":1570.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":10440.56},
            {"nome":"Custo com SVA","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":13393.41,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":13393.41},
            {"nome":"Energia / POP","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":1761.17,"dia_10":2524.57,"dia_11":860.62,"dia_12":746.72,"dia_13":5153.94,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":11047.02},
            {"nome":"Manutenção POP","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":352.69,"dia_10":0.0,"dia_11":339.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":691.69},
            {"nome":"Comissões de vendas","valores":{"dia_1":0.0,"dia_2":259.7,"dia_3":0.0,"dia_4":6648.57,"dia_5":1939.2,"dia_6":329.6,"dia_7":0.0,"dia_8":0.0,"dia_9":17012.48,"dia_10":0.0,"dia_11":0.0,"dia_12":1652.55,"dia_13":1011.77,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":418.9,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":29272.77},
            {"nome":"Combustivel técnico","valores":{"dia_1":0.0,"dia_2":15837.8,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":17038.23,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":32876.03},
            {"nome":"Manut. Veículo","valores":{"dia_1":0.0,"dia_2":2943.33,"dia_3":180.0,"dia_4":0.0,"dia_5":756.49,"dia_6":3035.0,"dia_7":0.0,"dia_8":0.0,"dia_9":2090.02,"dia_10":0.0,"dia_11":0.0,"dia_12":1150.47,"dia_13":3282.28,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":419.32,"dia_20":630.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":14486.91},
            {"nome":"Folha - Direta","valores":{"dia_1":0.0,"dia_2":410.04,"dia_3":3182.67,"dia_4":1288.0,"dia_5":5100.0,"dia_6":313107.63,"dia_7":0.0,"dia_8":0.0,"dia_9":6381.86,"dia_10":3374.4,"dia_11":1169.66,"dia_12":2413.57,"dia_13":4931.23,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":64202.31,"dia_20":155197.87,"dia_21":0.0,"dia_22":0.0,"dia_23":452.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":561211.24},
            {"nome":"Telefonia","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":3506.71,"dia_11":59.0,"dia_12":119.99,"dia_13":707.52,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":4393.22},
            {"nome":"Man. Equipamento","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":140.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":140.0},
            {"nome":"Ferramentas","valores":{"dia_1":0.0,"dia_2":3008.85,"dia_3":660.0,"dia_4":656.25,"dia_5":110.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":789.38,"dia_10":740.0,"dia_11":0.0,"dia_12":0.0,"dia_13":302.5,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":20.8,"dia_20":195.24,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":6483.02},
            {"nome":"Moveis e equipamentos escritório TI","valores":{"dia_1":0.0,"dia_2":813.99,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":419.54,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":1233.53},
            {"nome":"Tercerização de Serv. (Instalações)","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Custos Lastmile","valores":{"dia_1":0.0,"dia_2":2585.87,"dia_3":0.0,"dia_4":0.0,"dia_5":1550.78,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":3450.19,"dia_11":0.0,"dia_12":300.0,"dia_13":4529.34,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":4550.0,"dia_21":0.0,"dia_22":0.0,"dia_23":16974.23,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":33940.41}
      ],
      "despesas_operacionais": [{"nome":"Marketing","valores":{"dia_1":0.0,"dia_2":29963.88,"dia_3":0.0,"dia_4":0.0,"dia_5":4306.28,"dia_6":357.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":12229.58,"dia_11":0.0,"dia_12":0.0,"dia_13":1645.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":1166.0,"dia_20":1677.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":51344.74},
            {"nome":"Serv. Terceiros, jurídicos e consultorias","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":2449.75,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":2410.05,"dia_11":2400.0,"dia_12":7500.0,"dia_13":12916.2,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":25.0,"dia_20":786.23,"dia_21":0.0,"dia_22":0.0,"dia_23":1400.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":29887.23},
            {"nome":"Viagens/Estadia","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Segurança Trabalho/ EPI","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":1392.0,"dia_10":0.0,"dia_11":487.0,"dia_12":0.0,"dia_13":162.42,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":2041.42},
            {"nome":"Desp. Aluguel de escritório","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":582.75,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":26346.35,"dia_10":65.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":26994.1},
            {"nome":"Desp. Reformas empresa","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":446.72,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":832.91,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":20.0,"dia_20":894.08,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":2193.71},
            {"nome":"Material de uso, consumo e papelaria","valores":{"dia_1":0.0,"dia_2":169.8,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":15.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":143.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":327.8},
            {"nome":"Combustivel Adm","valores":{"dia_1":0.0,"dia_2":489.43,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":20.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":292.29,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":801.72},
            {"nome":"Despesas e taxas com Veiculos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":430.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":214.15,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":11954.33,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":449.08,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":13047.56},
            {"nome":"Despesas Tributárias/ Taxas legais","valores":{"dia_1":0.0,"dia_2":324.63,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":259.8,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":-13.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":571.43},
            {"nome":"Despesas Judiciais","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Treinamentos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":0.0},
            {"nome":"Pró-Labore","valores":{"dia_1":0.0,"dia_2":44133.2,"dia_3":100613.0,"dia_4":42917.99,"dia_5":12335.81,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":200000.0},
            {"nome":"Sistema","valores":{"dia_1":0.0,"dia_2":1091.7,"dia_3":0.0,"dia_4":0.0,"dia_5":3705.13,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":1134.45,"dia_10":6257.64,"dia_11":0.0,"dia_12":0.0,"dia_13":2855.12,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":6803.37,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":21847.41},
            {"nome":"Taxas Boleto","valores":{"dia_1":6.24,"dia_2":122.45,"dia_3":388.69,"dia_4":197.7,"dia_5":222.68,"dia_6":526.74,"dia_7":18.24,"dia_8":10.8,"dia_9":192.98,"dia_10":2375.62,"dia_11":715.8,"dia_12":139.58,"dia_13":145.44,"dia_14":10.32,"dia_15":11.28,"dia_16":12.72,"dia_17":9.6,"dia_18":198.76,"dia_19":530.08,"dia_20":234.96,"dia_21":9.84,"dia_22":6.48,"dia_23":587.46,"dia_24":52.68,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":6727.14},
            {"nome":"Enérgia Elétrica escritório","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":4977.36,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":4977.36},
            {"nome":"Despesas Diversas / Estacionamento","valores":{"dia_1":0.0,"dia_2":39.9,"dia_3":0.0,"dia_4":0.0,"dia_5":10.0,"dia_6":285.65,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":133.06,"dia_11":31.94,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":114.0,"dia_20":2187.5,"dia_21":0.0,"dia_22":0.0,"dia_23":913.46,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":3715.51},
            {"nome":"Tarifas bancárias","valores":{"dia_1":0.0,"dia_2":-358.94,"dia_3":131.85,"dia_4":10.73,"dia_5":10.74,"dia_6":13.46,"dia_7":0.0,"dia_8":0.0,"dia_9":18.66,"dia_10":24.21,"dia_11":108.57,"dia_12":6.73,"dia_13":12.05,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":13.35,"dia_19":16.26,"dia_20":8.15,"dia_21":0.0,"dia_22":0.0,"dia_23":15.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":30.82}
      ],
      "despesas_financeiras": [{"nome":"EBITDA","valores":{"dia_1":18632.1,"dia_2":3668.03,"dia_3":-34715.82,"dia_4":34533.59,"dia_5":-21475.34,"dia_6":-162097.03,"dia_7":26541.37,"dia_8":19383.92,"dia_9":-11645.77,"dia_10":112363.02,"dia_11":202256.73,"dia_12":74903.01,"dia_13":-38796.13,"dia_14":18209.01,"dia_15":17842.08,"dia_16":18487.14,"dia_17":14086.59,"dia_18":106215.04,"dia_19":79383.23,"dia_20":-159305.34,"dia_21":22737.15,"dia_22":12969.23,"dia_23":161635.78,"dia_24":33292.86,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":549104.45}],
      "ajustes_caixa": [{"nome":"Investimento","valores":{"dia_1":0.0,"dia_2":1900.0,"dia_3":0.0,"dia_4":0.0,"dia_5":51200.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":3611.8,"dia_10":0.0,"dia_11":1831.78,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":1265.56,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":59809.14},
            {"nome":"Parcel. Impostos","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":0.0,"dia_6":0.0,"dia_7":0.0,"dia_8":0.0,"dia_9":0.0,"dia_10":0.0,"dia_11":0.0,"dia_12":0.0,"dia_13":0.0,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":0.0,"dia_19":0.0,"dia_20":0.0,"dia_21":0.0,"dia_22":0.0,"dia_23":0.0,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":45327.44,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":45327.44},
            {"nome":"Sócios ou Retiradas","valores":{"dia_1":0.0,"dia_2":0.0,"dia_3":0.0,"dia_4":0.0,"dia_5":3446.13,"dia_6":24182.54,"dia_7":0.0,"dia_8":0.0,"dia_9":23565.22,"dia_10":10623.18,"dia_11":12143.75,"dia_12":161899.0,"dia_13":18243.83,"dia_14":0.0,"dia_15":0.0,"dia_16":0.0,"dia_17":0.0,"dia_18":30094.0,"dia_19":1400.0,"dia_20":4752.76,"dia_21":0.0,"dia_22":0.0,"dia_23":9319.32,"dia_24":0.0,"dia_25":0.0,"dia_26":0.0,"dia_27":0.0,"dia_28":0.0,"dia_29":0.0,"dia_30":0.0,"dia_31":0.0},"total":299669.73}
      ]
      }
    };


    function showTab(cat,el) {
      document.querySelectorAll('#consolidadoView .tab-btn').forEach(b=>b.classList.remove('active'));
      if(el) el.classList.add('active');
      renderTable(cat);
    }

    function toggleCategoria(categoria) {
      const rows = document.querySelectorAll(`.sub-${categoria}`);
      const icon = document.querySelector(`.expand-${categoria}`);
      rows.forEach(r => r.classList.toggle('hidden'));
      if (icon) icon.classList.toggle('expanded');
    }

    function renderTable(categoria) {
      const _anoKey = dadosFluxoAtual === dadosFinanceiros ? '2026'
        : (typeof dadosFinanceiros2025!=='undefined' && dadosFluxoAtual===dadosFinanceiros2025) ? '2025'
        : (typeof dadosFinanceiros2024!=='undefined' && dadosFluxoAtual===dadosFinanceiros2024) ? '2024' : '2023';
      const _cacheKey = categoria + '_' + _anoKey;
      if (_tableCache.has(_cacheKey)) {
        document.getElementById('tableContent').innerHTML = _tableCache.get(_cacheKey);
        return;
      }
      const data = (dadosFluxoAtual[categoria] || []).filter(i => i.nome !== 'Empr/Finac/Parcel' && i.nome !== 'Investimento');

      let html = `
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th class="value-cell">Jan</th>
              <th class="value-cell">Fev</th>
              <th class="value-cell">Mar</th>
              <th class="value-cell">Abr</th>
              <th class="value-cell">Mai</th>
              <th class="value-cell">Jun</th>
              <th class="value-cell">Jul</th>
              <th class="value-cell">Ago</th>
              <th class="value-cell">Set</th>
              <th class="value-cell">Out</th>
              <th class="value-cell">Nov</th>
              <th class="value-cell">Dez</th>
              <th class="value-cell" id="fluxoTotalHeader">Total</th>
            </tr>
          </thead>
          <tbody>
      `;

      /* ===================== EBITDA ===================== */
      if (categoria === 'ebitda') {
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const ebitdaBase = dadosFluxoAtual.ebitda[0];
        const ebitdaMensal = meses.map(mes => ebitdaBase[mes] || 0);
        const ebitdaTotal = ebitdaMensal.reduce((sum, val) => sum + val, 0);

        // Ajustes = todos exceto "EBITDA (Ajustado)"
        const ajustes = dadosFluxoAtual.ebitda_ajustado.filter(i => i.nome !== 'EBITDA (Ajustado)');

        // EBITDA (Ajustado) usa o valor DIRETO da planilha, não recalculado
        const ebitdaAjItem = dadosFluxoAtual.ebitda_ajustado.find(i => i.nome === 'EBITDA (Ajustado)');
        const ebitdaAjMensal = meses.map(mes => ebitdaAjItem ? (ebitdaAjItem[mes] || 0) : 0);
        const ebitdaAjTotal  = ebitdaAjMensal.reduce((s,v) => s+v, 0);

        html += `
          <tr class="category-row" onclick="toggleCategoria('ebitda')">
            <td>
              <div class="category-header">
                <span class="expand-icon expand-ebitda">▶</span>
                <strong>EBITDA</strong>
              </div>
            </td>
            ${ebitdaMensal.map(valor => `<td class="value-cell"><strong>${formatCurrency(valor)}</strong></td>`).join('')}
            <td class="value-cell"><strong>${formatCurrency(ebitdaTotal)}</strong></td>
          </tr>
        `;
        ajustes.forEach(item => {
          html += `
            <tr class="sub-item sub-ebitda hidden">
              <td>${item.nome}</td>
              ${meses.map(mes => `<td class="value-cell">${item[mes] ? formatCurrency(item[mes]) : '-'}</td>`).join('')}
              <td class="value-cell">${formatCurrency(item.total || 0)}</td>
            </tr>
          `;
        });
        html += `
          <tr class="category-row" onclick="toggleCategoria('ebitda-ajustado')">
            <td>
              <div class="category-header">
                <span class="expand-icon expand-ebitda-ajustado">▶</span>
                <strong>EBITDA (Ajustado)</strong>
              </div>
            </td>
            ${ebitdaAjMensal.map(valor => `<td class="value-cell"><strong>${formatCurrency(valor)}</strong></td>`).join('')}
            <td class="value-cell"><strong>${formatCurrency(ebitdaAjTotal)}</strong></td>
          </tr>
          <tr class="sub-item sub-ebitda-ajustado hidden">
            <td>EBITDA (Ajustado)</td>
            ${ebitdaAjMensal.map(valor => `<td class="value-cell">${formatCurrency(valor)}</td>`).join('')}
            <td class="value-cell">${formatCurrency(ebitdaAjTotal)}</td>
          </tr>
          <tr class="sub-item sub-ebitda-ajustado hidden">
            <td>Folha / Receita Total</td>
            <td class="value-cell">31,05%</td>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
          <tr class="sub-item sub-ebitda-ajustado hidden">
            <td>Rescisão / Folha</td>
            <td class="value-cell">0,40%</td>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
          <tr class="sub-item sub-ebitda-ajustado hidden">
            <td>Folha / Receita Total - 2024</td>
            <td class="value-cell">22,80%</td>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
        `;
      }
      /* ===================== OUTRAS CATEGORIAS ===================== */
      else {
        const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
        const mesesLabel = ['JAN/26','FEV/26','MAR/26','ABR/26','MAI/26','JUN/26','JUL/26','AGO/26','SET/26','OUT/26','NOV/26','DEZ/26'];
        const totaisMes = meses.map(m => data.reduce((acc, i) => acc + (i[m] || 0), 0));
        const totalAno  = data.reduce((acc, i) => acc + (i.total || 0), 0);

        html += `
          <tr class="category-row" onclick="toggleCategoria('${categoria}')">
            <td>
              <div class="category-header">
                <span class="expand-icon expand-${categoria}">▶</span>
                <strong>${categoria.toUpperCase()}</strong>
              </div>
            </td>
            ${totaisMes.map((total, idx) => `
              <td class="value-cell month-cell" onclick="event.stopPropagation();abrirModalDiario('${mesesLabel[idx]}', '${categoria}')">
                <strong>${total ? formatCurrency(total) : '-'}</strong>
              </td>`).join('')}
            <td class="value-cell"><strong>${formatCurrency(totalAno)}</strong></td>
          </tr>
        `;
        data.forEach(item => {
          html += `
            <tr class="sub-item sub-${categoria} hidden">
              <td>${item.nome}</td>
              ${meses.map(m => `<td class="value-cell">${item[m] ? formatCurrency(item[m]) : '-'}</td>`).join('')}
              <td class="value-cell"><strong>${formatCurrency(item.total || 0)}</strong></td>
            </tr>
          `;
        });
      }

      html += `</tbody></table>`;
      _tableCache.set(_cacheKey, html);
      document.getElementById('tableContent').innerHTML = html;
    }

    function abrirModalDiario(mes, categoria) {
      const modal = document.getElementById('dailyModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalContent = document.getElementById('modalTableContent');
      const meses = { 'JAN/26': 'Janeiro 2026', 'FEV/26': 'Fevereiro 2026', 'MAR/26': 'Março 2026' };
      modalTitle.textContent = `Detalhamento Diário — ${meses[mes] || mes} — ${categoria.toUpperCase()}`;
      if (!dadosDiarios[mes]) {
        modalContent.innerHTML = '<p style="text-align:center;padding:2rem;color:#64748b;">Dados diários não disponíveis para este mês.</p>';
        modal.classList.add('active'); return;
      }
      // Mapeia categorias do showTab para as chaves em dadosDiarios
      const catMap = { 'despesas': 'despesas_operacionais', 'ebitda': 'despesas_financeiras', 'ebitda_ajustado': 'despesas_financeiras' };
      const chave = catMap[categoria] || categoria;
      let dadosCategoria = dadosDiarios[mes][chave] || [];
      if (dadosCategoria.length === 0) {
        modalContent.innerHTML = '<p style="text-align:center;padding:2rem;color:#64748b;">Nenhum dado encontrado para esta categoria neste mês.</p>';
        modal.classList.add('active'); return;
      }
      // Detecta quantos dias tem o mês
      const diasPorMes = { 'JAN':31,'FEV':28,'MAR':31,'ABR':30,'MAI':31,'JUN':30,'JUL':31,'AGO':31,'SET':30,'OUT':31,'NOV':30,'DEZ':31 };
      const mesAbrev = mes.split('/')[0];
      const numDias = diasPorMes[mesAbrev] || 31;
      let html = '<table class="daily-table"><thead><tr><th>Item</th>';
      for (let dia = 1; dia <= numDias; dia++) html += `<th class="day-header">${dia}</th>`;
      html += '<th class="day-header">TOTAL</th></tr></thead><tbody>';
      dadosCategoria.forEach(item => {
        html += '<tr>';
        html += `<td><strong>${item.nome}</strong></td>`;
        for (let dia = 1; dia <= numDias; dia++) {
          const valor = item.valores[`dia_${dia}`] || 0;
          const cor = valor < 0 ? 'color:#b91c1c;' : '';
          html += `<td class="day-value" style="${cor}">${valor === 0 ? '-' : formatCurrency(valor)}</td>`;
        }
        const cor = item.total < 0 ? 'color:#b91c1c;' : '';
        html += `<td class="day-value" style="${cor}"><strong>${formatCurrency(item.total)}</strong></td></tr>`;
      });
      html += '<tr class="total-row"><td>TOTAL</td>';
      for (let dia = 1; dia <= numDias; dia++) {
        let totalDia = dadosCategoria.reduce((acc, item) => acc + (item.valores[`dia_${dia}`] || 0), 0);
        html += `<td class="day-value">${totalDia === 0 ? '-' : formatCurrency(totalDia)}</td>`;
      }
      const totalGeral = dadosCategoria.reduce((acc, item) => acc + item.total, 0);
      const corTotal = totalGeral < 0 ? 'color:#b91c1c;' : '';
      html += `<td class="day-value" style="${corTotal}"><strong>${formatCurrency(totalGeral)}</strong></td></tr>`;
      html += '</tbody></table>';
      modalContent.innerHTML = html;
      modal.classList.add('active');
    }

    function abrirModalTudoConsolidado() {
      const modal = document.getElementById('dailyModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalContent = document.getElementById('modalTableContent');
      // Usa o mês selecionado no filtro de período do Consolidado
      const [anoSel, mesSel] = (document.getElementById('consolidadoPeriodo')?.value || '2026-01').split('-');
      const MESES_ABREV_KEY = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
      const MESES_NOME_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const mesIdx = parseInt(mesSel) - 1;
      const mes = MESES_ABREV_KEY[mesIdx] + '/' + anoSel.slice(2);
      modalTitle.textContent = `Fluxo de Caixa Detalhado — ${MESES_NOME_FULL[mesIdx]} ${anoSel}`;
      if (!dadosDiarios[mes]) {
        modalContent.innerHTML = '<p style="text-align:center;padding:2rem;color:#64748b;">Dados não disponíveis.</p>';
        modal.classList.add('active'); return;
      }
      const categorias = [
        { chave: 'receitas', nome: 'RECEITAS' },
        { chave: 'impostos', nome: 'IMPOSTOS' },
        { chave: 'custos', nome: 'CUSTOS' },
        { chave: 'despesas_operacionais', nome: 'DESPESAS OPERACIONAIS' },
        { chave: 'despesas_financeiras', nome: 'DESPESAS FINANCEIRAS' },
        { chave: 'ajustes_caixa', nome: 'AJUSTES DE CAIXA' }
      ];
      let html = '<table class="daily-table"><thead><tr><th>Categoria / Subcategoria</th>';
      for (let dia = 1; dia <= 31; dia++) html += `<th class="day-header">${dia}</th>`;
      html += '<th class="day-header">TOTAL</th></tr></thead><tbody>';
      let totalGeralTudo = 0;
      let totaisDiarios = {};
      for (let dia = 1; dia <= 31; dia++) totaisDiarios[`dia_${dia}`] = 0;
      categorias.forEach(catInfo => {
        const dadosCategoria = (dadosDiarios[mes][catInfo.chave] || []).filter(i => i.nome !== 'Empr/Finac/Parcel' && i.nome !== 'Investimento');
        if (dadosCategoria.length > 0) {
          html += `<tr style="background:#e0f2fe;font-weight:700;"><td colspan="33" style="padding:1rem;font-size:1rem;">${catInfo.nome}</td></tr>`;
          dadosCategoria.forEach(item => {
            html += '<tr>';
            html += `<td style="padding-left:2rem;">${item.nome}</td>`;
            for (let dia = 1; dia <= 31; dia++) {
              const valor = item.valores[`dia_${dia}`] || 0;
              html += `<td class="day-value">${valor === 0 ? '-' : formatCurrency(valor)}</td>`;
              totaisDiarios[`dia_${dia}`] += valor;
            }
            html += `<td class="day-value"><strong>${formatCurrency(item.total)}</strong></td></tr>`;
            totalGeralTudo += item.total;
          });
          const totalCategoria = dadosCategoria.reduce((acc, item) => acc + item.total, 0);
          html += '<tr style="background:#f1f5f9;font-weight:600;">';
          html += `<td style="padding-left:1rem;">SUBTOTAL ${catInfo.nome}</td>`;
          for (let dia = 1; dia <= 31; dia++) {
            let totalDiaCategoria = dadosCategoria.reduce((acc, item) => acc + (item.valores[`dia_${dia}`] || 0), 0);
            html += `<td class="day-value">${totalDiaCategoria === 0 ? '-' : formatCurrency(totalDiaCategoria)}</td>`;
          }
          html += `<td class="day-value">${formatCurrency(totalCategoria)}</td></tr>`;
        }
      });
      html += '<tr class="total-row" style="background:#2563eb;color:white;"><td><strong>TOTAL GERAL</strong></td>';
      for (let dia = 1; dia <= 31; dia++) {
        html += `<td class="day-value" style="color:white;">${totaisDiarios[`dia_${dia}`] === 0 ? '-' : formatCurrency(totaisDiarios[`dia_${dia}`])}</td>`;
      }
      html += `<td class="day-value" style="color:white;"><strong>${formatCurrency(totalGeralTudo)}</strong></td></tr>`;
      html += '</tbody></table>';
      modalContent.innerHTML = html;
      modal.classList.add('active');
    }

    function abrirModalConsolidadoAnual() {
      const modal = document.getElementById('dailyModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalContent = document.getElementById('modalTableContent');
      const anoBtn = document.querySelector('#anosBtnGroup .year-btn.active');
      const ano = anoBtn ? anoBtn.textContent.trim() : '2026';
      modalTitle.textContent = `Consolidado Anual — ${ano}`;

      const MESES   = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
      const LABELS  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

      const categorias = [
        { chave:'receitas',           nome:'RECEITAS' },
        { chave:'impostos',           nome:'IMPOSTOS' },
        { chave:'custos',             nome:'CUSTOS' },
        { chave:'despesas',           nome:'DESPESAS OPERACIONAIS' },
        { chave:'ebitda',             nome:'EBITDA' },
        { chave:'ebitda_ajustado',    nome:'EBITDA AJUSTADO' },
        { chave:'ajustes',            nome:'AJUSTES DE CAIXA' },
        { chave:'bancos',             nome:'BANCOS' },
      ];

      // Cabeçalho
      let html = `<table class="daily-table"><thead><tr>
        <th style="min-width:220px;text-align:left;padding:0.75rem 1rem;">Categoria / Subcategoria</th>`;
      LABELS.forEach(l => { html += `<th class="day-header">${l}</th>`; });
      html += `<th class="day-header" style="background:#1e3a8a;color:white;">TOTAL</th></tr></thead><tbody>`;

      // Totais gerais por mês
      const totalGeralMes = {};
      MESES.forEach(m => totalGeralMes[m] = 0);
      let totalGeralAno = 0;

      categorias.forEach(catInfo => {
        const itens = (dadosFluxoAtual[catInfo.chave] || []).filter(i => i.nome !== 'Empr/Finac/Parcel' && i.nome !== 'Investimento');
        if (itens.length === 0) return;

        // Linha de categoria
        html += `<tr style="background:#e0f2fe;font-weight:700;">
          <td colspan="${MESES.length + 2}" style="padding:0.75rem 1rem;font-size:0.95rem;letter-spacing:0.03em;">${catInfo.nome}</td></tr>`;

        // Totais da categoria por mês
        const subtotalMes = {};
        MESES.forEach(m => subtotalMes[m] = 0);
        let subtotalAno = 0;

        itens.forEach(item => {
          html += `<tr><td style="padding:0.5rem 0.75rem 0.5rem 2rem;font-size:0.85rem;">${item.nome}</td>`;
          let rowTotal = 0;
          MESES.forEach(m => {
            const v = item[m] || 0;
            subtotalMes[m] += v;
            rowTotal += v;
            const cor = v < 0 ? 'color:#b91c1c;' : '';
            html += `<td class="day-value" style="${cor}">${v === 0 ? '<span style="color:#cbd5e1">—</span>' : formatCurrency(v)}</td>`;
          });
          // usa total do objeto se existir, senão soma dos meses
          const tot = item.total !== undefined ? item.total : rowTotal;
          subtotalAno += tot;
          const corTot = tot < 0 ? 'color:#b91c1c;' : '';
          html += `<td class="day-value" style="font-weight:700;${corTot}">${formatCurrency(tot)}</td></tr>`;
        });

        // Linha de subtotal da categoria
        html += `<tr style="background:#f1f5f9;font-weight:700;border-top:2px solid #e2e8f0;">
          <td style="padding:0.6rem 0.75rem 0.6rem 1rem;font-size:0.85rem;">SUBTOTAL ${catInfo.nome}</td>`;
        MESES.forEach(m => {
          const v = subtotalMes[m];
          const cor = v < 0 ? 'color:#b91c1c;' : 'color:#1e3a8a;';
          html += `<td class="day-value" style="${cor}">${v === 0 ? '—' : formatCurrency(v)}</td>`;
          totalGeralMes[m] += v;
        });
        html += `<td class="day-value" style="color:#1e3a8a;font-weight:800;">${formatCurrency(subtotalAno)}</td></tr>`;
        totalGeralAno += subtotalAno;

        // Espaço visual entre categorias
        html += `<tr style="height:6px;background:#f8fafc;"><td colspan="${MESES.length + 2}"></td></tr>`;
      });

      // Linha de total geral
      html += `<tr style="background:linear-gradient(135deg,#1e3a8a,#2563eb);color:white;font-weight:800;font-size:0.95rem;">
        <td style="padding:0.9rem 1rem;">TOTAL GERAL ${ano}</td>`;
      MESES.forEach(m => {
        const v = totalGeralMes[m];
        html += `<td class="day-value" style="color:white;">${v === 0 ? '—' : formatCurrency(v)}</td>`;
      });
      html += `<td class="day-value" style="color:white;font-size:1.05rem;">${formatCurrency(totalGeralAno)}</td></tr>`;
      html += `</tbody></table>`;

      modalContent.innerHTML = html;
      modal.classList.add('active');
    }

    function showCompTab(cat,el) {
      document.querySelectorAll('#comparativoView .tab-btn').forEach(b=>b.classList.remove('active'));
      if(el) el.classList.add('active');
      renderCompTab(cat);
    }

    function renderCompTab(cat) {
      const map = {'receitas-comp':['receitas','Receitas Totais'],'custos-comp':['custos','Custos Totais'],'despesas-comp':['despesas','Despesas Totais'],'ebitda-comp':['ebitda','EBITDA']};
      const [key,label] = map[cat]||['receitas','Receitas'];
      const v26=dadosComparativos[2026][key],v25=dadosComparativos[2025][key],v24=dadosComparativos[2024][key];
      const var2524=((v25-v24)/v24*100).toFixed(1),var2625=((v26-v25)/v25*100).toFixed(1);
      document.getElementById('compTableContent').innerHTML = `<table style="min-width:700px"><thead><tr><th>${label}</th><th class="value-cell">2024</th><th class="value-cell">2025</th><th class="value-cell">2026</th><th class="value-cell">Var 25/24</th><th class="value-cell">Var 26/25</th></tr></thead><tbody>
        <tr class="total-row"><td>${label}</td><td class="value-cell">${formatCurrency(v24)}</td><td class="value-cell">${formatCurrency(v25)}</td><td class="value-cell">${formatCurrency(v26)}</td>
        <td class="value-cell ${v25>v24?'positive-value':'negative-value'}">+${var2524}%</td>
        <td class="value-cell ${v26>v25?'positive-value':'negative-value'}">+${var2625}%</td></tr>
      </tbody></table>`;
    }

    function renderComparisonCards() {
      const anos = [2024,2025,2026];
      const indicadores = [{k:'receitas',l:'Receitas'},{k:'custos',l:'Custos'},{k:'despesas',l:'Despesas'},{k:'ebitda',l:'EBITDA'},{k:'ebitdaAjustado',l:'EBITDA Aj.'}];
      let html = '';
      indicadores.forEach(({k,l}) => {
        html += `<div class="comparison-card"><div class="comparison-card-title">${l}</div>`;
        anos.forEach(ano => {
          const v = dadosComparativos[ano][k];
          const vp = ano>2024?dadosComparativos[ano-1][k]:null;
          const var_ = vp?((v-vp)/vp*100).toFixed(1):null;
          html += `<div class="comparison-item"><span class="comparison-label">${ano}</span><div><div class="comparison-value ${v>=(vp||v)?'positive':'negative'}">${formatCurrency(v)}</div>${var_?`<div class="comparison-variation">+${var_}%</div>`:''}</div></div>`;
        });
        html += '</div>';
      });
      document.getElementById('comparisonGrid').innerHTML = html;
    }

    function selectYear(y,ev) {
      anoSelecionadoComparativo = y;
      document.querySelectorAll('.year-btn').forEach(b=>b.classList.remove('active'));
      ev.target.classList.add('active');
      renderComparisonCards();
      renderCompTab('receitas-comp');
    }

    // ===== INDICADORES =====
    function renderIndicadores() {
      const d = typeof diretoriaDadosExtraidos !== 'undefined' ? diretoriaDadosExtraidos : null;
      const grid = document.getElementById('indicadoresGrid');
      const semDados = document.getElementById('indicadoresSemDados');

      const hasData = d && Object.values(d).some(v => v !== null && v !== undefined);
      if (!hasData) {
        grid.style.display = 'none';
        semDados.style.display = 'block';
        return;
      }
      semDados.style.display = 'none';
      grid.style.display = 'block';

      // Helper: format integer
      const fN = v => (v === null || v === undefined) ? '—' : Number(v).toLocaleString('pt-BR');
      // Helper: format currency
      const fR = v => (v === null || v === undefined) ? '—' : 'R$ ' + Number(v).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
      // Helper: sum two values
      const sum = (a, b) => {
        if (a === null && b === null) return null;
        return (a || 0) + (b || 0);
      };
      const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

      // Base de Clientes
      const baseTotal = sum(d.base_pf, d.base_pj);
      set('ind-base-total', fN(baseTotal));
      set('ind-tt-base-pf', fN(d.base_pf));
      set('ind-tt-base-pj', fN(d.base_pj));
      set('ind-tt-base-total', fN(baseTotal));

      // Contratos
      set('ind-contratos', fN(d.contratos));

      // Novos Clientes
      const ncTotal = sum(d.nc_pf, d.nc_pj);
      set('ind-nc-total', fN(ncTotal));
      set('ind-tt-nc-pf', fN(d.nc_pf));
      set('ind-tt-nc-pj', fN(d.nc_pj));
      set('ind-tt-nc-total', fN(ncTotal));

      // Cancelamentos
      const cancTotal = sum(d.canc_pf, d.canc_pj);
      set('ind-canc-total', fN(cancTotal));
      set('ind-tt-canc-pf', fN(d.canc_pf));
      set('ind-tt-canc-pj', fN(d.canc_pj));
      set('ind-tt-canc-total', fN(cancTotal));

      // Retiradas
      set('ind-retiradas', fN(d.retiradas));

      // Reativações
      const reatTotal = sum(d.reat, d.reat_ret);
      set('ind-reat-total', fN(reatTotal));
      set('ind-tt-reat', fN(d.reat));
      set('ind-tt-reat-ret', fN(d.reat_ret));
      set('ind-tt-reat-total', fN(reatTotal));

      // Novos Negócios
      const nnTotal = sum(d.nn_pf, d.nn_pj);
      set('ind-nn-total', fN(nnTotal));
      set('ind-tt-nn-pf', fN(d.nn_pf));
      set('ind-tt-nn-pj', fN(d.nn_pj));
      set('ind-tt-nn-total', fN(nnTotal));

      // Upgrade
      set('ind-upgrade', fN(d.upgrade));

      // Resultado
      set('ind-resultado', fN(d.resultado));

      // OS Suporte
      const osTotal = sum(d.os_pf, d.os_pj);
      set('ind-os-total', fN(osTotal));
      set('ind-tt-os-pf', fN(d.os_pf));
      set('ind-tt-os-pj', fN(d.os_pj));
      set('ind-tt-os-total', fN(osTotal));

      // Valor Cancelamento
      const valCancTotal = d.val_canc !== null && d.val_canc !== undefined ? d.val_canc : sum(d.val_canc_pf, d.val_canc_pj);
      set('ind-val-canc-total', fR(valCancTotal));
      set('ind-tt-val-canc-pf', fR(d.val_canc_pf));
      set('ind-tt-val-canc-pj', fR(d.val_canc_pj));
      set('ind-tt-val-canc-total', fR(valCancTotal));

      // Juros
      const jurosTotal = sum(d.juros45, d.juros45m);
      set('ind-juros-total', fN(jurosTotal));
      set('ind-tt-juros45', fN(d.juros45));
      set('ind-tt-juros45m', fN(d.juros45m));
      set('ind-tt-juros-total', fN(jurosTotal));

      // Reajuste
      const reajusteTotal = sum(d.reajuste_pf, d.reajuste_pj);
      set('ind-reajuste-total', fN(reajusteTotal));
      set('ind-tt-reajuste-pf', fN(d.reajuste_pf));
      set('ind-tt-reajuste-pj', fN(d.reajuste_pj));
      set('ind-tt-reajuste-total', fN(reajusteTotal));

      // Canc. 1º Mês
      set('ind-canc-1a', fN(d.canc_1a));
      set('ind-tt-canc-1a-qtd', fN(d.canc_1a));
      set('ind-tt-canc-1a-val', fR(d.val_canc_1a));
    }
    // ========== IMPORTAR HISTÓRICO 2025 → SUPABASE ==========
    async function importarHistorico2025(btn) {
      const statusEl = document.getElementById('importar2025Status');
      btn.disabled = true;
      btn.textContent = '⏳ Importando...';
      statusEl.textContent = '';

      const DADOS_2025 = {
        '01': { base_pf:15869,base_pj:3953,base_isentos:690,contratos:20512,os_pf:861,os_pj:489,nc_pf:288,nc_pj:76,canc_pf:371,canc_pj:57,retiradas:334,canc_sr:52,canc_1a:9,val_canc_1a:878.10,reat_ret:7,nn:46650.90,nn_pf:27392.40,nn_pj:18054.33,upgrade:1204.17,reat:658.27,val_canc:42841.83,val_canc_pf:31673.68,val_canc_pj:11355.97,downgrade:-470.45,resultado:3809.07,juros45:44464.51,juros45m:3005.66,reajuste_pf:null,reajuste_pj:null },
        '02': { base_pf:15804,base_pj:3980,base_isentos:702,contratos:20486,os_pf:717,os_pj:375,nc_pf:279,nc_pj:65,canc_pf:327,canc_pj:49,retiradas:298,canc_sr:38,canc_1a:7,val_canc_1a:657.30,reat_ret:10,nn:46143.17,nn_pf:26793.90,nn_pj:14589.05,upgrade:4760.22,reat:514.40,val_canc:47452.61,val_canc_pf:29506.04,val_canc_pj:13936.21,downgrade:-4524.76,resultado:-1309.44,juros45:42336.28,juros45m:1218.58,reajuste_pf:null,reajuste_pj:null },
        '03': { base_pf:15735,base_pj:4004,base_isentos:712,contratos:20451,os_pf:838,os_pj:339,nc_pf:262,nc_pj:58,canc_pf:329,canc_pj:44,retiradas:317,canc_sr:26,canc_1a:5,val_canc_1a:419.50,reat_ret:1,nn:39729.03,nn_pf:23751.35,nn_pj:15025.42,upgrade:952.26,reat:81.84,val_canc:49047.52,val_canc_pf:29678.50,val_canc_pj:16564.71,downgrade:-2886.15,resultado:-9318.49,juros45:47288.84,juros45m:974.33,reajuste_pf:null,reajuste_pj:null },
        '04': { base_pf:15669,base_pj:4039,base_isentos:713,contratos:20421,os_pf:743,os_pj:441,nc_pf:275,nc_pj:77,canc_pf:278,canc_pj:49,retiradas:262,canc_sr:32,canc_1a:2,val_canc_1a:149.80,reat_ret:9,nn:49876.39,nn_pf:26455.75,nn_pj:21741.30,upgrade:1679.34,reat:519.40,val_canc:42831.80,val_canc_pf:25549.81,val_canc_pj:12225.22,downgrade:-5576.17,resultado:7044.59,juros45:45846.15,juros45m:1992.37,reajuste_pf:null,reajuste_pj:null },
        '05': { base_pf:15664,base_pj:4069,base_isentos:713,contratos:20446,os_pf:723,os_pj:398,nc_pf:307,nc_pj:79,canc_pf:352,canc_pj:44,retiradas:320,canc_sr:40,canc_1a:6,val_canc_1a:544.40,reat_ret:7,nn:51995.16,nn_pf:29847.26,nn_pj:19948.50,upgrade:2199.40,reat:274.70,val_canc:53068.76,val_canc_pf:31121.56,val_canc_pj:20406.15,downgrade:-1815.75,resultado:-1073.60,juros45:51692.27,juros45m:1579.79,reajuste_pf:null,reajuste_pj:null },
        '06': { base_pf:15685,base_pj:4110,base_isentos:712,contratos:20507,os_pf:656,os_pj:327,nc_pf:287,nc_pj:58,canc_pf:302,canc_pj:39,retiradas:283,canc_sr:28,canc_1a:24,val_canc_1a:3699.50,reat_ret:4,nn:55157.96,nn_pf:27711.75,nn_pj:22778.21,upgrade:4578.10,reat:235.70,val_canc:34819.57,val_canc_pf:25988.39,val_canc_pj:8474.11,downgrade:-592.77,resultado:20338.39,juros45:47588.50,juros45m:1911.15,reajuste_pf:null,reajuste_pj:null },
        '07': { base_pf:15704,base_pj:4137,base_isentos:716,contratos:20557,os_pf:802,os_pj:410,nc_pf:309,nc_pj:96,canc_pf:330,canc_pj:33,retiradas:296,canc_sr:31,canc_1a:44,val_canc_1a:4363.60,reat_ret:6,nn:54772.25,nn_pf:29906.85,nn_pj:19395.60,upgrade:5469.80,reat:89.90,val_canc:43249.90,val_canc_pf:26597.96,val_canc_pj:14102.77,downgrade:-2639.07,resultado:11522.35,juros45:50389.14,juros45m:1600.53,reajuste_pf:null,reajuste_pj:null },
        '08': { base_pf:15732,base_pj:4203,base_isentos:721,contratos:20656,os_pf:718,os_pj:406,nc_pf:335,nc_pj:84,canc_pf:330,canc_pj:46,retiradas:313,canc_sr:29,canc_1a:37,val_canc_1a:5158.20,reat_ret:3,nn:61180.46,nn_pf:31661.75,nn_pj:22340.50,upgrade:4778.63,reat:122.90,val_canc:41689.01,val_canc_pf:27836.53,val_canc_pj:10740.09,downgrade:-3235.29,resultado:19491.45,juros45:50262.05,juros45m:1274.58,reajuste_pf:null,reajuste_pj:null },
        '09': { base_pf:15764,base_pj:4232,base_isentos:725,contratos:20721,os_pf:717,os_pj:434,nc_pf:302,nc_pj:77,canc_pf:368,canc_pj:73,retiradas:319,canc_sr:49,canc_1a:45,val_canc_1a:4362.60,reat_ret:6,nn:54319.10,nn_pf:29095.10,nn_pj:20057.40,upgrade:997.47,reat:880.10,val_canc:52649.47,val_canc_pf:30582.01,val_canc_pj:20211.16,downgrade:-2736.40,resultado:1669.63,juros45:52659.47,juros45m:1373.38,reajuste_pf:null,reajuste_pj:null },
        '10': { base_pf:15804,base_pj:4244,base_isentos:719,contratos:20767,os_pf:769,os_pj:433,nc_pf:331,nc_pj:80,canc_pf:340,canc_pj:63,retiradas:145,canc_sr:29,canc_1a:52,val_canc_1a:5068.80,reat_ret:8,nn:58335.49,nn_pf:32558.50,nn_pj:20602.00,upgrade:2883.38,reat:133.57,val_canc:44574.69,val_canc_pf:27377.50,val_canc_pj:15341.00,downgrade:-1989.76,resultado:13760.80,juros45:53819.43,juros45m:2057.75,reajuste_pf:null,reajuste_pj:null },
        '11': { base_pf:15890,base_pj:4269,base_isentos:728,contratos:20887,os_pf:698,os_pj:378,nc_pf:322,nc_pj:73,canc_pf:337,canc_pj:39,retiradas:161,canc_sr:22,canc_1a:36,val_canc_1a:3826.20,reat_ret:5,nn:59723.49,nn_pf:31609.95,nn_pj:20652.28,upgrade:5374.50,reat:1236.14,val_canc:41196.56,val_canc_pf:29384.75,val_canc_pj:11647.68,downgrade:-1400.27,resultado:18526.93,juros45:53121.90,juros45m:1950.73,reajuste_pf:null,reajuste_pj:null },
        '12': { base_pf:15893,base_pj:4333,base_isentos:737,contratos:20963,os_pf:711,os_pj:379,nc_pf:368,nc_pj:94,canc_pf:340,canc_pj:36,retiradas:258,canc_sr:15,canc_1a:46,val_canc_1a:4663.20,reat_ret:8,nn:63255.99,nn_pf:35362.60,nn_pj:26229.46,upgrade:1102.67,reat:529.40,val_canc:42753.55,val_canc_pf:27595.70,val_canc_pj:11073.20,downgrade:-4614.05,resultado:20502.44,juros45:57053.10,juros45m:1538.35,reajuste_pf:null,reajuste_pj:null },
      };

      const NOMES = {'01':'Janeiro','02':'Fevereiro','03':'Março','04':'Abril','05':'Maio','06':'Junho','07':'Julho','08':'Agosto','09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'};
      const meses = Object.keys(DADOS_2025);
      let ok = 0;

      for (const mes of meses) {
        try {
          const chave = `ind_dados:2025:${mes}`;
          const { error } = await sb
            .from('indicadores_app_storage')
            .upsert({ key: chave, value: JSON.stringify(DADOS_2025[mes]), updated_at: new Date().toISOString() }, { onConflict: 'key' });
          if (error) throw error;
          ok++;
          statusEl.textContent = `✓ ${ok}/12 meses salvos...`;
          statusEl.style.color = '#059669';
        } catch(e) {
          statusEl.textContent = `Erro em ${NOMES[mes]}: ${e.message}`;
          statusEl.style.color = '#dc2626';
        }
      }

      if (ok === 12) {
        btn.textContent = '✅ 2025 Importado!';
        btn.style.background = 'linear-gradient(135deg,#047857,#065f46)';
        statusEl.textContent = '✓ 12/12 meses salvos no Supabase com sucesso!';
      } else {
        btn.disabled = false;
        btn.textContent = '📥 Tentar novamente';
      }
    }

    // ========== FILTRO HISTÓRICO 2025 ==========
    function filtrarHist2025(mes) {
      const cards = document.querySelectorAll('#hist2025Grid [data-mes]');
      cards.forEach(card => {
        if (mes === 'all' || card.dataset.mes === mes) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }





    // ========== DEMONSTRATIVO — MODO ==========
    let demoModo = 'mxm'; // 'mxm' | 'anual' | 'trim'

    function demoSetModo(modo) {
      demoModo = modo;
      // Atualiza tabs visuais
      const tabs = { mxm:'demoTabMxM', anual:'demoTabAnual', trim:'demoTabTrim' };
      Object.entries(tabs).forEach(([k, id]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        if (k === modo) {
          btn.style.background = 'rgba(255,255,255,0.9)';
          btn.style.color = '#1e3a8a';
        } else {
          btn.style.background = 'transparent';
          btn.style.color = 'white';
        }
      });
      // Mostra filtros corretos
      document.getElementById('demoFiltroMxM').style.display    = modo === 'mxm'   ? 'flex' : 'none';
      document.getElementById('demoFiltroAnual').style.display  = modo === 'anual' ? 'flex' : 'none';
      document.getElementById('demoFiltroTrim').style.display   = modo === 'trim'  ? 'flex' : 'none';
      // Atualiza subtítulo
      const subs = { mxm:'Comparativo mês atual × mesmo mês do ano anterior', anual:'Evolução mês a mês do ano selecionado', trim:'Comparativo trimestral: ano selecionado × ano anterior' };
      const el = document.getElementById('demoSubtitulo');
      if (el) el.textContent = subs[modo];
      carregarDemonstrativo();
    }

    // ========== DEMONSTRATIVO ==========
    async function carregarDemonstrativo() {
      if (demoModo === 'anual') return demoModoAnual();
      if (demoModo === 'trim')  return demoModoTrimestral();
      return demoModoMxM();
    }

    async function demoModoMxM() {
      const mesIdx  = parseInt(document.getElementById('demoMesFiltro')?.value ?? new Date().getMonth());
      const anoAtual = parseInt(document.getElementById('demoAnoFiltro')?.value ?? new Date().getFullYear());
      const anoAnt  = anoAtual - 1;
      const m       = String(mesIdx + 1).padStart(2, '0');
      const MESES   = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const nomeMes = MESES[mesIdx];

      const semDados = document.getElementById('demoSemDados');
      const grid     = document.getElementById('demoGrid');
      semDados.style.display = 'block';
      grid.style.display = 'none';

      // Atualiza label do período
      document.getElementById('demoPeríodoLabel').textContent = `${nomeMes}/${anoAtual} × ${nomeMes}/${anoAnt}`;
      document.getElementById('demoColAno').textContent       = `${nomeMes}/${anoAtual}`;
      document.getElementById('demoColAnterior').textContent  = `${nomeMes}/${anoAnt}`;

      // Carrega os dois anos do Supabase — chave: diretoria_YYYY_MM
      let dAtual = null, dAnt = null;
      const chaveAtual = 'diretoria_'+anoAtual+'_'+m;
      const chaveAnt   = 'diretoria_'+anoAnt+'_'+m;
      const chaveLeg   = 'ind_dados:'+anoAnt+':'+m;
      console.log('[Demo] Buscando:', chaveAtual, 'e', chaveAnt);
      try { const r = await sbStorage.get(chaveAtual); console.log('[Demo] atual raw:', r); if (r) dAtual = JSON.parse(r); } catch(e) { console.error('[Demo] erro atual:', e); }
      try { const r = await sbStorage.get(chaveAnt);   console.log('[Demo] ant raw:', r);   if (r) dAnt   = JSON.parse(r); } catch(e) { console.error('[Demo] erro ant:', e); }
      if (!dAnt) { try { const r = await sbStorage.get(chaveLeg); console.log('[Demo] leg raw:', r); if (r) dAnt = JSON.parse(r); } catch(e) {} }
      console.log('[Demo] dAtual:', dAtual, ' dAnt:', dAnt);
      // Dados salvos como { mes, ano, dados, savedAt } — extrair .dados
      if (dAtual && dAtual.dados) dAtual = dAtual.dados;
      if (dAnt   && dAnt.dados)   dAnt   = dAnt.dados;
      console.log('[Demo] após extração — dAtual:', dAtual, ' dAnt:', dAnt);

      if (!dAtual && !dAnt) {
        document.getElementById('demoSemDadosMsg').innerHTML =
          `Nenhum dado encontrado para <strong>${nomeMes}/${anoAtual}</strong> nem <strong>${nomeMes}/${anoAnt}</strong>.<br>Carregue os PDFs em ⚙️ Parâmetros.`;
        return;
      }

      semDados.style.display = 'none';
      grid.style.display = 'block';

      // Definição dos indicadores — label, chave, tipo (num | cur), sinal (+ = bom subir, - = bom cair)
      const indicadores = [
        { label:'Base Clientes PF',         key:'base_pf',      tipo:'num', sinal:+1 },
        { label:'Base Clientes PJ+PME',      key:'base_pj',      tipo:'num', sinal:+1 },
        { label:'Base Isentos',              key:'base_isentos', tipo:'num', sinal: 0 },
        { label:'Base de Contratos',         key:'contratos',    tipo:'num', sinal:+1 },
        { label:'OS Suporte PF',             key:'os_pf',        tipo:'num', sinal:-1 },
        { label:'OS Suporte PJ',             key:'os_pj',        tipo:'num', sinal:-1 },
        { label:'Novos Clientes PF',         key:'nc_pf',        tipo:'num', sinal:+1 },
        { label:'Novos Clientes PJ',         key:'nc_pj',        tipo:'num', sinal:+1 },
        { label:'Cancelamento PF',           key:'canc_pf',      tipo:'num', sinal:-1 },
        { label:'Cancelam. PME+PJ',          key:'canc_pj',      tipo:'num', sinal:-1 },
        { label:'Retiradas',                 key:'retiradas',    tipo:'num', sinal:-1 },
        { label:'Can S/ Retirada',           key:'canc_sr',      tipo:'num', sinal:-1 },
        { label:'QTD. Canc. 1 Mês',         key:'canc_1a',      tipo:'num', sinal:-1 },
        { label:'Valor Canc. 1 Mês',        key:'val_canc_1a',  tipo:'cur', sinal:-1 },
        { label:'Reativacoes Retirada',      key:'reat_ret',     tipo:'num', sinal:+1 },
        { label:'Novos Negócios',            key:'nn',           tipo:'cur', sinal:+1 },
        { label:'Novos Negócios PF',         key:'nn_pf',        tipo:'cur', sinal:+1 },
        { label:'Novos Negócios PJ',         key:'nn_pj',        tipo:'cur', sinal:+1 },
        { label:'Upgrade',                   key:'upgrade',      tipo:'cur', sinal:+1 },
        { label:'Reativacoes',               key:'reat',         tipo:'cur', sinal:+1 },
        { label:'Valor Cancelamento',        key:'val_canc',     tipo:'cur', sinal:-1 },
        { label:'Valor Canc. PF',            key:'val_canc_pf',  tipo:'cur', sinal:-1 },
        { label:'Valor Canc. PJ+PME',        key:'val_canc_pj',  tipo:'cur', sinal:-1 },
        { label:'Downgrade',                 key:'downgrade',    tipo:'cur', sinal:-1 },
        { label:'Resultado Líquido',         key:'resultado',    tipo:'cur', sinal:+1 },
        { label:'Juros < 45',               key:'juros45',      tipo:'cur', sinal:+1 },
        { label:'Juros > 45',               key:'juros45m',     tipo:'cur', sinal: 0 },
      ];

      function fNum(v) {
        if (v == null) return '—';
        return Number(v).toLocaleString('pt-BR');
      }
      function fCur(v) {
        if (v == null) return '—';
        const neg = v < 0;
        const s = 'R$ ' + Math.abs(v).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
        return neg ? '-' + s : s;
      }
      function fmt(v, tipo) { return tipo === 'cur' ? fCur(v) : fNum(v); }

      function varTag(vAtual, vAnt, sinal) {
        if (vAtual == null || vAnt == null || vAnt === 0) return '<td style="text-align:right;padding:0.65rem 1.25rem;border-bottom:1px solid #f1f5f9;font-size:0.82rem;color:#94a3b8">—</td>';
        const diff = vAtual - vAnt;
        const pct  = ((diff / Math.abs(vAnt)) * 100).toFixed(1);
        const bom  = (sinal > 0 && diff >= 0) || (sinal < 0 && diff <= 0) || sinal === 0;
        const cor  = diff === 0 ? '#64748b' : bom ? '#16a34a' : '#dc2626';
        const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '●';
        return `<td style="text-align:right;padding:0.65rem 1.25rem;border-bottom:1px solid #f1f5f9;font-size:0.82rem;font-weight:700;color:${cor}">${arrow} ${Math.abs(pct)}%</td>`;
      }

      // Tabela
      let rows = '';
      indicadores.forEach((ind, i) => {
        const vA = dAtual ? dAtual[ind.key] : null;
        const vB = dAnt   ? dAnt[ind.key]   : null;
        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        const isDestaque = ['nn','resultado','val_canc'].includes(ind.key);
        const fw = isDestaque ? '700' : '500';
        rows += `<tr style="background:${bg}">
          <td style="padding:0.65rem 1.25rem;border-bottom:1px solid #f1f5f9;font-size:0.85rem;color:#1e293b;font-weight:${fw}">${ind.label}</td>
          <td style="text-align:right;padding:0.65rem 1rem;border-bottom:1px solid #f1f5f9;font-size:0.85rem;color:#1e3a8a;font-weight:${fw}">${fmt(vA, ind.tipo)}</td>
          <td style="text-align:right;padding:0.65rem 1rem;border-bottom:1px solid #f1f5f9;font-size:0.85rem;color:#64748b">${fmt(vB, ind.tipo)}</td>
          ${varTag(vA, vB, ind.sinal)}
        </tr>`;
      });
      document.getElementById('demoTabela').innerHTML = rows;

      // Cards de resumo topo
      const resumoItems = [
        { label:'Novos Negócios',    key:'nn',        tipo:'cur', sinal:+1 },
        { label:'Resultado Líquido', key:'resultado',  tipo:'cur', sinal:+1 },
        { label:'Base PF',           key:'base_pf',   tipo:'num', sinal:+1 },
        { label:'Val. Cancelamento', key:'val_canc',  tipo:'cur', sinal:-1 },
      ];
      let cards = '';
      resumoItems.forEach(ind => {
        const vA = dAtual ? dAtual[ind.key] : null;
        const vB = dAnt   ? dAnt[ind.key]   : null;
        const diff = (vA != null && vB != null && vB !== 0) ? ((vA - vB) / Math.abs(vB) * 100).toFixed(1) : null;
        const bom  = diff == null ? null : (ind.sinal > 0 ? parseFloat(diff) >= 0 : parseFloat(diff) <= 0);
        const cor  = bom == null ? '#64748b' : bom ? '#16a34a' : '#dc2626';
        const varStr = diff != null ? `<div style="font-size:0.8rem;font-weight:700;color:${cor};margin-top:0.25rem">${parseFloat(diff) >= 0 ? '▲' : '▼'} ${Math.abs(diff)}% vs ${nomeMes}/${anoAnt}</div>` : '';
        cards += `<div style="background:white;border-radius:12px;padding:1.25rem;box-shadow:0 2px 8px rgba(0,0,0,0.07);border-left:4px solid ${cor}">
          <div style="font-size:0.78rem;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem">${ind.label}</div>
          <div style="font-size:1.3rem;font-weight:700;color:#1e293b">${fmt(vA, ind.tipo)}</div>
          ${varStr}
        </div>`;
      });
      document.getElementById('demoResumo').innerHTML = cards;
    }


    // ===== DEMONSTRATIVO: MÊS A MÊS ANUAL =====
    async function demoModoAnual() {
      const ano = parseInt(document.getElementById('demoAnoAnualFiltro')?.value || 2026);
      const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const semDados = document.getElementById('demoSemDados');
      const grid     = document.getElementById('demoGrid');
      semDados.style.display = 'block';
      grid.style.display = 'none';
      document.getElementById('demoPeríodoLabel').textContent = `Ano ${ano} — todos os meses`;

      // Carrega todos os 12 meses
      const dadosMeses = [];
      for (let i = 0; i < 12; i++) {
        const m = String(i+1).padStart(2,'0');
        let d = null;
        try { const r = await sbStorage.get('diretoria_'+ano+'_'+m); if (r) { const p = JSON.parse(r); d = p.dados || p; } } catch(e) {}
        if (!d) { try { const r = await sbStorage.get('ind_dados:'+ano+':'+m); if (r) d = JSON.parse(r); } catch(e) {} }
        dadosMeses.push(d);
      }

      const algum = dadosMeses.some(d => d !== null);
      if (!algum) {
        document.getElementById('demoSemDadosMsg').innerHTML = `Nenhum dado encontrado para <strong>${ano}</strong>.`;
        return;
      }
      semDados.style.display = 'none';
      grid.style.display = 'block';
      document.getElementById('demoResumo').innerHTML = '';

      const indicadores = [
        { label:'Base Clientes PF', key:'base_pf', tipo:'num' },
        { label:'Base Clientes PJ+PME', key:'base_pj', tipo:'num' },
        { label:'Novos Clientes PF', key:'nc_pf', tipo:'num' },
        { label:'Novos Clientes PJ', key:'nc_pj', tipo:'num' },
        { label:'Cancelamento PF', key:'canc_pf', tipo:'num' },
        { label:'Cancelam. PME+PJ', key:'canc_pj', tipo:'num' },
        { label:'Novos Negócios', key:'nn', tipo:'cur' },
        { label:'Novos Negócios PF', key:'nn_pf', tipo:'cur' },
        { label:'Novos Negócios PJ', key:'nn_pj', tipo:'cur' },
        { label:'Valor Cancelamento', key:'val_canc', tipo:'cur' },
        { label:'Resultado Líquido', key:'resultado', tipo:'cur' },
        { label:'Juros < 45', key:'juros45', tipo:'cur' },
        { label:'Retiradas', key:'retiradas', tipo:'num' },
        { label:'OS Suporte PF', key:'os_pf', tipo:'num' },
        { label:'OS Suporte PJ', key:'os_pj', tipo:'num' },
        { label:'Upgrade', key:'upgrade', tipo:'cur' },
        { label:'Downgrade', key:'downgrade', tipo:'cur' },
      ];

      function fNum(v) { return v==null ? '—' : Number(v).toLocaleString('pt-BR'); }
      function fCur(v) { if(v==null) return '—'; const neg=v<0; const s='R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); return neg?'-'+s:s; }
      function fmt(v,t) { return t==='cur'?fCur(v):fNum(v); }

      // Build header
      let thMeses = MESES.map((m,i) => {
        const hasData = dadosMeses[i] !== null;
        return `<th style="text-align:right;padding:0.5rem 0.4rem;font-size:0.72rem;color:${hasData?'#1e3a8a':'#94a3b8'};font-weight:600;border-bottom:1px solid #e2e8f0;white-space:nowrap">${m.substring(0,3).toUpperCase()}</th>`;
      }).join('');
      let thTotal = `<th style="text-align:right;padding:0.5rem 0.75rem;font-size:0.72rem;color:#1e3a8a;font-weight:700;border-bottom:1px solid #e2e8f0;white-space:nowrap;background:#eff6ff">TOTAL</th>`;

      let rows = '';
      indicadores.forEach((ind, idx) => {
        const bg = idx%2===0?'#fff':'#f8fafc';
        const isCur = ind.tipo==='cur';
        const vals = dadosMeses.map(d => d ? (d[ind.key] ?? null) : null);
        const total = isCur
          ? vals.reduce((s,v) => s + (v||0), 0)
          : null; // for num (base) total doesn't make sense, use last non-null
        const lastVal = [...vals].reverse().find(v => v !== null);
        const fw = ['nn','resultado','val_canc'].includes(ind.key) ? '700' : '500';
        const tds = vals.map(v => `<td style="text-align:right;padding:0.45rem 0.4rem;border-bottom:1px solid #f1f5f9;font-size:0.8rem;color:#1e293b;font-weight:${fw}">${fmt(v,ind.tipo)}</td>`).join('');
        const totalDisplay = isCur ? fmt(total, 'cur') : fmt(lastVal, 'num');
        const totalColor = isCur && total < 0 ? '#dc2626' : '#1e3a8a';
        rows += `<tr style="background:${bg}">
          <td style="padding:0.45rem 1rem;border-bottom:1px solid #f1f5f9;font-size:0.8rem;color:#1e293b;font-weight:${fw};white-space:nowrap">${ind.label}</td>
          ${tds}
          <td style="text-align:right;padding:0.55rem 1rem;border-bottom:1px solid #f1f5f9;font-size:0.83rem;font-weight:700;color:${totalColor};background:#eff6ff">${totalDisplay}</td>
        </tr>`;
      });

      document.getElementById('demoTabela').innerHTML = rows;
      // Replace header row
      const thead = document.querySelector('#demonstrativoView thead tr');
      if (thead) thead.innerHTML = `<th style="text-align:left;padding:0.75rem 1rem;font-size:0.82rem;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;min-width:140px">INDICADOR</th>${thMeses}${thTotal}`;
    }

    // ===== DEMONSTRATIVO: TRIMESTRAL =====
    async function demoModoTrimestral() {
      const trim = parseInt(document.getElementById('demoTrimFiltro')?.value || 1);
      const ano  = parseInt(document.getElementById('demoAnoTrimFiltro')?.value || 2026);
      const anoAnt = ano - 1;
      const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const TRIM_MESES = { 1:[0,1,2], 2:[3,4,5], 3:[6,7,8], 4:[9,10,11] };
      const TRIM_NOME  = { 1:'Q1 (Jan-Mar)', 2:'Q2 (Abr-Jun)', 3:'Q3 (Jul-Set)', 4:'Q4 (Out-Dez)' };
      const mesesIdx = TRIM_MESES[trim];

      const semDados = document.getElementById('demoSemDados');
      const grid     = document.getElementById('demoGrid');
      semDados.style.display = 'block';
      grid.style.display = 'none';
      document.getElementById('demoPeríodoLabel').textContent = `${TRIM_NOME[trim]} — ${ano} × ${anoAnt}`;

      // Carrega meses do trimestre para os 2 anos
      async function carregaTrim(anoX) {
        const res = [];
        for (const i of mesesIdx) {
          const m = String(i+1).padStart(2,'0');
          let d = null;
          try { const r = await sbStorage.get('diretoria_'+anoX+'_'+m); if(r){const p=JSON.parse(r);d=p.dados||p;} } catch(e){}
          if (!d) { try { const r = await sbStorage.get('ind_dados:'+anoX+':'+m); if(r) d=JSON.parse(r); } catch(e){} }
          res.push(d);
        }
        return res;
      }

      const dadosAtual = await carregaTrim(ano);
      const dadosAnt   = await carregaTrim(anoAnt);

      if (!dadosAtual.some(d=>d) && !dadosAnt.some(d=>d)) {
        document.getElementById('demoSemDadosMsg').innerHTML = `Nenhum dado para <strong>${TRIM_NOME[trim]}</strong> em ${ano} ou ${anoAnt}.`;
        return;
      }
      semDados.style.display = 'none';
      grid.style.display = 'block';
      document.getElementById('demoResumo').innerHTML = '';

      const indicadores = [
        { label:'Base Clientes PF', key:'base_pf', tipo:'num', sinal:+1 },
        { label:'Base Clientes PJ+PME', key:'base_pj', tipo:'num', sinal:+1 },
        { label:'Novos Clientes PF', key:'nc_pf', tipo:'num', sinal:+1 },
        { label:'Novos Clientes PJ', key:'nc_pj', tipo:'num', sinal:+1 },
        { label:'Cancelamento PF', key:'canc_pf', tipo:'num', sinal:-1 },
        { label:'Cancelam. PME+PJ', key:'canc_pj', tipo:'num', sinal:-1 },
        { label:'Retiradas', key:'retiradas', tipo:'num', sinal:-1 },
        { label:'OS Suporte PF', key:'os_pf', tipo:'num', sinal:-1 },
        { label:'OS Suporte PJ', key:'os_pj', tipo:'num', sinal:-1 },
        { label:'Novos Negócios', key:'nn', tipo:'cur', sinal:+1 },
        { label:'Novos Negócios PF', key:'nn_pf', tipo:'cur', sinal:+1 },
        { label:'Novos Negócios PJ', key:'nn_pj', tipo:'cur', sinal:+1 },
        { label:'Upgrade', key:'upgrade', tipo:'cur', sinal:+1 },
        { label:'Valor Cancelamento', key:'val_canc', tipo:'cur', sinal:-1 },
        { label:'Resultado Líquido', key:'resultado', tipo:'cur', sinal:+1 },
        { label:'Juros < 45', key:'juros45', tipo:'cur', sinal:+1 },
        { label:'Downgrade', key:'downgrade', tipo:'cur', sinal:-1 },
      ];

      function fNum(v) { return v==null?'—':Number(v).toLocaleString('pt-BR'); }
      function fCur(v) { if(v==null) return '—'; const neg=v<0; const s='R$ '+Math.abs(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); return neg?'-'+s:s; }
      function fmt(v,t) { return t==='cur'?fCur(v):fNum(v); }

      function somaOuUltimo(arr, tipo) {
        const vals = arr.map(d => d ? (d[ind.key]??null) : null);
        if (tipo==='cur') return vals.reduce((s,v)=>s+(v||0),0);
        return [...vals].reverse().find(v=>v!==null) ?? null;
      }

      // Build headers: 3 meses do trimestre + total trimestre para cada ano
      let thCols = '';
      mesesIdx.forEach(i => {
        thCols += `<th style="text-align:right;padding:0.6rem 0.75rem;font-size:0.73rem;color:#1e3a8a;font-weight:600;border-bottom:1px solid #e2e8f0;min-width:100px;white-space:nowrap">${MESES[i].substring(0,3)}/${ano}</th>`;
      });
      thCols += `<th style="text-align:right;padding:0.6rem 0.75rem;font-size:0.73rem;color:#1e3a8a;font-weight:700;border-bottom:1px solid #e2e8f0;min-width:110px;white-space:nowrap;background:#eff6ff">TOTAL ${ano}</th>`;
      mesesIdx.forEach(i => {
        thCols += `<th style="text-align:right;padding:0.6rem 0.75rem;font-size:0.73rem;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;min-width:100px;white-space:nowrap">${MESES[i].substring(0,3)}/${anoAnt}</th>`;
      });
      thCols += `<th style="text-align:right;padding:0.6rem 0.75rem;font-size:0.73rem;color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;min-width:110px;white-space:nowrap;background:#f8fafc">TOTAL ${anoAnt}</th>`;
      thCols += `<th style="text-align:right;padding:0.6rem 1rem;font-size:0.73rem;color:#1e293b;font-weight:700;border-bottom:1px solid #e2e8f0;min-width:90px;white-space:nowrap">VAR %</th>`;

      const thead = document.querySelector('#demonstrativoView thead tr');
      if (thead) thead.innerHTML = `<th style="text-align:left;padding:0.75rem 1.25rem;font-size:0.82rem;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;min-width:180px">INDICADOR</th>${thCols}`;

      let rows = '';
      indicadores.forEach((ind, idx) => {
        const bg = idx%2===0?'#fff':'#f8fafc';
        const fw = ['nn','resultado','val_canc'].includes(ind.key)?'700':'500';
        const isCur = ind.tipo==='cur';

        const valsA = dadosAtual.map(d => d?(d[ind.key]??null):null);
        const valsB = dadosAnt.map(d   => d?(d[ind.key]??null):null);
        const totA = isCur ? valsA.reduce((s,v)=>s+(v||0),0) : ([...valsA].reverse().find(v=>v!==null)??null);
        const totB = isCur ? valsB.reduce((s,v)=>s+(v||0),0) : ([...valsB].reverse().find(v=>v!==null)??null);

        const tdsA = valsA.map(v=>`<td style="text-align:right;padding:0.5rem 0.75rem;border-bottom:1px solid #f1f5f9;font-size:0.82rem;color:#1e293b;font-weight:${fw}">${fmt(v,ind.tipo)}</td>`).join('');
        const tdsB = valsB.map(v=>`<td style="text-align:right;padding:0.5rem 0.75rem;border-bottom:1px solid #f1f5f9;font-size:0.82rem;color:#64748b">${fmt(v,ind.tipo)}</td>`).join('');

        const totAColor = isCur&&totA<0?'#dc2626':'#1e3a8a';
        const tdTotA = `<td style="text-align:right;padding:0.5rem 0.75rem;border-bottom:1px solid #f1f5f9;font-size:0.83rem;font-weight:700;color:${totAColor};background:#eff6ff">${fmt(totA,ind.tipo)}</td>`;
        const tdTotB = `<td style="text-align:right;padding:0.5rem 0.75rem;border-bottom:1px solid #f1f5f9;font-size:0.83rem;font-weight:700;color:#64748b;background:#f8fafc">${fmt(totB,ind.tipo)}</td>`;

        let varTd = '<td style="text-align:right;padding:0.5rem 1rem;border-bottom:1px solid #f1f5f9;font-size:0.82rem;color:#94a3b8">—</td>';
        if (totA!=null && totB!=null && totB!==0) {
          const diff = totA - totB;
          const pct  = ((diff/Math.abs(totB))*100).toFixed(1);
          const bom  = (ind.sinal>0&&diff>=0)||(ind.sinal<0&&diff<=0)||ind.sinal===0;
          const cor  = diff===0?'#64748b':bom?'#16a34a':'#dc2626';
          const arr  = diff>0?'▲':diff<0?'▼':'●';
          varTd = `<td style="text-align:right;padding:0.5rem 1rem;border-bottom:1px solid #f1f5f9;font-size:0.82rem;font-weight:700;color:${cor}">${arr} ${Math.abs(pct)}%</td>`;
        }

        rows += `<tr style="background:${bg}">
          <td style="padding:0.5rem 1.25rem;border-bottom:1px solid #f1f5f9;font-size:0.83rem;color:#1e293b;font-weight:${fw};white-space:nowrap">${ind.label}</td>
          ${tdsA}${tdTotA}${tdsB}${tdTotB}${varTd}
        </tr>`;
      });
      document.getElementById('demoTabela').innerHTML = rows;
    }

    // ========== AUTENTICAÇÃO ==========
    let usuarioLogado = null;

    async function sha256hex(str) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }

    async function fazerLogin() {
      const email = document.getElementById('loginEmail').value.trim();
      const senha = document.getElementById('loginSenha').value;
      const erro  = document.getElementById('loginErro');
      const load  = document.getElementById('loginLoading');
      erro.style.display = 'none';

      if (!email || !senha) { erro.textContent = 'Preencha e-mail e senha.'; erro.style.display = 'block'; return; }

      load.style.display = 'block';
      try {
        const hash = await sha256hex(senha);
        const { data, error } = await sb.from('indicadores_usuarios')
          .select('id, nome, email, perfil, ativo')
          .eq('email', email.toLowerCase())
          .eq('senha_hash', hash)
          .eq('ativo', true)
          .maybeSingle();

        load.style.display = 'none';
        if (error || !data) {
          erro.textContent = 'E-mail ou senha incorretos.';
          erro.style.display = 'block';
          return;
        }

        usuarioLogado = data;
        // Lembrar de mim
        if (document.getElementById('loginLembrar')?.checked) {
          localStorage.setItem('texnet_email', email);
          localStorage.setItem('texnet_senha', senha);
          localStorage.setItem('texnet_lembrar', '1');
        } else {
          localStorage.removeItem('texnet_email');
          localStorage.removeItem('texnet_senha');
          localStorage.removeItem('texnet_lembrar');
        }
        // Atualiza último acesso
        await sb.from('indicadores_usuarios').update({ ultimo_acesso: new Date().toISOString() }).eq('id', data.id);
        aplicarPerfil();
      } catch(e) {
        load.style.display = 'none';
        erro.textContent = 'Erro de conexão: ' + e.message;
        erro.style.display = 'block';
      }
    }

    function aplicarPerfil() {
      const user = usuarioLogado;
      if (!user) return;

      // Esconde login, mostra app
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('userBadge').style.display = 'block';
      document.getElementById('userNome').textContent = user.nome;
      document.getElementById('userPerfil').textContent = user.perfil === 'edicao' ? '✏️ Editor' : '👁️ Visualização';

      // Controla abas restritas para perfil visualizacao
      const abasRestritas = ['diretoria', 'powerbi', 'prb']; // ⚙️Parâmetros e 📊Power BI
      document.querySelectorAll('.nav-item').forEach(item => {
        const onclick = item.getAttribute('onclick') || '';
        const match = onclick.match(/'([^']+)'/);
        if (match && abasRestritas.includes(match[1])) {
          item.style.display = user.perfil === 'visualizacao' ? 'none' : 'flex';
        }
      });
    }

    function fazerLogout() {
      usuarioLogado = null;
      if (!localStorage.getItem('texnet_lembrar')) {
        localStorage.removeItem('texnet_email');
        localStorage.removeItem('texnet_senha');
      }
      document.getElementById('loginScreen').style.display = 'flex';
      document.getElementById('userBadge').style.display = 'none';
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginSenha').value = '';
      document.getElementById('loginErro').style.display = 'none';
      // Volta para dashboard
      selectMenu(document.querySelector('.nav-item'), 'dashboard');
    }

    // ===== AUTO LOGIN =====
    (async function() {
      const email = localStorage.getItem('texnet_email');
      const senha = localStorage.getItem('texnet_senha');
      const lembrar = localStorage.getItem('texnet_lembrar');
      if (email && senha && lembrar) {
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginSenha').value = senha;
        document.getElementById('loginLembrar').checked = true;
        await fazerLogin();
      }
    })();
