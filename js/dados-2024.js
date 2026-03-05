// ==================== DADOS FINANCEIROS 2024 ====================
const dadosFinanceiros2024 = {
  receitas: [
        { nome:"Link de Internet",jan:2296418.75,fev:2246205.34,mar:2240969.34,abr:2391638.71,mai:2400146.98,jun:2388827.26,jul:2467265.87,ago:2430822.58,set:2450297.05,out:2499580.29,nov:2434265.42,dez:2521573.61,total:28768011.2 },
        { nome:"Juros/Multa",jan:45838.7,fev:44729.3,mar:43775.38,abr:47612.19,mai:45305.8,jun:41288.12,jul:47039.04,ago:42357.84,set:32561.79,out:31732.0,nov:33249.76,dez:44646.56,total:500136.48 },
        { nome:"Eventos",jan:1520.0,fev:0.0,mar:0.0,abr:6000.0,mai:2200.0,jun:3550.0,jul:7790.0,ago:4820.0,set:18763.9,out:9204.0,nov:13230.6,dez:19020.4,total:86098.9 },
        { nome:"R. Financeiras",jan:9509.51,fev:6744.59,mar:8722.45,abr:8325.75,mai:6376.68,jun:4183.04,jul:7989.34,ago:7384.25,set:8748.23,out:7492.37,nov:812.97,dez:844.05,total:77133.23 },
        { nome:"V. Ativos",jan:398.44,fev:918.44,mar:0.0,abr:8790.0,mai:0.0,jun:0.0,jul:0.0,ago:520.0,set:0.0,out:0.0,nov:100.0,dez:5120.0,total:15846.88 }
      ],
  impostos: [
        { nome:"ICMS",jan:36455.94,fev:43300.61,mar:35468.81,abr:30515.11,mai:33781.1,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:5104.58,nov:20458.03,dez:24375.3,total:229459.48 },
        { nome:"ICMS (Diversos)",jan:0.0,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:0.0 },
        { nome:"COFINS",jan:40248.95,fev:40517.31,mar:34986.42,abr:39950.72,mai:37474.52,jun:38382.94,jul:43667.84,ago:45016.21,set:44243.26,out:41140.92,nov:42197.73,dez:44550.12,total:492376.94 },
        { nome:"PIS",jan:8729.25,fev:8780.09,mar:7580.81,abr:8656.06,mai:8119.83,jun:8316.91,jul:9450.6,ago:9738.69,set:9569.16,out:8913.87,nov:9142.88,dez:9652.57,total:106650.72 },
        { nome:"IRPJ",jan:104957.27,fev:0.0,mar:0.0,abr:112700.97,mai:0.0,jun:0.0,jul:36538.71,ago:36904.09,set:37221.99,out:112018.4,nov:0.0,dez:0.0,total:440341.43 },
        { nome:"CSLL",jan:39944.61,fev:0.0,mar:0.0,abr:42732.35,mai:0.0,jun:0.0,jul:13891.97,ago:14030.51,set:14151.38,out:42721.0,nov:0.0,dez:0.0,total:167471.82 },
        { nome:"ISS",jan:12348.32,fev:13850.41,mar:12066.06,abr:12214.08,mai:12711.35,jun:10563.75,jul:11955.4,ago:16266.26,set:16607.98,out:13984.31,nov:13389.3,dez:14461.47,total:160418.69 },
        { nome:"ISS (Diversos)",jan:16089.72,fev:12544.2,mar:13925.57,abr:13050.59,mai:13651.15,jun:13377.37,jul:13977.68,ago:19271.39,set:19377.31,out:16841.93,nov:17250.14,dez:19416.1,total:188773.15 },
        { nome:"Simples Nacional",jan:620.49,fev:560.44,mar:761.01,abr:600.0,mai:672.16,jun:640.0,jul:646.95,ago:640.0,set:1275.75,out:1751.44,nov:1688.35,dez:1986.08,total:11842.67 },
        { nome:"FUST/FUNTTEL",jan:3330.64,fev:3343.99,mar:3454.99,abr:3261.01,mai:3279.93,jun:3290.94,jul:3243.79,ago:3257.53,set:3406.45,out:3682.24,nov:4784.77,dez:5040.55,total:43376.83 },
        { nome:"Vendas Canc.",jan:703.88,fev:79.9,mar:447.93,abr:289.7,mai:2656.7,jun:427.9,jul:1732.18,ago:891.55,set:291.06,out:333.82,nov:124.85,dez:1465.51,total:9444.98 }
      ],
  custos: [
        { nome:"Kit Instalação",jan:131105.34,fev:151790.59,mar:128013.53,abr:193758.13,mai:191730.26,jun:153199.62,jul:194324.23,ago:243236.35,set:203855.13,out:186381.55,nov:147165.32,dez:125678.94,total:2050238.99 },
        { nome:"Materiais de Rede",jan:61156.71,fev:51499.21,mar:47779.84,abr:52466.74,mai:43319.5,jun:52769.3,jul:42625.73,ago:57442.08,set:65333.4,out:71366.99,nov:66772.94,dez:59494.94,total:672027.38 },
        { nome:"Links de Dados / Voip",jan:80539.67,fev:84823.52,mar:24320.01,abr:92199.5,mai:95225.0,jun:59801.29,jul:57535.87,ago:60294.36,set:60972.34,out:61091.52,nov:52533.96,dez:56930.69,total:786267.73 },
        { nome:"Vtal",jan:0.0,fev:26804.91,mar:47958.2,abr:51962.86,mai:55102.73,jun:56403.65,jul:54974.71,ago:52642.08,set:53177.09,out:52296.52,nov:54787.32,dez:55611.65,total:561721.72 },
        { nome:"Alugueis/Postes",jan:18280.16,fev:18280.16,mar:0.0,abr:34248.32,mai:15968.16,jun:0.0,jul:31936.32,ago:0.0,set:31936.32,out:15968.16,nov:15968.16,dez:15968.16,total:198553.92 },
        { nome:"Alugueis/Torres",jan:6531.54,fev:10940.05,mar:12122.05,abr:12361.93,mai:11699.57,jun:18912.05,jul:13101.94,ago:12293.45,set:12842.63,out:11900.52,nov:11299.97,dez:12584.19,total:146589.89 },
        { nome:"Custo com SVA",jan:5563.19,fev:7973.25,mar:7316.04,abr:11219.49,mai:10293.24,jun:8676.64,jul:8966.44,ago:12408.21,set:12424.17,out:12432.15,nov:12436.14,dez:13291.61,total:123000.57 },
        { nome:"Energia / POP",jan:9123.05,fev:10886.81,mar:4542.69,abr:8424.34,mai:7515.53,jun:5064.86,jul:7309.14,ago:5905.11,set:9034.73,out:7891.74,nov:10552.72,dez:11523.69,total:97774.41 },
        { nome:"Manut. POP",jan:2540.05,fev:6746.28,mar:5815.38,abr:5843.75,mai:297.25,jun:1871.11,jul:297.25,ago:1131.25,set:297.25,out:3866.73,nov:1277.15,dez:532.65,total:30516.1 },
        { nome:"Comissões",jan:48221.17,fev:51826.44,mar:33569.41,abr:26823.63,mai:36510.72,jun:41343.32,jul:33369.87,ago:56702.27,set:61152.13,out:52925.24,nov:35028.03,dez:44534.34,total:522006.57 },
        { nome:"Comb. Técnico",jan:28249.4,fev:21447.05,mar:31047.17,abr:31967.72,mai:22494.94,jun:24221.26,jul:37720.24,ago:37755.89,set:24965.4,out:29821.02,nov:24100.22,dez:30515.31,total:344305.62 },
        { nome:"Manut. Veículo",jan:12618.76,fev:13358.47,mar:9815.68,abr:13194.87,mai:16661.32,jun:16326.64,jul:15409.38,ago:22002.19,set:25221.88,out:27751.8,nov:26625.24,dez:16931.47,total:215917.7 },
        { nome:"Folha - Direta",jan:536742.69,fev:683041.05,mar:558657.28,abr:595850.56,mai:590829.95,jun:634516.91,jul:621824.36,ago:654484.24,set:624825.96,out:634353.97,nov:712332.85,dez:813838.36,total:7661298.18 },
        { nome:"Telefonia",jan:4985.91,fev:4627.96,mar:4804.12,abr:4946.74,mai:4977.45,jun:4937.77,jul:4956.63,ago:4705.37,set:4828.63,out:4785.91,nov:6144.57,dez:4215.5,total:58916.56 },
        { nome:"Man. Equipamento",jan:0.0,fev:2840.0,mar:830.0,abr:713.85,mai:140.0,jun:1110.0,jul:560.0,ago:0.0,set:925.0,out:0.0,nov:813.34,dez:438.33,total:8370.52 },
        { nome:"Ferramentas",jan:4059.86,fev:4051.3,mar:3335.52,abr:3254.43,mai:7275.51,jun:6675.11,jul:4363.67,ago:5448.01,set:3903.83,out:5429.96,nov:5802.44,dez:2490.42,total:56090.06 },
        { nome:"Tercerização de Serv.",jan:16241.1,fev:17476.66,mar:11175.05,abr:14812.73,mai:12405.1,jun:19872.08,jul:11381.06,ago:6246.5,set:1010.0,out:1440.0,nov:0.0,dez:10200.0,total:122260.28 },
        { nome:"Custos Lastmile",jan:35416.1,fev:37449.61,mar:26715.09,abr:33815.58,mai:31373.83,jun:28404.22,jul:37159.36,ago:34320.66,set:32992.96,out:29827.85,nov:26184.92,dez:37278.74,total:390938.92 },
        { nome:"Investimento/POP",jan:1382.75,fev:19044.93,mar:15022.86,abr:15980.46,mai:15686.1,jun:25440.83,jul:24181.03,ago:21301.61,set:45090.43,out:36092.96,nov:37998.4,dez:34692.02,total:291914.38 },
        { nome:"Operação Recife",jan:0.0,fev:315.6,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:315.6 }
      ],
  despesas: [
        { nome:"Propaganda",jan:45324.4,fev:55346.48,mar:50289.55,abr:55935.47,mai:45191.03,jun:53430.57,jul:71189.37,ago:59904.16,set:43074.94,out:50968.31,nov:44242.05,dez:53218.58,total:628114.91 },
        { nome:"Serv. Terceiros",jan:32197.2,fev:38797.27,mar:36462.56,abr:35394.07,mai:30983.1,jun:50318.82,jul:32969.02,ago:29789.1,set:27225.66,out:30642.25,nov:33190.59,dez:40422.25,total:418391.89 },
        { nome:"Viagens/Estadia",jan:0.0,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:378.43,jul:4645.5,ago:4402.04,set:0.0,out:3108.65,nov:1011.95,dez:1445.03,total:14991.6 },
        { nome:"Segurança Trabalho/ EPI",jan:865.0,fev:612.5,mar:1248.34,abr:1869.29,mai:2374.7,jun:2420.54,jul:1301.06,ago:2048.34,set:1467.67,out:1434.08,nov:2132.25,dez:857.5,total:18631.27 },
        { nome:"Desp. Aluguel",jan:20550.93,fev:25595.5,mar:24349.61,abr:25018.14,mai:24363.82,jun:24763.82,jul:25371.68,ago:25371.68,set:26577.93,out:26826.39,nov:26851.39,dez:27095.39,total:302736.28 },
        { nome:"Desp. Reformas",jan:6424.06,fev:10894.25,mar:5037.11,abr:4378.44,mai:2897.33,jun:4521.5,jul:1761.0,ago:4081.71,set:927.38,out:2519.0,nov:1533.6,dez:637.18,total:45612.56 },
        { nome:"Material Consumo",jan:1489.84,fev:1762.12,mar:1907.8,abr:1979.92,mai:1940.75,jun:2365.17,jul:784.03,ago:1720.81,set:3592.86,out:2565.11,nov:983.58,dez:3326.21,total:24418.2 },
        { nome:"Comb. Adm",jan:1586.08,fev:845.42,mar:935.75,abr:1055.63,mai:1557.75,jun:483.95,jul:766.29,ago:1508.89,set:1094.2,out:933.01,nov:579.7,dez:305.05,total:11651.72 },
        { nome:"Veiculos",jan:926.07,fev:10342.89,mar:10595.37,abr:11968.64,mai:10981.61,jun:12481.82,jul:2817.36,ago:1516.46,set:1568.77,out:1817.73,nov:1200.93,dez:745.86,total:66963.51 },
        { nome:"Despesas Tributárias/ Taxas legais",jan:267.12,fev:544.04,mar:11574.19,abr:467.3,mai:531.6,jun:1491.7,jul:462.09,ago:968.56,set:369.28,out:999.23,nov:911.67,dez:1450.68,total:20037.46 },
        { nome:"Despesas Judiciais",jan:5040.34,fev:0.0,mar:677.03,abr:25594.88,mai:12932.88,jun:895.6,jul:900.32,ago:3106.47,set:573.51,out:0.0,nov:1673.08,dez:0.0,total:51394.11 },
        { nome:"Treinamentos",jan:0.0,fev:0.0,mar:4806.0,abr:581.31,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:121.98,nov:213.6,dez:213.6,total:5936.49 },
        { nome:"Pró-Labore",jan:199175.51,fev:201983.51,mar:202516.06,abr:204212.09,mai:198625.39,jun:199255.1,jul:200810.66,ago:201005.09,set:200328.43,out:200000.0,nov:200000.0,dez:200000.0,total:2407911.84 },
        { nome:"Sistema",jan:21341.51,fev:24665.99,mar:25478.35,abr:26264.03,mai:20602.87,jun:20898.18,jul:22190.05,ago:24079.28,set:19468.59,out:19362.87,nov:20033.45,dez:18934.0,total:263319.17 },
        { nome:"Taxas Boleto",jan:14275.38,fev:14384.98,mar:14786.53,abr:17288.08,mai:15823.48,jun:13974.91,jul:14624.91,ago:13209.5,set:13144.53,out:14088.34,nov:13153.12,dez:13158.13,total:171911.89 },
        { nome:"Enérgia Elétrica",jan:0.0,fev:1472.16,mar:3027.24,abr:1511.12,mai:1655.16,jun:5991.65,jul:6713.35,ago:6426.7,set:0.0,out:5668.04,nov:0.0,dez:5931.02,total:38396.44 },
        { nome:"Despesas Diversas",jan:2056.49,fev:1516.12,mar:1014.21,abr:1350.98,mai:1037.63,jun:801.93,jul:3485.57,ago:302.03,set:1058.84,out:2151.94,nov:1343.07,dez:1878.11,total:17996.92 },
        { nome:"Despesas Financ.",jan:226.87,fev:208.62,mar:677.46,abr:496.35,mai:609.51,jun:519.07,jul:914.23,ago:664.86,set:692.73,out:674.13,nov:987.58,dez:970.54,total:7641.95 },
        { nome:"Tarifas Diversas",jan:226.87,fev:208.62,mar:677.46,abr:496.35,mai:609.51,jun:519.07,jul:914.23,ago:664.86,set:692.73,out:674.13,nov:987.58,dez:970.54,total:7641.95 }
      ],
  ebitda: [
        { nome:"EBITDA",jan:735752.08,fev:561425.02,mar:816552.49,abr:579184.69,mai:800067.95,jun:808309.19,jul:801275.41,ago:671463.13,set:748272.03,out:692010.5,nov:774757.4,dez:752916.78,total:8741986.67 }
      ],
  ebitda_ajustado: [
        { nome:"EBITDA (Ajustado)",jan:735752.08,fev:561425.02,mar:816552.49,abr:579184.69,mai:800067.95,jun:808309.19,jul:801275.41,ago:671463.13,set:748272.03,out:692010.5,nov:774757.4,dez:752916.78,total:8741986.67 }
      ],
  ajustes: [
        { nome:"Investimento",jan:120576.48,fev:106535.73,mar:524094.66,abr:166881.78,mai:153406.85,jun:97066.82,jul:60913.79,ago:51707.45,set:69695.17,out:66413.98,nov:57052.02,dez:109564.9,total:1583909.63 },
        { nome:"Veículos",jan:7956.2,fev:9730.29,mar:10795.0,abr:10992.61,mai:5992.61,jun:10992.61,jul:10992.61,ago:10992.61,set:31550.36,out:27992.61,nov:13064.3,dez:8752.36,total:159804.17 },
        { nome:"Equipamentos/TI",jan:3556.23,fev:2511.09,mar:3814.81,abr:2192.31,mai:3998.39,jun:4408.54,jul:5748.22,ago:5550.19,set:4351.36,out:7976.74,nov:1568.55,dez:1979.64,total:47656.07 },
        { nome:"Ativos imobilizado",jan:24267.8,fev:9498.1,mar:34908.1,abr:28122.13,mai:19070.22,jun:6296.66,jul:7182.96,ago:6394.65,set:5023.45,out:5274.63,nov:42419.17,dez:14022.6,total:202480.47 },
        { nome:"Aq. de provedor",jan:84796.25,fev:84796.25,mar:474576.75,abr:125574.73,mai:124345.63,jun:75369.01,jul:36990.0,ago:28770.0,set:28770.0,out:25170.0,nov:0.0,dez:84810.3,total:1173968.92 },
        { nome:"Empr/Finac/Parcel",jan:1630012.65,fev:439789.68,mar:222930.19,abr:606677.39,mai:1018793.34,jun:554340.65,jul:434199.17,ago:372050.32,set:784082.98,out:1075064.64,nov:972884.01,dez:459712.73,total:8570537.75 },
        { nome:"Empréstimos",jan:79138.29,fev:79118.42,mar:79092.37,abr:79068.25,mai:79372.99,jun:79029.36,jul:79005.42,ago:78984.3,set:29465.04,out:7569.28,nov:29424.97,dez:29403.03,total:728671.72 },
        { nome:"Reneg. Débitos",jan:0.0,fev:0.0,mar:0.0,abr:0.0,mai:455000.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:534795.74,dez:15952.9,total:1005748.64 },
        { nome:"Sócios ou Retiradas",jan:1506376.03,fev:317104.44,mar:100000.0,abr:483184.0,mai:440000.0,jun:417500.0,jul:310224.68,ago:245000.0,set:709046.11,out:999763.96,nov:362492.12,dez:367917.97,total:6258609.31 }
      ],
};