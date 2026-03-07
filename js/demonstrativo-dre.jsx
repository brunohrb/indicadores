import { useState, useMemo, useRef, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Area, AreaChart, ComposedChart } from "recharts";

// ═══════════════════════════════════════════════
//  DADOS FINANCEIROS EMBARCADOS
// ═══════════════════════════════════════════════
const MESES_KEY = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const MESES_N   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const D2023 = {
  receitas: [{nome:"Aluguel/Link",jan:2033310.68,fev:1946593.87,mar:2190804.62,abr:1980281.99,mai:2194970.94,jun:2225343.14,jul:2164586.34,ago:2136402.5,set:2255795.85,out:2292584.56,nov:2214730.61,dez:2377648.2},{nome:"R. Financeiras",jan:5177.45,fev:6770.97,mar:3604.26,abr:4376.62,mai:6833.62,jun:11010.92,jul:15087.3,ago:14194.83,set:23012.78,out:18853.87,nov:21327.34,dez:21472.86},{nome:"V. Ativos",jan:4229.77,fev:12990.0,mar:26855.0,abr:21535.0,mai:26524.01,jun:6930.0,jul:0.0,ago:7602.0,set:8236.85,out:3192.85,nov:4130.0,dez:0.0}],
  impostos: [{nome:"ICMS",jan:74760.07,fev:76280.06,mar:68548.32,abr:72557.74,mai:42481.57,jun:38781.44,jul:34978.09,ago:30516.23,set:30121.5,out:24489.39,nov:33643.18,dez:29585.66},{nome:"ICMS Div.",jan:18994.83,fev:12050.46,mar:10640.61,abr:0,mai:0,jun:0,jul:0,ago:0,set:0,out:0,nov:0,dez:0},{nome:"COFINS",jan:37609.56,fev:38425.81,mar:38500.18,abr:39090.66,mai:29867.32,jun:32606.23,jul:32868.25,ago:33486.15,set:32580.78,out:34466.99,nov:36833.62,dez:35912.93},{nome:"PIS",jan:8148.74,fev:8325.59,mar:8341.71,abr:8469.64,mai:6471.25,jun:7066.32,jul:7121.46,ago:7255.33,set:7059.17,out:7471.76,nov:7986.36,dez:7787.59},{nome:"IRPJ",jan:146484.43,fev:0,mar:0,abr:139918.05,mai:0,jun:0,jul:100569.82,ago:0,set:0,out:104574.02,nov:0,dez:0},{nome:"CSLL",jan:54894.4,fev:0,mar:0,abr:52530.53,mai:0,jun:0,jul:39280.33,ago:0,set:0,out:39806.65,nov:0,dez:0},{nome:"ISS",jan:5924.0,fev:9180.98,mar:6605.68,abr:12884.09,mai:12914.31,jun:20963.11,jul:15493.72,ago:10658.02,set:11253.67,out:10381.21,nov:11840.76,dez:11442.04},{nome:"ISS Div.",jan:7649.96,fev:5290.26,mar:7150.03,abr:9497.02,mai:8966.21,jun:10413.66,jul:12048.24,ago:12324.03,set:11685.9,out:13732.9,nov:11650.69,dez:14437.41},{nome:"FUST/FUNTTEL",jan:4694.2,fev:4773.89,mar:4776.19,abr:4817.58,mai:3055.35,jun:3334.96,jul:3273.34,ago:2892.7,set:2899.0,out:2834.73,nov:3236.34,dez:2967.87}],
  custos: [{nome:"Kit Instalação",jan:142728.52,fev:138468.66,mar:231402.99,abr:233626.89,mai:255093.04,jun:190470.89,jul:157300.29,ago:103432.64,set:49024.45,out:96502.87,nov:86818.38,dez:74163.95},{nome:"Materiais de Rede",jan:100680.33,fev:102955.02,mar:84379.57,abr:80304.66,mai:92004.87,jun:83734.37,jul:65824.91,ago:51676.51,set:102489.23,out:100501.43,nov:61247.6,dez:69682.01},{nome:"Links de Dados",jan:101247.94,fev:105696.02,mar:143859.11,abr:59391.12,mai:98789.0,jun:67081.9,jul:77597.13,ago:86579.12,set:47027.64,out:90692.15,nov:75418.96,dez:100509.01},{nome:"Alugueis/Postes",jan:44667.96,fev:44720.32,mar:49371.52,abr:44720.32,mai:4651.2,jun:103394.24,jul:49371.52,ago:49371.52,set:0,out:98743.04,nov:49371.52,dez:2312.0},{nome:"Comissões",jan:31644.13,fev:33604.98,mar:46356.61,abr:44922.78,mai:38988.53,jun:64249.78,jul:36878.72,ago:44867.73,set:29317.47,out:42954.57,nov:54020.53,dez:45545.97},{nome:"Folha - Direta",jan:480116.48,fev:478962.09,mar:518900.84,abr:441522.52,mai:434194.98,jun:471540.67,jul:473664.07,ago:452481.22,set:490466.21,out:467054.2,nov:559170.44,dez:618395.43},{nome:"Comb. Técnico",jan:27456.82,fev:30610.92,mar:30319.38,abr:28053.96,mai:18843.98,jun:18738.03,jul:32043.73,ago:37635.94,set:30381.5,out:20039.17,nov:26724.97,dez:26138.64},{nome:"Tercerização",jan:599.89,fev:260.0,mar:2700.0,abr:1900.0,mai:14311.31,jun:20654.88,jul:28938.34,ago:22657.36,set:22256.32,out:19995.69,nov:23625.58,dez:16497.65},{nome:"Custos Lastmile",jan:8424.06,fev:9724.7,mar:10161.44,abr:16190.17,mai:20142.2,jun:23535.45,jul:24226.26,ago:29609.14,set:34789.21,out:35891.92,nov:33614.93,dez:33556.17}],
  despesas: [{nome:"Propaganda",jan:53926.27,fev:44695.89,mar:53280.87,abr:40029.12,mai:49856.16,jun:44944.63,jul:45806.83,ago:56919.43,set:32942.51,out:48303.35,nov:60815.32,dez:55598.74},{nome:"Serv. Terceiros",jan:47646.47,fev:51861.95,mar:38267.84,abr:40998.22,mai:36214.24,jun:32306.02,jul:29795.89,ago:29527.95,set:29209.25,out:28525.95,nov:36059.45,dez:41569.59},{nome:"Folha - Adm",jan:77637.31,fev:115144.68,mar:100624.16,abr:90545.97,mai:94748.25,jun:76825.6,jul:87555.6,ago:80275.86,set:123124.0,out:88286.67,nov:83190.3,dez:69854.37},{nome:"Pró-Labore",jan:204304.32,fev:133196.43,mar:232046.07,abr:120412.85,mai:140231.52,jun:112026.42,jul:208569.48,ago:140398.7,set:91544.32,out:173228.2,nov:182163.35,dez:183540.61},{nome:"Sistema",jan:24494.5,fev:23395.33,mar:22861.47,abr:24528.51,mai:22026.96,jun:22227.35,jul:19825.08,ago:21610.53,set:21595.77,out:22527.63,nov:22200.72,dez:19690.71},{nome:"Taxas Boleto",jan:27579.36,fev:27334.59,mar:22798.16,abr:22331.16,mai:18503.88,jun:17851.56,jul:17430.68,ago:16196.46,set:15914.75,out:14289.52,nov:13952.72,dez:14881.97},{nome:"Desp. Aluguel",jan:22718.84,fev:24055.32,mar:24055.32,abr:24214.77,mai:24216.43,jun:24098.87,jul:24474.87,ago:22330.45,set:22199.97,out:22199.97,nov:22004.97,dez:22482.31},{nome:"Desp. Judiciais",jan:28283.09,fev:20841.24,mar:248.0,abr:4500.0,mai:4500.0,jun:20564.2,jul:13590.09,ago:5015.49,set:5021.25,out:7026.15,nov:7031.2,dez:6703.66}],
  ebitda: [{nome:"EBITDA",jan:139832.06,fev:319843.74,mar:375228.27,abr:268177.14,mai:664944.42,jun:637561.14,jul:442558.13,ago:720254.07,set:966730.33,out:615266.63,nov:673957.23,dez:818281.58}],
};

const D2024 = {
  receitas: [{nome:"Link de Internet",jan:2296418.75,fev:2246205.34,mar:2240969.34,abr:2391638.71,mai:2400146.98,jun:2388827.26,jul:2467265.87,ago:2430822.58,set:2450297.05,out:2499580.29,nov:2434265.42,dez:2521573.61},{nome:"Juros/Multa",jan:45838.7,fev:44729.3,mar:43775.38,abr:47612.19,mai:45305.8,jun:41288.12,jul:47039.04,ago:42357.84,set:32561.79,out:31732.0,nov:33249.76,dez:44646.56},{nome:"Eventos",jan:1520.0,fev:0,mar:0,abr:6000.0,mai:2200.0,jun:3550.0,jul:7790.0,ago:4820.0,set:18763.9,out:9204.0,nov:13230.6,dez:19020.4},{nome:"R. Financeiras",jan:9509.51,fev:6744.59,mar:8722.45,abr:8325.75,mai:6376.68,jun:4183.04,jul:7989.34,ago:7384.25,set:8748.23,out:7492.37,nov:812.97,dez:844.05}],
  impostos: [{nome:"ICMS",jan:36455.94,fev:43300.61,mar:35468.81,abr:30515.11,mai:33781.1,jun:0,jul:0,ago:0,set:0,out:5104.58,nov:20458.03,dez:24375.3},{nome:"COFINS",jan:40248.95,fev:40517.31,mar:34986.42,abr:39950.72,mai:37474.52,jun:38382.94,jul:43667.84,ago:45016.21,set:44243.26,out:41140.92,nov:42197.73,dez:44550.12},{nome:"PIS",jan:8729.25,fev:8780.09,mar:7580.81,abr:8656.06,mai:8119.83,jun:8316.91,jul:9450.6,ago:9738.69,set:9569.16,out:8913.87,nov:9142.88,dez:9652.57},{nome:"IRPJ",jan:104957.27,fev:0,mar:0,abr:112700.97,mai:0,jun:0,jul:36538.71,ago:36904.09,set:37221.99,out:112018.4,nov:0,dez:0},{nome:"CSLL",jan:39944.61,fev:0,mar:0,abr:42732.35,mai:0,jun:0,jul:13891.97,ago:14030.51,set:14151.38,out:42721.0,nov:0,dez:0},{nome:"ISS",jan:12348.32,fev:13850.41,mar:12066.06,abr:12214.08,mai:12711.35,jun:10563.75,jul:11955.4,ago:16266.26,set:16607.98,out:13984.31,nov:13389.3,dez:14461.47},{nome:"ISS Div.",jan:16089.72,fev:12544.2,mar:13925.57,abr:13050.59,mai:13651.15,jun:13377.37,jul:13977.68,ago:19271.39,set:19377.31,out:16841.93,nov:17250.14,dez:19416.1},{nome:"FUST/FUNTTEL",jan:3330.64,fev:3343.99,mar:3454.99,abr:3261.01,mai:3279.93,jun:3290.94,jul:3243.79,ago:3257.53,set:3406.45,out:3682.24,nov:4784.77,dez:5040.55}],
  custos: [{nome:"Kit Instalação",jan:131105.34,fev:151790.59,mar:128013.53,abr:193758.13,mai:191730.26,jun:153199.62,jul:194324.23,ago:243236.35,set:203855.13,out:186381.55,nov:147165.32,dez:125678.94},{nome:"Materiais de Rede",jan:61156.71,fev:51499.21,mar:47779.84,abr:52466.74,mai:43319.5,jun:52769.3,jul:42625.73,ago:57442.08,set:65333.4,out:71366.99,nov:66772.94,dez:59494.94},{nome:"Links de Dados / Voip",jan:80539.67,fev:84823.52,mar:24320.01,abr:92199.5,mai:95225.0,jun:59801.29,jul:57535.87,ago:60294.36,set:60972.34,out:61091.52,nov:52533.96,dez:56930.69},{nome:"Vtal",jan:0,fev:26804.91,mar:47958.2,abr:51962.86,mai:55102.73,jun:56403.65,jul:54974.71,ago:52642.08,set:53177.09,out:52296.52,nov:54787.32,dez:55611.65},{nome:"Comissões",jan:48221.17,fev:51826.44,mar:33569.41,abr:26823.63,mai:36510.72,jun:41343.32,jul:33369.87,ago:56702.27,set:61152.13,out:52925.24,nov:35028.03,dez:44534.34},{nome:"Folha - Direta",jan:536742.69,fev:683041.05,mar:558657.28,abr:595850.56,mai:590829.95,jun:634516.91,jul:621824.36,ago:654484.24,set:624825.96,out:634353.97,nov:712332.85,dez:813838.36},{nome:"Comb. Técnico",jan:28249.4,fev:21447.05,mar:31047.17,abr:31967.72,mai:22494.94,jun:24221.26,jul:37720.24,ago:37755.89,set:24965.4,out:29821.02,nov:24100.22,dez:30515.31},{nome:"Custos Lastmile",jan:35416.1,fev:37449.61,mar:26715.09,abr:33815.58,mai:31373.83,jun:28404.22,jul:37159.36,ago:34320.66,set:32992.96,out:29827.85,nov:26184.92,dez:37278.74},{nome:"Investimento/POP",jan:1382.75,fev:19044.93,mar:15022.86,abr:15980.46,mai:15686.1,jun:25440.83,jul:24181.03,ago:21301.61,set:45090.43,out:36092.96,nov:37998.4,dez:34692.02}],
  despesas: [{nome:"Propaganda",jan:45324.4,fev:55346.48,mar:50289.55,abr:55935.47,mai:45191.03,jun:53430.57,jul:71189.37,ago:59904.16,set:43074.94,out:50968.31,nov:44242.05,dez:53218.58},{nome:"Serv. Terceiros",jan:32197.2,fev:38797.27,mar:36462.56,abr:35394.07,mai:30983.1,jun:50318.82,jul:32969.02,ago:29789.1,set:27225.66,out:30642.25,nov:33190.59,dez:40422.25},{nome:"Pró-Labore",jan:199175.51,fev:201983.51,mar:202516.06,abr:204212.09,mai:198625.39,jun:199255.1,jul:200810.66,ago:201005.09,set:200328.43,out:200000.0,nov:200000.0,dez:200000.0},{nome:"Sistema",jan:21341.51,fev:24665.99,mar:25478.35,abr:26264.03,mai:20602.87,jun:20898.18,jul:22190.05,ago:24079.28,set:19468.59,out:19362.87,nov:20033.45,dez:18934.0},{nome:"Taxas Boleto",jan:14275.38,fev:14384.98,mar:14786.53,abr:17288.08,mai:15823.48,jun:13974.91,jul:14624.91,ago:13209.5,set:13144.53,out:14088.34,nov:13153.12,dez:13158.13},{nome:"Desp. Aluguel",jan:20550.93,fev:25595.5,mar:24349.61,abr:25018.14,mai:24363.82,jun:24763.82,jul:25371.68,ago:25371.68,set:26577.93,out:26826.39,nov:26851.39,dez:27095.39},{nome:"Desp. Judiciais",jan:5040.34,fev:0,mar:677.03,abr:25594.88,mai:12932.88,jun:895.6,jul:900.32,ago:3106.47,set:573.51,out:0,nov:1673.08,dez:0}],
  ebitda: [{nome:"EBITDA",jan:735752.08,fev:561425.02,mar:816552.49,abr:579184.69,mai:800067.95,jun:808309.19,jul:801275.41,ago:671463.13,set:748272.03,out:692010.5,nov:774757.4,dez:752916.78}],
};

const D2025 = {
  receitas: [{nome:"Link Pessoa Física",jan:1363399.16,fev:1367967.95,mar:1418508.41,abr:1390498.57,mai:1430991.92,jun:1413512.4,jul:1466625.21,ago:1418820.85,set:1455501.47,out:1457362.84,nov:1413065.73,dez:1510923.43},{nome:"Link Pessoa Jurídica",jan:1107509.73,fev:1111562.08,mar:1082138.31,abr:1097961.87,mai:1116194.38,jun:1121342.48,jul:1141569.18,ago:1127690.44,set:1168813.56,out:1162242.0,nov:1140248.57,dez:1200934.81},{nome:"Juros/Multa",jan:46455.66,fev:43118.57,mar:48273.02,abr:47701.9,mai:53235.77,jun:49520.08,jul:48019.0,ago:51576.45,set:54044.9,out:55880.89,nov:55082.99,dez:58569.49},{nome:"Taxa de instalação",jan:18611.23,fev:16540.68,mar:604.16,abr:6812.2,mai:2454.0,jun:2571.66,jul:3900.0,ago:4606.34,set:5797.89,out:2522.38,nov:2136.15,dez:1358.1},{nome:"Eventos",jan:5515.0,fev:4750.0,mar:3567.0,abr:6364.2,mai:12812.2,jun:15415.0,jul:7570.0,ago:14750.0,set:10677.8,out:17100.0,nov:23643.44,dez:3750.0},{nome:"Rendimentos financeiros",jan:4015.77,fev:490.05,mar:2429.12,abr:3601.85,mai:3428.85,jun:3292.8,jul:4061.8,ago:2246.13,set:2503.13,out:3119.32,nov:1429.28,dez:1247.07}],
  impostos: [{nome:"ICMS",jan:30597.6,fev:34726.14,mar:38336.96,abr:34174.7,mai:37871.45,jun:37074.49,jul:25594.9,ago:62012.2,set:61168.11,out:70567.87,nov:74433.94,dez:79760.87},{nome:"COFINS",jan:46634.52,fev:43957.41,mar:39340.17,abr:39463.09,mai:39771.8,jun:40321.67,jul:40931.46,ago:35228.16,set:35286.4,out:39361.52,nov:43803.62,dez:46406.86},{nome:"PIS",jan:10104.19,fev:9524.16,mar:8523.76,abr:8543.69,mai:8615.59,jun:8698.4,jul:8859.9,ago:7623.38,set:7633.73,out:8518.02,nov:8415.05,dez:10034.41},{nome:"IRPJ",jan:103897.71,fev:0,mar:0,abr:99206.19,mai:0,jun:0,jul:96821.55,ago:0,set:0,out:89161.15,nov:0,dez:0},{nome:"CSLL",jan:39564.49,fev:0,mar:0,abr:37875.92,mai:0,jun:0,jul:37017.52,ago:0,set:0,out:34258.01,nov:0,dez:0},{nome:"ISS",jan:18254.95,fev:16458.99,mar:10223.78,abr:10345.86,mai:10294.69,jun:9618.5,jul:10295.88,ago:10295.18,set:7796.86,out:6595.62,nov:8769.05,dez:6702.33},{nome:"ISS Retido",jan:18971.32,fev:16757.53,mar:14251.95,abr:14218.51,mai:14047.6,jun:14886.84,jul:12708.36,ago:1764.23,set:2189.75,out:1629.33,nov:0,dez:1791.96},{nome:"FUST/FUNTTEL",jan:5485.12,fev:5593.1,mar:5782.24,abr:5593.15,mai:5829.49,jun:5810.05,jul:6349.68,ago:6758.96,set:7321.15,out:9070.8,nov:10037.3,dez:13262.5}],
  custos: [{nome:"Kit Instalação",jan:260689.26,fev:261971.69,mar:229352.38,abr:191538.93,mai:194621.58,jun:174329.82,jul:46599.08,ago:91329.61,set:95091.81,out:145298.6,nov:177552.88,dez:186721.54},{nome:"Materiais de Rede",jan:80070.44,fev:75688.68,mar:51552.31,abr:46816.63,mai:44844.9,jun:43536.07,jul:75324.87,ago:57887.22,set:44451.61,out:44260.3,nov:43230.57,dez:50269.82},{nome:"Links de Dados / Voip",jan:59397.16,fev:67442.76,mar:44781.95,abr:58651.37,mai:50353.87,jun:42924.0,jul:64260.58,ago:59004.83,set:67519.9,out:54092.81,nov:54207.57,dez:57993.04},{nome:"Vtal",jan:53187.19,fev:55129.82,mar:59791.89,abr:60174.32,mai:59708.46,jun:63167.29,jul:61909.34,ago:58057.25,set:61713.74,out:62083.24,nov:63968.44,dez:62320.71},{nome:"Comissões de vendas",jan:26857.73,fev:36100.59,mar:21581.04,abr:22696.7,mai:39158.8,jun:40844.88,jul:29618.21,ago:33704.96,set:40727.97,out:35862.08,nov:36114.07,dez:32095.3},{nome:"Folha - Direta",jan:676621.22,fev:623295.17,mar:638485.38,abr:622564.54,mai:664955.52,jun:697697.14,jul:708888.5,ago:649727.33,set:689457.84,out:718786.99,nov:781146.5,dez:938629.63},{nome:"Comb. Técnico",jan:33115.04,fev:26065.99,mar:15188.51,abr:29337.96,mai:33559.17,jun:17862.89,jul:31492.89,ago:34102.45,set:35197.72,out:33381.95,nov:32416.3,dez:31734.54},{nome:"Custos Lastmile",jan:31619.06,fev:31827.15,mar:21296.57,abr:41642.14,mai:31689.2,jun:32259.55,jul:32906.77,ago:35443.08,set:24952.79,out:32166.61,nov:33319.1,dez:34306.46},{nome:"Alugueis de Torre e POP",jan:14642.08,fev:13133.7,mar:11642.08,abr:11642.08,mai:11079.97,jun:13364.19,jul:12776.07,ago:11879.56,set:13317.29,out:12648.42,nov:12680.49,dez:12680.49}],
  despesas: [{nome:"Marketing",jan:66923.63,fev:52361.86,mar:55473.48,abr:65219.61,mai:53889.69,jun:51542.29,jul:73614.74,ago:72961.4,set:73911.24,out:57010.18,nov:57009.85,dez:50561.57},{nome:"Serv. Terceiros",jan:38008.8,fev:35034.7,mar:35867.88,abr:34626.81,mai:35129.78,jun:33643.95,jul:37172.74,ago:34259.48,set:36156.15,out:41137.01,nov:44025.03,dez:41060.93},{nome:"Pró-Labore",jan:200000.0,fev:200000.0,mar:200000.0,abr:200000.0,mai:200000.0,jun:200000.0,jul:200000.0,ago:200000.0,set:200000.0,out:200000.0,nov:200000.0,dez:200000.0},{nome:"Sistema",jan:20725.95,fev:22178.08,mar:19484.08,abr:25387.25,mai:19675.56,jun:18822.71,jul:19638.93,ago:18339.07,set:20914.5,out:21952.61,nov:19279.3,dez:19421.76},{nome:"Taxas Boleto",jan:13838.59,fev:13791.34,mar:13971.72,abr:13970.5,mai:13529.28,jun:12332.11,jul:12950.62,ago:10742.81,set:10486.11,out:10018.77,nov:9532.08,dez:10118.24},{nome:"Desp. Aluguel",jan:25415.85,fev:27515.39,mar:26905.43,abr:26905.43,mai:26834.6,jun:27331.98,jul:27137.58,ago:27108.58,set:27456.85,out:27372.97,nov:27372.97,dez:27372.97},{nome:"Desp. Judiciais",jan:0,fev:1760.0,mar:1375.0,abr:1375.0,mai:2624.2,jun:1375.0,jul:1556.0,ago:2123.02,set:2000.0,out:1250.0,nov:2094.54,dez:4314.55},{nome:"Energia Elétrica",jan:11977.98,fev:0,mar:2494.79,abr:10781.14,mai:0,jun:10790.23,jul:8975.51,ago:6021.04,set:0,out:3461.16,nov:2224.58,dez:2210.85}],
  ebitda: [{nome:"EBITDA",jan:592658.96,fev:776701.52,mar:863193.81,abr:739347.81,mai:912228.79,jun:890854.78,jul:872592.82,ago:978633.55,set:1019871.73,out:829192.29,nov:797971.84,dez:772651.1}],
};

const DADOS_POR_ANO = { '2023': D2023, '2024': D2024, '2025': D2025 };

// ═══════════════════════════════════════════════
//  UTILITÁRIOS
// ═══════════════════════════════════════════════
const fc = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1000000) return (v < 0 ? '-' : '') + 'R$ ' + (abs/1000000).toFixed(2).replace('.',',') + 'M';
  if (abs >= 1000) return (v < 0 ? '-' : '') + 'R$ ' + (abs/1000).toFixed(1).replace('.',',') + 'k';
  return 'R$ ' + v.toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2});
};
const fcFull = (v) => (v < 0 ? '-' : '') + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2});
const fp = (v) => (v*100).toFixed(1).replace('.',',') + '%';

const sumMes = (arr, m) => arr.reduce((s,r)=>s+(r[m]||0), 0);
const sumAll = (arr) => MESES_KEY.reduce((s,m)=>s+sumMes(arr,m), 0);

function calcDRE(data, mes) {
  const k = mes === 'total' ? null : mes;
  const get = (arr) => k ? sumMes(arr, k) : sumAll(arr);
  const receita = get(data.receitas);
  const impostos = get(data.impostos);
  const recLiq = receita - impostos;
  const custos = get(data.custos);
  const lucBruto = recLiq - custos;
  const despesas = get(data.despesas);
  const ebitda = lucBruto - despesas;
  return { receita, impostos, recLiq, custos, lucBruto, despesas, ebitda,
    margBruta: receita > 0 ? lucBruto/receita : 0,
    margEbitda: receita > 0 ? ebitda/receita : 0,
    cargaTrib: receita > 0 ? impostos/receita : 0,
  };
}

// ═══════════════════════════════════════════════
//  COMPONENTES VISUAIS
// ═══════════════════════════════════════════════
function AnimNum({ value, prefix='', suffix='', decimals=1 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 900;
    const step = (timestamp) => {
      if (!ref.current) { start = timestamp; }
      ref.current = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(ease * end);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame((ts) => { start = ts; step(ts); });
  }, [value]);
  const n = Math.abs(display);
  let str;
  if (n >= 1000000) str = (display < 0 ? '-' : '') + (n/1000000).toFixed(decimals).replace('.',',') + 'M';
  else if (n >= 1000) str = (display < 0 ? '-' : '') + (n/1000).toFixed(decimals).replace('.',',') + 'k';
  else str = display.toFixed(decimals).replace('.',',');
  return <span>{prefix}{str}{suffix}</span>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'10px 14px',fontSize:12}}>
      <div style={{color:'#94a3b8',marginBottom:6,fontWeight:700}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{color:p.color,display:'flex',justifyContent:'space-between',gap:16}}>
          <span>{p.name}</span><span style={{fontWeight:700}}>{fc(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════
export default function Demonstrativo() {
  const [ano, setAno] = useState('2025');
  const [mes, setMes] = useState('total');
  const [viewMode, setViewMode] = useState('dre'); // 'dre' | 'evolucao' | 'comparativo'
  const [expandidos, setExpandidos] = useState({});

  const data = DADOS_POR_ANO[ano];
  const dre = useMemo(() => calcDRE(data, mes), [data, mes]);

  // Dados mensais para gráfico
  const evolucao = useMemo(() => MESES_KEY.map((m, i) => {
    const d = calcDRE(data, m);
    return { mes: MESES_N[i], receita: d.receita, ebitda: d.ebitda, margem: d.margEbitda * 100, impostos: d.impostos, custos: d.custos, despesas: d.despesas };
  }), [data]);

  // Comparativo 3 anos
  const comparativo3anos = useMemo(() => MESES_KEY.map((m, i) => ({
    mes: MESES_N[i],
    '2023': calcDRE(D2023, m).ebitda,
    '2024': calcDRE(D2024, m).ebitda,
    '2025': calcDRE(D2025, m).ebitda,
  })), []);

  const toggle = (k) => setExpandidos(e => ({...e, [k]: !e[k]}));

  const dreLines = [
    { id:'receita', label:'Receita Bruta', valor: dre.receita, pct: 1, tipo:'receita', sub: data.receitas },
    { id:'impostos', label:'(-) Impostos e Deduções', valor: -dre.impostos, pct: dre.cargaTrib, tipo:'dedução', sub: data.impostos },
    { id:'recLiq', label:'= Receita Líquida', valor: dre.recLiq, pct: dre.recLiq/dre.receita, tipo:'subtotal' },
    { id:'custos', label:'(-) Custos Operacionais', valor: -dre.custos, pct: dre.custos/dre.receita, tipo:'dedução', sub: data.custos },
    { id:'lucBruto', label:'= Lucro Bruto', valor: dre.lucBruto, pct: dre.margBruta, tipo:'subtotal' },
    { id:'despesas', label:'(-) Despesas Operacionais', valor: -dre.despesas, pct: dre.despesas/dre.receita, tipo:'dedução', sub: data.despesas },
    { id:'ebitda', label:'= EBITDA', valor: dre.ebitda, pct: dre.margEbitda, tipo:'resultado' },
  ];

  const colStyle = {
    receita: { color:'#22d3ee', bg:'rgba(34,211,238,0.08)', border:'rgba(34,211,238,0.3)' },
    dedução: { color:'#f87171', bg:'rgba(248,113,113,0.06)', border:'rgba(248,113,113,0.2)' },
    subtotal: { color:'#94a3b8', bg:'rgba(148,163,184,0.05)', border:'rgba(148,163,184,0.15)' },
    resultado: { color:'#4ade80', bg:'rgba(74,222,128,0.1)', border:'rgba(74,222,128,0.35)' },
  };

  const mesLabel = mes === 'total' ? 'Acumulado Anual' : MESES_N[MESES_KEY.indexOf(mes)] + '/' + ano;

  return (
    <div style={{background:'#060b17',minHeight:'100vh',fontFamily:"'DM Mono', 'Fira Code', 'Consolas', monospace",color:'#e2e8f0',overflow:'hidden'}}>
      
      {/* HEADER */}
      <div style={{background:'linear-gradient(135deg,#0f172a 0%,#0c1a30 100%)',borderBottom:'1px solid #1e3a5f',padding:'1.25rem 2rem',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
              <div style={{width:3,height:28,background:'linear-gradient(180deg,#22d3ee,#4ade80)',borderRadius:2}}/>
              <div>
                <div style={{fontSize:'1.2rem',fontWeight:700,letterSpacing:'0.04em',color:'#f1f5f9'}}>
                  📉 DEMONSTRATIVO DE RESULTADO
                </div>
                <div style={{fontSize:'0.72rem',color:'#64748b',letterSpacing:'0.08em',textTransform:'uppercase',marginTop:2}}>
                  DRE — {mesLabel}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center',flexWrap:'wrap'}}>
            {/* Ano */}
            {['2023','2024','2025'].map(a => (
              <button key={a} onClick={()=>setAno(a)} style={{
                padding:'0.4rem 0.9rem',borderRadius:6,border:'1px solid',cursor:'pointer',
                fontSize:'0.78rem',fontWeight:700,fontFamily:'inherit',letterSpacing:'0.06em',transition:'all 0.2s',
                background: ano===a ? '#1d4ed8' : 'transparent',
                borderColor: ano===a ? '#3b82f6' : '#1e3a5f',
                color: ano===a ? '#fff' : '#64748b'
              }}>{a}</button>
            ))}
            <div style={{width:1,height:20,background:'#1e3a5f'}}/>
            {/* Mês */}
            <select value={mes} onChange={e=>setMes(e.target.value)} style={{
              background:'#0f172a',border:'1px solid #1e3a5f',color:'#94a3b8',
              borderRadius:6,padding:'0.4rem 0.75rem',fontSize:'0.78rem',fontFamily:'inherit',cursor:'pointer'
            }}>
              <option value="total">Acumulado</option>
              {MESES_KEY.map((m,i)=><option key={m} value={m}>{MESES_N[i]}</option>)}
            </select>
            <div style={{width:1,height:20,background:'#1e3a5f'}}/>
            {/* View */}
            {[{k:'dre',l:'DRE'},{k:'evolucao',l:'Evolução'},{k:'comparativo',l:'3 Anos'}].map(v=>(
              <button key={v.k} onClick={()=>setViewMode(v.k)} style={{
                padding:'0.4rem 0.9rem',borderRadius:6,border:'1px solid',cursor:'pointer',
                fontSize:'0.78rem',fontWeight:600,fontFamily:'inherit',transition:'all 0.2s',
                background: viewMode===v.k ? 'rgba(74,222,128,0.12)' : 'transparent',
                borderColor: viewMode===v.k ? '#4ade80' : '#1e3a5f',
                color: viewMode===v.k ? '#4ade80' : '#475569'
              }}>{v.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{padding:'1.5rem 2rem',maxWidth:1600,margin:'0 auto'}}>
        
        {/* KPI STRIP */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
          {[
            { l:'Receita Bruta', v: dre.receita, color:'#22d3ee', icon:'💰', sub: `100%` },
            { l:'Impostos', v: dre.impostos, color:'#f87171', icon:'🏛️', sub: fp(dre.cargaTrib)+' da receita' },
            { l:'Custos Operac.', v: dre.custos, color:'#fb923c', icon:'⚙️', sub: fp(dre.custos/dre.receita)+' da receita' },
            { l:'Despesas Operac.', v: dre.despesas, color:'#a78bfa', icon:'📋', sub: fp(dre.despesas/dre.receita)+' da receita' },
            { l:'EBITDA', v: dre.ebitda, color:'#4ade80', icon:'📈', sub: 'Margem: '+fp(dre.margEbitda), highlight: true },
          ].map((kpi,i) => (
            <div key={i} style={{
              background: kpi.highlight ? 'linear-gradient(135deg,rgba(74,222,128,0.08),rgba(16,185,129,0.04))' : '#0f172a',
              border:`1px solid ${kpi.color}30`,
              borderTop:`2px solid ${kpi.color}`,
              borderRadius:10,padding:'1rem 1.25rem',
              boxShadow: kpi.highlight ? `0 0 20px ${kpi.color}15` : 'none',
              transition:'all 0.2s',cursor:'default',
            }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.5rem'}}>
                <span style={{fontSize:'0.7rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em'}}>{kpi.l}</span>
                <span style={{fontSize:'1.1rem'}}>{kpi.icon}</span>
              </div>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:kpi.color,marginBottom:'0.25rem'}}>
                <AnimNum value={kpi.v} prefix="R$ " suffix="" decimals={2}/>
              </div>
              <div style={{fontSize:'0.7rem',color:'#475569'}}>{kpi.sub}</div>
              {/* Barra proporcional */}
              <div style={{height:3,background:'#1e293b',borderRadius:2,marginTop:'0.75rem'}}>
                <div style={{
                  height:'100%',borderRadius:2,background:kpi.color,
                  width: dre.receita > 0 ? Math.min(100, (kpi.v/dre.receita)*100)+'%' : '0%',
                  transition:'width 0.8s ease',opacity:0.7
                }}/>
              </div>
            </div>
          ))}
        </div>

        {/* ─── VIEW: DRE ─── */}
        {viewMode === 'dre' && (
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.5rem',alignItems:'start'}}>
            
            {/* TABELA DRE */}
            <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid #1e293b',background:'#0f1f3a'}}>
                <span style={{fontSize:'0.8rem',fontWeight:700,color:'#94a3b8',letterSpacing:'0.1em',textTransform:'uppercase'}}>
                  Demonstração de Resultado — {mesLabel}
                </span>
              </div>
              
              {dreLines.map((linha, idx) => {
                const cs = colStyle[linha.tipo];
                const hasSub = !!linha.sub;
                const isOpen = expandidos[linha.id];
                const pctBar = Math.min(100, Math.abs(linha.pct)*100);
                const subItems = hasSub ? linha.sub.map(s => ({
                  nome: s.nome,
                  val: mes === 'total' ? MESES_KEY.reduce((a,m)=>a+(s[m]||0),0) : (s[mes]||0)
                })).filter(s=>s.val!==0).sort((a,b)=>Math.abs(b.val)-Math.abs(a.val)) : [];

                return (
                  <div key={linha.id}>
                    <div
                      onClick={() => hasSub && toggle(linha.id)}
                      style={{
                        padding:'0.9rem 1.5rem',
                        background: cs.bg,
                        borderLeft:`3px solid ${cs.border}`,
                        borderBottom:`1px solid #0f172a`,
                        cursor: hasSub ? 'pointer' : 'default',
                        transition:'background 0.15s',
                        display:'flex',alignItems:'center',gap:'0.75rem',
                      }}
                    >
                      {hasSub && (
                        <span style={{
                          color:'#475569',fontSize:'0.65rem',width:12,
                          transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                          transition:'transform 0.2s',display:'inline-block'
                        }}>▶</span>
                      )}
                      {!hasSub && <span style={{width:12}}/>}
                      
                      <div style={{flex:1}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom: linha.tipo!=='subtotal' && linha.tipo!=='resultado' ? 4 : 0}}>
                          <span style={{
                            fontSize: linha.tipo==='resultado' ? '0.9rem' : '0.82rem',
                            fontWeight: ['subtotal','resultado'].includes(linha.tipo) ? 700 : 500,
                            color: cs.color,
                            letterSpacing:'0.02em',
                          }}>{linha.label}</span>
                          <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
                            <span style={{fontSize:'0.72rem',color:'#475569'}}>
                              {fp(Math.abs(linha.pct))}
                            </span>
                            <span style={{
                              fontSize: linha.tipo==='resultado' ? '1rem' : '0.88rem',
                              fontWeight:700,color:cs.color,minWidth:120,textAlign:'right'
                            }}>{fcFull(linha.valor)}</span>
                          </div>
                        </div>
                        {linha.tipo !== 'subtotal' && linha.tipo !== 'resultado' && (
                          <div style={{height:2,background:'#0f172a',borderRadius:1,marginTop:2}}>
                            <div style={{height:'100%',borderRadius:1,background:cs.color,width:pctBar+'%',transition:'width 0.8s ease',opacity:0.5}}/>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Sub-itens expandíveis */}
                    {hasSub && isOpen && subItems.map((s,j) => (
                      <div key={j} style={{
                        padding:'0.55rem 1.5rem 0.55rem 3.5rem',
                        borderBottom:'1px solid #0a1020',
                        display:'flex',justifyContent:'space-between',alignItems:'center',
                        background:'#050d1a',
                      }}>
                        <span style={{fontSize:'0.75rem',color:'#64748b'}}>{s.nome}</span>
                        <span style={{fontSize:'0.75rem',color:'#94a3b8',fontWeight:500}}>
                          {fcFull(Math.abs(s.val))}
                          <span style={{color:'#334155',marginLeft:8,fontSize:'0.68rem'}}>
                            {dre.receita > 0 ? fp(Math.abs(s.val)/dre.receita) : '—'}
                          </span>
                        </span>
                      </div>
                    ))}
                    
                    {/* Linha de resultado com destaque */}
                    {linha.tipo === 'resultado' && (
                      <div style={{padding:'0.6rem 1.5rem',background:'rgba(74,222,128,0.04)',borderTop:'1px solid rgba(74,222,128,0.2)'}}>
                        <div style={{display:'flex',justifyContent:'space-around',fontSize:'0.72rem',color:'#64748b'}}>
                          <span>Margem Líquida: <b style={{color:'#4ade80'}}>{fp(dre.margEbitda)}</b></span>
                          <span>Margem Bruta: <b style={{color:'#22d3ee'}}>{fp(dre.margBruta)}</b></span>
                          <span>Carga Tributária: <b style={{color:'#f87171'}}>{fp(dre.cargaTrib)}</b></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* WATERFALL lateral */}
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              
              {/* Mini waterfall */}
              <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,padding:'1.25rem'}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'1rem'}}>
                  🌊 Cascata do Resultado
                </div>
                {[
                  {l:'Receita', v:dre.receita, max:dre.receita, c:'#22d3ee'},
                  {l:'(-) Impostos', v:dre.impostos, max:dre.receita, c:'#f87171'},
                  {l:'Rec. Líquida', v:dre.recLiq, max:dre.receita, c:'#60a5fa'},
                  {l:'(-) Custos', v:dre.custos, max:dre.receita, c:'#fb923c'},
                  {l:'Lucro Bruto', v:dre.lucBruto, max:dre.receita, c:'#818cf8'},
                  {l:'(-) Despesas', v:dre.despesas, max:dre.receita, c:'#a78bfa'},
                  {l:'EBITDA', v:dre.ebitda, max:dre.receita, c:'#4ade80', bold:true},
                ].map((w,i) => (
                  <div key={i} style={{marginBottom:'0.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:'0.7rem',color: w.bold ? w.c : '#64748b',fontWeight: w.bold ? 700 : 400}}>{w.l}</span>
                      <span style={{fontSize:'0.7rem',color:w.c,fontWeight:700}}>{fc(w.v)}</span>
                    </div>
                    <div style={{height: w.bold ? 6 : 4,background:'#0f172a',borderRadius:3}}>
                      <div style={{
                        height:'100%',borderRadius:3,
                        background: w.bold ? `linear-gradient(90deg,${w.c},${w.c}88)` : w.c,
                        width: w.max > 0 ? Math.min(100,(w.v/w.max)*100)+'%' : '0%',
                        transition:'width 0.9s ease',
                        boxShadow: w.bold ? `0 0 8px ${w.c}60` : 'none'
                      }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gauge margem EBITDA */}
              <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,padding:'1.25rem',textAlign:'center'}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'1rem'}}>
                  🎯 Margem EBITDA
                </div>
                <div style={{position:'relative',display:'inline-block',width:160,height:85}}>
                  <svg width="160" height="90" viewBox="0 0 160 90">
                    <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round"/>
                    <path d="M 15 80 A 65 65 0 0 1 145 80" fill="none" stroke="url(#grad)" strokeWidth="14" strokeLinecap="round"
                      strokeDasharray={`${Math.min(dre.margEbitda*100, 100) * 2.04} 1000`}/>
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f87171"/>
                        <stop offset="40%" stopColor="#fbbf24"/>
                        <stop offset="70%" stopColor="#4ade80"/>
                        <stop offset="100%" stopColor="#22d3ee"/>
                      </linearGradient>
                    </defs>
                    <text x="80" y="72" textAnchor="middle" fontSize="20" fontWeight="700" fill="#4ade80" fontFamily="monospace">
                      {fp(dre.margEbitda)}
                    </text>
                  </svg>
                </div>
                <div style={{fontSize:'0.68rem',color:'#475569',marginTop:'-0.5rem'}}>
                  Benchmark ISP: <span style={{color:'#fbbf24'}}>25–35%</span>
                </div>
                <div style={{
                  marginTop:'0.75rem',padding:'0.4rem 0.75rem',borderRadius:6,
                  background: dre.margEbitda >= 0.25 ? 'rgba(74,222,128,0.1)' : dre.margEbitda >= 0.15 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
                  border: `1px solid ${dre.margEbitda >= 0.25 ? '#4ade80' : dre.margEbitda >= 0.15 ? '#fbbf24' : '#f87171'}40`,
                  fontSize:'0.72rem',fontWeight:700,
                  color: dre.margEbitda >= 0.25 ? '#4ade80' : dre.margEbitda >= 0.15 ? '#fbbf24' : '#f87171',
                }}>
                  {dre.margEbitda >= 0.35 ? '✅ Excelente' : dre.margEbitda >= 0.25 ? '✅ Dentro da meta' : dre.margEbitda >= 0.15 ? '⚠️ Atenção' : '🔴 Abaixo do benchmark'}
                </div>
              </div>

              {/* Distribuição de custos */}
              <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,padding:'1.25rem'}}>
                <div style={{fontSize:'0.72rem',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'1rem'}}>
                  📊 Composição das Saídas
                </div>
                {[
                  {l:'Folha de Pagamento', v: [...data.custos,...data.despesas].filter(r=>r.nome.includes('Folha')||r.nome.includes('Pró-Labore')).reduce((s,r)=>s+(mes==='total'?MESES_KEY.reduce((a,m)=>a+(r[m]||0),0):(r[mes]||0)),0), c:'#f87171'},
                  {l:'Impostos s/ Receita', v: dre.impostos, c:'#fbbf24'},
                  {l:'Infraestrutura', v: [...data.custos].filter(r=>r.nome.includes('Kit')||r.nome.includes('Mater')||r.nome.includes('Link')||r.nome.includes('Vtal')||r.nome.includes('Postes')).reduce((s,r)=>s+(mes==='total'?MESES_KEY.reduce((a,m)=>a+(r[m]||0),0):(r[mes]||0)),0), c:'#22d3ee'},
                  {l:'Marketing e Comercial', v: [...data.custos,...data.despesas].filter(r=>r.nome.includes('Comiss')||r.nome.includes('Propag')||r.nome.includes('Market')).reduce((s,r)=>s+(mes==='total'?MESES_KEY.reduce((a,m)=>a+(r[m]||0),0):(r[mes]||0)),0), c:'#818cf8'},
                  {l:'Outros Custos+Desp', v: dre.custos+dre.despesas, c:'#475569' },
                ].map((item,i,arr) => {
                  const total = dre.receita;
                  return (
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.5rem'}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:item.c,flexShrink:0}}/>
                      <span style={{fontSize:'0.68rem',color:'#64748b',flex:1}}>{item.l}</span>
                      <span style={{fontSize:'0.7rem',color:item.c,fontWeight:700,minWidth:45,textAlign:'right'}}>
                        {total > 0 ? fp(item.v/total) : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW: EVOLUÇÃO ─── */}
        {viewMode === 'evolucao' && (
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            
            {/* Gráfico principal */}
            <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,padding:'1.5rem'}}>
              <div style={{marginBottom:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:'0.85rem',fontWeight:700,color:'#f1f5f9'}}>Evolução Mensal {ano}</div>
                  <div style={{fontSize:'0.72rem',color:'#64748b',marginTop:2}}>Receita vs Custos vs EBITDA</div>
                </div>
              </div>
              <div style={{height:300}}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={evolucao} margin={{top:5,right:10,bottom:0,left:10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="mes" tick={{fill:'#475569',fontSize:11}} axisLine={{stroke:'#1e293b'}} tickLine={false}/>
                    <YAxis tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>'R$'+Math.round(v/1000)+'k'}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="receita" name="Receita" fill="rgba(34,211,238,0.25)" radius={[3,3,0,0]}/>
                    <Bar dataKey="custos" name="Custos" stackId="s" fill="rgba(251,146,60,0.5)" radius={[0,0,0,0]}/>
                    <Bar dataKey="despesas" name="Despesas" stackId="s" fill="rgba(167,139,250,0.5)" radius={[3,3,0,0]}/>
                    <Line type="monotone" dataKey="ebitda" name="EBITDA" stroke="#4ade80" strokeWidth={2.5} dot={{fill:'#4ade80',r:4}} activeDot={{r:6}}/>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Margem mensal */}
            <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,padding:'1.5rem'}}>
              <div style={{fontSize:'0.85rem',fontWeight:700,color:'#f1f5f9',marginBottom:'0.5rem'}}>Margem EBITDA Mensal (%)</div>
              <div style={{fontSize:'0.72rem',color:'#64748b',marginBottom:'1.25rem'}}>Linha amarela = benchmark mínimo ISP (25%)</div>
              <div style={{height:220}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolucao}>
                    <defs>
                      <linearGradient id="margGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="mes" tick={{fill:'#475569',fontSize:11}} axisLine={{stroke:'#1e293b'}} tickLine={false}/>
                    <YAxis tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>v.toFixed(0)+'%'}/>
                    <Tooltip content={({active,payload,label})=> active&&payload?.length ? (
                      <div style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'8px 12px',fontSize:12}}>
                        <div style={{color:'#94a3b8',marginBottom:4}}>{label}</div>
                        <div style={{color:'#4ade80',fontWeight:700}}>{payload[0].value.toFixed(1)}%</div>
                      </div>
                    ) : null}/>
                    <ReferenceLine y={25} stroke="#fbbf24" strokeDasharray="4 4" label={{value:'Meta 25%',fill:'#fbbf24',fontSize:10,position:'insideTopRight'}}/>
                    <ReferenceLine y={35} stroke="#22d3ee" strokeDasharray="4 4" label={{value:'Ótimo 35%',fill:'#22d3ee',fontSize:10,position:'insideTopRight'}}/>
                    <Area type="monotone" dataKey="margem" name="Margem %" stroke="#4ade80" strokeWidth={2} fill="url(#margGrad)" dot={{fill:'#4ade80',r:3}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grid meses */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'0.75rem'}}>
              {evolucao.map((m,i) => (
                <div key={i} style={{
                  background:'#0a1628',border:`1px solid ${m.margem>=25?'rgba(74,222,128,0.2)':m.margem>=15?'rgba(251,191,36,0.2)':'rgba(248,113,113,0.2)'}`,
                  borderRadius:8,padding:'0.75rem',cursor:'pointer',transition:'all 0.2s',
                }} onClick={()=>setMes(MESES_KEY[i])}>
                  <div style={{fontSize:'0.68rem',color:'#64748b',marginBottom:'0.25rem'}}>{m.mes}</div>
                  <div style={{fontSize:'0.95rem',fontWeight:700,color: m.margem>=25?'#4ade80':m.margem>=15?'#fbbf24':'#f87171'}}>
                    {m.margem.toFixed(1)}%
                  </div>
                  <div style={{fontSize:'0.68rem',color:'#334155',marginTop:2}}>{fc(m.ebitda)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── VIEW: COMPARATIVO 3 ANOS ─── */}
        {viewMode === 'comparativo' && (
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            
            {/* Cards resumo por ano */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
              {['2023','2024','2025'].map((a,i) => {
                const d = calcDRE(DADOS_POR_ANO[a], 'total');
                const prev = i > 0 ? calcDRE(DADOS_POR_ANO[['2023','2024','2025'][i-1]], 'total') : null;
                const crescRec = prev ? ((d.receita - prev.receita)/prev.receita)*100 : null;
                const crescEbitda = prev ? ((d.ebitda - prev.ebitda)/prev.ebitda)*100 : null;
                const isAtivo = a === ano;
                return (
                  <div key={a} onClick={()=>setAno(a)} style={{
                    background: isAtivo ? 'linear-gradient(135deg,#0f1f3a,#0a1628)' : '#0a1628',
                    border:`1px solid ${isAtivo?'#3b82f6':'#1e3a5f'}`,
                    borderRadius:12,padding:'1.25rem',cursor:'pointer',transition:'all 0.2s',
                    boxShadow: isAtivo ? '0 0 20px rgba(59,130,246,0.15)' : 'none',
                  }}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1rem'}}>
                      <span style={{fontSize:'1.4rem',fontWeight:800,color: isAtivo?'#60a5fa':'#334155'}}>{a}</span>
                      {isAtivo && <span style={{background:'#1d4ed8',color:'#fff',borderRadius:4,padding:'2px 8px',fontSize:'0.65rem',fontWeight:700}}>ATIVO</span>}
                    </div>
                    <div style={{marginBottom:'0.5rem'}}>
                      <div style={{fontSize:'0.65rem',color:'#475569',marginBottom:2}}>RECEITA TOTAL</div>
                      <div style={{fontSize:'1.1rem',fontWeight:700,color:'#22d3ee'}}>{fc(d.receita)}</div>
                      {crescRec !== null && <div style={{fontSize:'0.68rem',color:crescRec>=0?'#4ade80':'#f87171'}}>{crescRec>=0?'↑':'↓'} {Math.abs(crescRec).toFixed(1)}% vs {parseInt(a)-1}</div>}
                    </div>
                    <div style={{marginBottom:'0.5rem'}}>
                      <div style={{fontSize:'0.65rem',color:'#475569',marginBottom:2}}>EBITDA TOTAL</div>
                      <div style={{fontSize:'1.1rem',fontWeight:700,color:'#4ade80'}}>{fc(d.ebitda)}</div>
                      {crescEbitda !== null && <div style={{fontSize:'0.68rem',color:crescEbitda>=0?'#4ade80':'#f87171'}}>{crescEbitda>=0?'↑':'↓'} {Math.abs(crescEbitda).toFixed(1)}% vs {parseInt(a)-1}</div>}
                    </div>
                    <div style={{height:2,background:'#0f172a',borderRadius:1,marginTop:'0.75rem'}}>
                      <div style={{height:'100%',background:'#4ade80',borderRadius:1,width:fp(d.margEbitda),transition:'width 0.8s'}}/>
                    </div>
                    <div style={{fontSize:'0.68rem',color:'#64748b',marginTop:4}}>Margem EBITDA: <b style={{color:'#4ade80'}}>{fp(d.margEbitda)}</b></div>
                  </div>
                );
              })}
            </div>

            {/* Gráfico EBITDA 3 anos */}
            <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,padding:'1.5rem'}}>
              <div style={{fontSize:'0.85rem',fontWeight:700,color:'#f1f5f9',marginBottom:'0.5rem'}}>EBITDA Mensal — Comparativo 3 Anos</div>
              <div style={{height:300}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparativo3anos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                    <XAxis dataKey="mes" tick={{fill:'#475569',fontSize:11}} axisLine={{stroke:'#1e293b'}} tickLine={false}/>
                    <YAxis tick={{fill:'#475569',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>'R$'+Math.round(v/1000)+'k'}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Line type="monotone" dataKey="2023" name="2023" stroke="#475569" strokeWidth={1.5} dot={false} strokeDasharray="4 4"/>
                    <Line type="monotone" dataKey="2024" name="2024" stroke="#60a5fa" strokeWidth={2} dot={false}/>
                    <Line type="monotone" dataKey="2025" name="2025" stroke="#4ade80" strokeWidth={2.5} dot={{fill:'#4ade80',r:3}}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela comparativa DRE por ano */}
            <div style={{background:'#0a1628',border:'1px solid #1e3a5f',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'1rem 1.5rem',borderBottom:'1px solid #1e293b',background:'#0f1f3a'}}>
                <span style={{fontSize:'0.8rem',fontWeight:700,color:'#94a3b8',letterSpacing:'0.1em',textTransform:'uppercase'}}>DRE Comparativa — Acumulado Anual</span>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #1e293b'}}>
                    <th style={{padding:'0.75rem 1.5rem',textAlign:'left',fontSize:'0.72rem',color:'#64748b',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em'}}>Linha</th>
                    {['2023','2024','2025'].map(a=>(
                      <th key={a} style={{padding:'0.75rem 1rem',textAlign:'right',fontSize:'0.72rem',color: a===ano?'#60a5fa':'#64748b',fontWeight:700}}>{a}</th>
                    ))}
                    <th style={{padding:'0.75rem 1rem',textAlign:'right',fontSize:'0.72rem',color:'#64748b',fontWeight:700}}>Δ 24→25</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {l:'Receita Bruta', fn: d=>d.receita, c:'#22d3ee', bold:false},
                    {l:'(-) Impostos', fn: d=>d.impostos, c:'#f87171', bold:false, neg:true},
                    {l:'= Receita Líquida', fn: d=>d.recLiq, c:'#60a5fa', bold:true},
                    {l:'(-) Custos Operac.', fn: d=>d.custos, c:'#fb923c', bold:false, neg:true},
                    {l:'= Lucro Bruto', fn: d=>d.lucBruto, c:'#818cf8', bold:true},
                    {l:'(-) Despesas Operac.', fn: d=>d.despesas, c:'#a78bfa', bold:false, neg:true},
                    {l:'= EBITDA', fn: d=>d.ebitda, c:'#4ade80', bold:true, destaque:true},
                    {l:'Margem EBITDA', fn: d=>null, pctFn: d=>d.margEbitda, c:'#4ade80', bold:false, isPct:true},
                  ].map((row,i)=>{
                    const vals = ['2023','2024','2025'].map(a => row.isPct ? null : row.fn(calcDRE(DADOS_POR_ANO[a],'total')));
                    const pcts = row.isPct ? ['2023','2024','2025'].map(a => row.pctFn(calcDRE(DADOS_POR_ANO[a],'total'))) : null;
                    const delta = !row.isPct && vals[1] > 0 ? ((vals[2]-vals[1])/vals[1])*100 : null;
                    return (
                      <tr key={i} style={{borderBottom:'1px solid #0a1020',background: row.destaque?'rgba(74,222,128,0.04)':'transparent'}}>
                        <td style={{padding:'0.65rem 1.5rem',fontSize:'0.78rem',fontWeight: row.bold?700:400,color: row.c}}>{row.l}</td>
                        {row.isPct ? pcts.map((p,j)=>(
                          <td key={j} style={{padding:'0.65rem 1rem',textAlign:'right',fontSize:'0.78rem',color:p>=0.25?'#4ade80':p>=0.15?'#fbbf24':'#f87171',fontWeight:700}}>{fp(p)}</td>
                        )) : vals.map((v,j)=>(
                          <td key={j} style={{padding:'0.65rem 1rem',textAlign:'right',fontSize:'0.78rem',color:row.c,fontWeight: row.bold?700:400}}>
                            {row.neg ? '-'+fc(v) : fc(v)}
                          </td>
                        ))}
                        <td style={{padding:'0.65rem 1rem',textAlign:'right',fontSize:'0.78rem',fontWeight:700,
                          color: row.isPct ? '#64748b' : delta===null?'#475569':delta>=0?'#4ade80':'#f87171'
                        }}>
                          {row.isPct ? '—' : delta !== null ? (delta>=0?'↑':'↓')+Math.abs(delta).toFixed(1)+'%' : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div style={{borderTop:'1px solid #0f172a',padding:'0.75rem 2rem',display:'flex',justifyContent:'space-between',fontSize:'0.65rem',color:'#1e3a5f',marginTop:'1rem'}}>
        <span>TEXNET — Demonstrativo de Resultado do Exercício (DRE)</span>
        <span>Clique nas linhas com ▶ para expandir detalhes · Selecione mês ou acumulado</span>
      </div>
    </div>
  );
}
