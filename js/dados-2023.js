// ==================== DADOS FINANCEIROS 2023 ====================
const dadosFinanceiros2023 = {
  receitas: [
        { nome:"Aluguel",jan:2033310.68,fev:1946593.87,mar:2190804.62,abr:1980281.99,mai:2194970.94,jun:2225343.14,jul:2164586.34,ago:2136402.5,set:2255795.85,out:2292584.56,nov:2214730.61,dez:2377648.2,total:26013053.3 },
        { nome:"R. Financeiras",jan:5177.45,fev:6770.97,mar:3604.26,abr:4376.62,mai:6833.62,jun:11010.92,jul:15087.3,ago:14194.83,set:23012.78,out:18853.87,nov:21327.34,dez:21472.86,total:151722.82 },
        { nome:"V. Ativos",jan:4229.77,fev:12990.0,mar:26855.0,abr:21535.0,mai:26524.01,jun:6930.0,jul:0.0,ago:7602.0,set:8236.85,out:3192.85,nov:4130.0,dez:0.0,total:122225.48 }
      ],
  impostos: [
        { nome:"ICMS",jan:74760.07,fev:76280.06,mar:68548.32,abr:72557.74,mai:42481.57,jun:38781.44,jul:34978.09,ago:30516.23,set:30121.5,out:24489.39,nov:33643.18,dez:29585.66,total:556743.25 },
        { nome:"ICMS (Diversos)",jan:18994.83,fev:12050.46,mar:10640.61,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:0.0,nov:0.0,dez:0.0,total:41685.9 },
        { nome:"COFINS",jan:37609.56,fev:38425.81,mar:38500.18,abr:39090.66,mai:29867.32,jun:32606.23,jul:32868.25,ago:33486.15,set:32580.78,out:34466.99,nov:36833.62,dez:35912.93,total:422248.48 },
        { nome:"PIS",jan:8148.74,fev:8325.59,mar:8341.71,abr:8469.64,mai:6471.25,jun:7066.32,jul:7121.46,ago:7255.33,set:7059.17,out:7471.76,nov:7986.36,dez:7787.59,total:91504.92 },
        { nome:"IRPJ",jan:146484.43,fev:0.0,mar:0.0,abr:139918.05,mai:0.0,jun:0.0,jul:100569.82,ago:0.0,set:0.0,out:104574.02,nov:0.0,dez:0.0,total:491546.32 },
        { nome:"CSLL",jan:54894.4,fev:0.0,mar:0.0,abr:52530.53,mai:0.0,jun:0.0,jul:39280.33,ago:0.0,set:0.0,out:39806.65,nov:0.0,dez:0.0,total:186511.91 },
        { nome:"ISS",jan:5924.0,fev:9180.98,mar:6605.68,abr:12884.09,mai:12914.31,jun:20963.11,jul:15493.72,ago:10658.02,set:11253.67,out:10381.21,nov:11840.76,dez:11442.04,total:139541.59 },
        { nome:"ISS (Diversos)",jan:7649.96,fev:5290.26,mar:7150.03,abr:9497.02,mai:8966.21,jun:10413.66,jul:12048.24,ago:12324.03,set:11685.9,out:13732.9,nov:11650.69,dez:14437.41,total:124846.31 },
        { nome:"Simples Nacional",jan:718.2,fev:478.8,mar:498.75,abr:498.75,mai:498.75,jun:598.5,jul:638.4,ago:638.4,set:654.0,out:685.89,nov:598.62,dez:638.4,total:7145.46 },
        { nome:"FUST/FUNTTEL",jan:4694.2,fev:4773.89,mar:4776.19,abr:4817.58,mai:3055.35,jun:3334.96,jul:3273.34,ago:2892.7,set:2899.0,out:2834.73,nov:3236.34,dez:2967.87,total:43556.15 },
        { nome:"Vendas Canc.",jan:113.43,fev:208.5,mar:634.43,abr:339.7,mai:164.8,jun:191.5,jul:6759.36,ago:164.9,set:249.8,out:359.6,nov:159.8,dez:175.8,total:9521.62 }
      ],
  custos: [
        { nome:"Kit Instalação",jan:142728.52,fev:138468.66,mar:231402.99,abr:233626.89,mai:255093.04,jun:190470.89,jul:157300.29,ago:103432.64,set:49024.45,out:96502.87,nov:86818.38,dez:74163.95,total:1759033.57 },
        { nome:"Materiais de Rede",jan:100680.33,fev:102955.02,mar:84379.57,abr:80304.66,mai:92004.87,jun:83734.37,jul:65824.91,ago:51676.51,set:102489.23,out:100501.43,nov:61247.6,dez:69682.01,total:995480.51 },
        { nome:"Links de Dados",jan:101247.94,fev:105696.02,mar:143859.11,abr:59391.12,mai:98789.0,jun:67081.9,jul:77597.13,ago:86579.12,set:47027.64,out:90692.15,nov:75418.96,dez:100509.01,total:1053889.1 },
        { nome:"Voip",jan:10400.0,fev:8000.0,mar:2400.0,abr:0.0,mai:16280.4,jun:10060.8,jul:8780.4,ago:8780.4,set:7500.0,out:10060.8,nov:7500.0,dez:11060.8,total:100823.6 },
        { nome:"Alugueis/Postes",jan:44667.96,fev:44720.32,mar:49371.52,abr:44720.32,mai:4651.2,jun:103394.24,jul:49371.52,ago:49371.52,set:0.0,out:98743.04,nov:49371.52,dez:2312.0,total:540695.16 },
        { nome:"Alugueis/Torres",jan:11321.85,fev:10922.36,mar:10716.78,abr:9411.71,mai:10781.85,jun:17873.78,jul:10239.9,ago:10070.65,set:9452.27,out:11389.03,nov:11047.86,dez:15365.74,total:138593.78 },
        { nome:"Custo com SVA",jan:21133.28,fev:10120.72,mar:7439.84,abr:4788.4,mai:4769.12,jun:4778.0,jul:4826.0,ago:3758.0,set:0.0,out:7366.0,nov:3722.0,dez:3674.0,total:76375.36 },
        { nome:"Energia / POP",jan:10496.87,fev:13147.31,mar:10181.14,abr:8798.98,mai:14677.98,jun:13360.29,jul:12119.0,ago:11855.84,set:10530.2,out:15670.27,nov:7477.82,dez:11766.31,total:140082.01 },
        { nome:"Manut. POP",jan:26290.95,fev:13969.18,mar:815.5,abr:278.43,mai:488.43,jun:2529.72,jul:2961.63,ago:2667.51,set:281.8,out:1909.32,nov:278.13,dez:378.13,total:52848.73 },
        { nome:"Comissões",jan:31644.13,fev:33604.98,mar:46356.61,abr:44922.78,mai:38988.53,jun:64249.78,jul:36878.72,ago:44867.73,set:29317.47,out:42954.57,nov:54020.53,dez:45545.97,total:513351.8 },
        { nome:"Comb. Técnico",jan:27456.82,fev:30610.92,mar:30319.38,abr:28053.96,mai:18843.98,jun:18738.03,jul:32043.73,ago:37635.94,set:30381.5,out:20039.17,nov:26724.97,dez:26138.64,total:326987.04 },
        { nome:"Manut. Veículo",jan:20104.0,fev:16139.41,mar:17936.55,abr:15555.58,mai:10993.79,jun:13060.62,jul:17581.63,ago:26650.68,set:23264.38,out:14802.85,nov:14921.95,dez:9536.68,total:200548.12 },
        { nome:"Folha - Direta",jan:480116.48,fev:478962.09,mar:518900.84,abr:441522.52,mai:434194.98,jun:471540.67,jul:473664.07,ago:452481.22,set:490466.21,out:467054.2,nov:559170.44,dez:618395.43,total:5886469.15 },
        { nome:"Telefonia",jan:6148.88,fev:4741.84,mar:6147.33,abr:8386.93,mai:6070.42,jun:7603.22,jul:4150.45,ago:4287.68,set:4263.79,out:4314.25,nov:4691.2,dez:4554.95,total:65360.94 },
        { nome:"Man. Equipamento",jan:225.12,fev:0.0,mar:752.55,abr:2748.89,mai:610.0,jun:2874.5,jul:1671.74,ago:2655.0,set:0.0,out:474.42,nov:0.0,dez:689.92,total:12702.14 },
        { nome:"Ferramentas",jan:850.04,fev:2958.96,mar:2674.46,abr:1275.04,mai:2918.08,jun:1234.12,jul:6997.07,ago:387.65,set:1012.52,out:2790.48,nov:2184.99,dez:2991.93,total:28275.34 },
        { nome:"Tercerização de Serv.",jan:599.89,fev:260.0,mar:2700.0,abr:1900.0,mai:14311.31,jun:20654.88,jul:28938.34,ago:22657.36,set:22256.32,out:19995.69,nov:23625.58,dez:16497.65,total:174397.02 },
        { nome:"Custos Lastmile",jan:8424.06,fev:9724.7,mar:10161.44,abr:16190.17,mai:20142.2,jun:23535.45,jul:24226.26,ago:29609.14,set:34789.21,out:35891.92,nov:33614.93,dez:33556.17,total:279865.65 }
      ],
  despesas: [
        { nome:"Propaganda",jan:53926.27,fev:44695.89,mar:53280.87,abr:40029.12,mai:49856.16,jun:44944.63,jul:45806.83,ago:56919.43,set:32942.51,out:48303.35,nov:60815.32,dez:55598.74,total:587119.12 },
        { nome:"Serv. Terceiros",jan:47646.47,fev:51861.95,mar:38267.84,abr:40998.22,mai:36214.24,jun:32306.02,jul:29795.89,ago:29527.95,set:29209.25,out:28525.95,nov:36059.45,dez:41569.59,total:441982.82 },
        { nome:"Viagens/Estadia/",jan:0.0,fev:698.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:3246.26,ago:0.0,set:0.0,out:0.0,nov:980.0,dez:-52.25,total:4872.01 },
        { nome:"Folha - Adm",jan:77637.31,fev:115144.68,mar:100624.16,abr:90545.97,mai:94748.25,jun:76825.6,jul:87555.6,ago:80275.86,set:123124.0,out:88286.67,nov:83190.3,dez:69854.37,total:1087812.77 },
        { nome:"Seg. Trabalho EPI",jan:683.33,fev:675.0,mar:1005.0,abr:1114.39,mai:892.5,jun:909.0,jul:175.0,ago:134.58,set:1160.0,out:590.0,nov:0.0,dez:1115.0,total:8453.8 },
        { nome:"Desp. Aluguel",jan:22718.84,fev:24055.32,mar:24055.32,abr:24214.77,mai:24216.43,jun:24098.87,jul:24474.87,ago:22330.45,set:22199.97,out:22199.97,nov:22004.97,dez:22482.31,total:279052.09 },
        { nome:"Desp. Reformas",jan:729.6,fev:1445.66,mar:2291.32,abr:1330.35,mai:758.3,jun:761.19,jul:1132.75,ago:7647.89,set:9090.39,out:2095.05,nov:1178.75,dez:2610.25,total:31071.5 },
        { nome:"Material Consumo",jan:1501.43,fev:1193.91,mar:1415.26,abr:779.87,mai:917.41,jun:701.5,jul:1136.59,ago:1378.61,set:979.24,out:1310.77,nov:713.44,dez:965.96,total:12993.99 },
        { nome:"Comb. Adm",jan:3367.63,fev:3182.14,mar:3067.39,abr:3814.96,mai:2066.76,jun:2865.14,jul:4998.76,ago:2490.97,set:1818.09,out:1769.95,nov:1217.05,dez:1573.72,total:32232.56 },
        { nome:"Desp. Diversas veiculos",jan:156.2,fev:12204.46,mar:14285.28,abr:13563.8,mai:12501.92,jun:13603.89,jul:4092.39,ago:1555.44,set:2110.77,out:1943.4,nov:2310.07,dez:975.7,total:79303.32 },
        { nome:"Desp. estacionamento",jan:306.5,fev:191.0,mar:346.0,abr:372.75,mai:532.7,jun:505.3,jul:512.7,ago:400.1,set:220.75,out:247.06,nov:274.1,dez:322.2,total:4231.16 },
        { nome:"Despesas Tributárias",jan:444.44,fev:248.0,mar:0.0,abr:0.0,mai:0.0,jun:412.16,jul:176.59,ago:250.0,set:0.0,out:137.58,nov:1196.0,dez:0.0,total:2864.77 },
        { nome:"Despesas Judiciais",jan:28283.09,fev:20841.24,mar:248.0,abr:4500.0,mai:4500.0,jun:20564.2,jul:13590.09,ago:5015.49,set:5021.25,out:7026.15,nov:7031.2,dez:6703.66,total:123324.37 },
        { nome:"Treinamentos",jan:225.0,fev:225.0,mar:225.0,abr:225.0,mai:225.0,jun:225.0,jul:724.34,ago:0.0,set:0.0,out:800.0,nov:800.0,dez:0.0,total:3674.34 },
        { nome:"Pró-Labore",jan:204304.32,fev:133196.43,mar:232046.07,abr:120412.85,mai:140231.52,jun:112026.42,jul:208569.48,ago:140398.7,set:91544.32,out:173228.2,nov:182163.35,dez:183540.61,total:1921662.27 },
        { nome:"Sistema",jan:24494.5,fev:23395.33,mar:22861.47,abr:24528.51,mai:22026.96,jun:22227.35,jul:19825.08,ago:21610.53,set:21595.77,out:22527.63,nov:22200.72,dez:19690.71,total:266984.56 },
        { nome:"Taxas Boleto",jan:27579.36,fev:27334.59,mar:22798.16,abr:22331.16,mai:18503.88,jun:17851.56,jul:17430.68,ago:16196.46,set:15914.75,out:14289.52,nov:13952.72,dez:14881.97,total:229064.81 },
        { nome:"Enérgia Elétrica",jan:3042.86,fev:3267.39,mar:3593.78,abr:5774.99,mai:3409.04,jun:2980.34,jul:4879.61,ago:4016.87,set:4011.18,out:4663.71,nov:0.0,dez:7589.17,total:47228.94 },
        { nome:"Despesas Diversas",jan:726.0,fev:1975.87,mar:810.05,abr:97.1,mai:2249.94,jun:760.46,jul:348.93,ago:249.8,set:604.72,out:1209.49,nov:2081.01,dez:1064.34,total:12177.71 },
        { nome:"Despesas Financ.",jan:583.75,fev:662.4,mar:2603.13,abr:902.52,mai:504.4,jun:423.31,jul:439.27,ago:185.78,set:207.38,out:254.6,nov:276.04,dez:586.44,total:7352.98 },
        { nome:"Tarifas Diversas",jan:583.75,fev:662.4,mar:2603.13,abr:902.52,mai:504.4,jun:423.31,jul:439.27,ago:185.78,set:207.38,out:254.6,nov:0.0,dez:586.44,total:7352.98 }
      ],
  ebitda: [
        { nome:"EBITDA",jan:139832.06,fev:319843.74,mar:375228.27,abr:268177.14,mai:664944.42,jun:637561.14,jul:442558.13,ago:720254.07,set:966730.33,out:615266.63,nov:673957.23,dez:818281.58,total:6642910.78 }
      ],
  ebitda_ajustado: [
        { nome:"EBITDA (Ajustado)",jan:139832.06,fev:319843.74,mar:375228.27,abr:268177.14,mai:664944.42,jun:637561.14,jul:442558.13,ago:720254.07,set:966730.33,out:615266.63,nov:673957.23,dez:818281.58,total:6642910.78 }
      ],
  ajustes: [
        { nome:"Investimento",jan:199357.23,fev:188651.81,mar:175818.33,abr:36333.92,mai:56482.66,jun:34980.69,jul:35838.8,ago:30432.59,set:44798.78,out:144507.54,nov:153953.01,dez:115918.83,total:1217074.19 },
        { nome:"Veículos",jan:11034.52,fev:11115.69,mar:11008.36,abr:10953.28,mai:28432.09,jun:10658.54,jul:11204.99,ago:6201.63,set:15357.83,out:47692.74,nov:7916.5,dez:7937.98,total:179514.15 },
        { nome:"Equipamentos/TI",jan:0.0,fev:0.0,mar:7277.58,abr:8284.03,mai:9313.3,jun:6225.72,jul:5562.6,ago:6074.7,set:7600.48,out:2806.13,nov:-599.3,dez:3605.62,total:56150.86 },
        { nome:"Ativos imobilizado",jan:14240.17,fev:25952.06,mar:19188.63,abr:17096.61,mai:18737.27,jun:18096.43,jul:19071.21,ago:18156.26,set:21840.47,out:20789.14,nov:73416.28,dez:19041.95,total:285626.48 },
        { nome:"Aq. de provedor",jan:174082.54,fev:151584.06,mar:138343.76,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:0.0,out:73219.53,nov:73219.53,dez:85333.28,total:695782.7 },
        { nome:"Empr/Finac/Parcel",jan:143161.62,fev:111799.19,mar:118609.52,abr:157703.0,mai:140758.14,jun:151140.2,jul:135322.85,ago:199346.63,set:437194.32,out:652792.87,nov:188145.23,dez:1232852.12,total:3668825.69 },
        { nome:"Empréstimos",jan:69164.85,fev:101763.61,mar:101663.27,abr:91041.46,mai:91033.14,jun:133860.5,jul:91039.94,ago:91039.67,set:91044.23,out:89716.65,nov:85378.15,dez:79153.36,total:1115898.83 },
        { nome:"Reneg. Débitos",jan:17737.46,fev:1100.0,mar:1100.0,abr:0.0,mai:0.0,jun:7793.67,jul:0.0,ago:31174.68,set:0.0,out:0.0,nov:7793.67,dez:0.0,total:66699.48 },
        { nome:"Sócios ou Retiradas",jan:0.0,fev:0.0,mar:0.0,abr:0.0,mai:0.0,jun:0.0,jul:0.0,ago:0.0,set:295490.2,out:520000.0,nov:0.0,dez:1109957.97,total:1925448.17 }
      ],
};