// ═══════════════════════════════════════════════════════════════
// AMEXAN WHO Growth Standards Reference Data & Z-Score Engine
// Uses LMS method: z = ((value/M)^L - 1) / (L*S)  [L≠0]
//                  z = ln(value/M) / S           [L=0]
// ═══════════════════════════════════════════════════════════════

export type GrowthIndicator =
  | 'weight_for_age'
  | 'length_for_age'
  | 'height_for_age'
  | 'weight_for_length'
  | 'weight_for_height'
  | 'bmi_for_age'
  | 'head_circumference_for_age'
  | 'muac_for_age';

export type Sex = 'male' | 'female';

export interface GrowthReference {
  indicator: GrowthIndicator;
  sex: Sex;
  ageMonths?: number;
  lengthCm?: number;
  heightCm?: number;
  L: number;
  M: number;
  S: number;
}

export interface GrowthInterpretation {
  indicator: GrowthIndicator;
  value: number;
  unit: string;
  ageMonths: number;
  correctedAgeMonths?: number;
  sex: Sex;
  zScore: number | null;
  percentile: number | null;
  classification: string;
  narrative: string;
  alertLevel: 'normal' | 'caution' | 'warning' | 'critical' | 'out_of_range';
  alertMessage?: string;
  expectedMin?: number;
  expectedMax?: number;
  reference: string;
}

// ─── LMS Reference Data ───
// Format: [ageMonths, L, M, S] for each indicator+sex
// Sources: WHO Child Growth Standards (2006), WHO Growth Reference (2007)

type LMSRow = [number, number, number, number]; // [age, L, M, S]

// ── Weight-for-age (0-60 months) ──
const WFA_BOYS: LMSRow[] = [
  [0, 0.3487, 3.3464, 0.14602], [1, 0.2297, 4.4709, 0.13395], [2, 0.1974, 5.5675, 0.12390],
  [3, 0.1735, 6.3762, 0.11727], [4, 0.1554, 7.0023, 0.11334], [5, 0.1445, 7.5105, 0.11083],
  [6, 0.1377, 7.9340, 0.10906], [7, 0.1319, 8.2970, 0.10779], [8, 0.1268, 8.6150, 0.10683],
  [9, 0.1229, 8.9014, 0.10609], [10, 0.1204, 9.1649, 0.10549], [11, 0.1194, 9.4122, 0.10498],
  [12, 0.1199, 9.6479, 0.10455], [13, 0.1216, 9.8749, 0.10417], [14, 0.1242, 10.0953, 0.10382],
  [15, 0.1273, 10.3108, 0.10351], [16, 0.1306, 10.5228, 0.10322], [17, 0.1341, 10.7320, 0.10296],
  [18, 0.1377, 10.9385, 0.10272], [19, 0.1415, 11.1420, 0.10249], [20, 0.1453, 11.3424, 0.10228],
  [21, 0.1491, 11.5395, 0.10209], [22, 0.1529, 11.7332, 0.10190], [23, 0.1567, 11.9234, 0.10173],
  [24, 0.1604, 12.1102, 0.10157], [30, 0.1766, 12.9951, 0.10095], [36, 0.1878, 13.7635, 0.10053],
  [42, 0.1942, 14.4439, 0.10028], [48, 0.1970, 15.0515, 0.10018], [54, 0.1975, 15.5988, 0.10021],
  [60, 0.1968, 16.0956, 0.10034],
];

const WFA_GIRLS: LMSRow[] = [
  [0, 0.3809, 3.2322, 0.14171], [1, 0.2794, 4.1873, 0.12824], [2, 0.2358, 5.1282, 0.11853],
  [3, 0.2072, 5.8458, 0.11214], [4, 0.1864, 6.4237, 0.10819], [5, 0.1751, 6.8985, 0.10559],
  [6, 0.1673, 7.2966, 0.10384], [7, 0.1607, 7.6423, 0.10262], [8, 0.1548, 7.9504, 0.10177],
  [9, 0.1498, 8.2307, 0.10118], [10, 0.1462, 8.4895, 0.10077], [11, 0.1441, 8.7310, 0.10047],
  [12, 0.1436, 8.9587, 0.10025], [13, 0.1445, 9.1757, 0.10007], [14, 0.1464, 9.3843, 0.09993],
  [15, 0.1491, 9.5862, 0.09981], [16, 0.1523, 9.7829, 0.09970], [17, 0.1558, 9.9752, 0.09961],
  [18, 0.1596, 10.1636, 0.09953], [19, 0.1636, 10.3481, 0.09947], [20, 0.1677, 10.5288, 0.09942],
  [21, 0.1719, 10.7057, 0.09939], [22, 0.1762, 10.8789, 0.09936], [23, 0.1805, 11.0483, 0.09935],
  [24, 0.1849, 11.2140, 0.09935], [30, 0.2033, 11.9959, 0.09948], [36, 0.2156, 12.6981, 0.09981],
  [42, 0.2229, 13.3348, 0.10027], [48, 0.2266, 13.9174, 0.10081], [54, 0.2277, 14.4548, 0.10137],
  [60, 0.2268, 14.9536, 0.10192],
];

// ── Length-for-age (0-24 months) ──
const LFA_BOYS: LMSRow[] = [
  [0, 1.0, 49.8842, 0.03795], [1, 1.0, 54.7244, 0.03557], [2, 1.0, 58.4249, 0.03424],
  [3, 1.0, 61.4292, 0.03332], [4, 1.0, 63.8860, 0.03270], [5, 1.0, 65.9026, 0.03229],
  [6, 1.0, 67.6236, 0.03201], [7, 1.0, 69.1645, 0.03182], [8, 1.0, 70.5994, 0.03169],
  [9, 1.0, 71.9687, 0.03160], [10, 1.0, 73.2812, 0.03154], [11, 1.0, 74.5388, 0.03151],
  [12, 1.0, 75.7488, 0.03149], [13, 1.0, 76.9186, 0.03148], [14, 1.0, 78.0497, 0.03148],
  [15, 1.0, 79.1398, 0.03149], [16, 1.0, 80.1843, 0.03150], [17, 1.0, 81.1826, 0.03152],
  [18, 1.0, 82.1366, 0.03154], [19, 1.0, 83.0496, 0.03157], [20, 1.0, 83.9251, 0.03160],
  [21, 1.0, 84.7665, 0.03163], [22, 1.0, 85.5769, 0.03166], [23, 1.0, 86.3591, 0.03170],
  [24, 1.0, 87.1155, 0.03174],
];

const LFA_GIRLS: LMSRow[] = [
  [0, 1.0, 49.1477, 0.03790], [1, 1.0, 53.6872, 0.03555], [2, 1.0, 57.0673, 0.03423],
  [3, 1.0, 59.8029, 0.03332], [4, 1.0, 62.0899, 0.03270], [5, 1.0, 64.0301, 0.03230],
  [6, 1.0, 65.7349, 0.03204], [7, 1.0, 67.2870, 0.03187], [8, 1.0, 68.7244, 0.03175],
  [9, 1.0, 70.0715, 0.03167], [10, 1.0, 71.3455, 0.03161], [11, 1.0, 72.5570, 0.03157],
  [12, 1.0, 73.7141, 0.03155], [13, 1.0, 74.8219, 0.03153], [14, 1.0, 75.8843, 0.03153],
  [15, 1.0, 76.9046, 0.03153], [16, 1.0, 77.8860, 0.03154], [17, 1.0, 78.8319, 0.03155],
  [18, 1.0, 79.7456, 0.03157], [19, 1.0, 80.6299, 0.03159], [20, 1.0, 81.4871, 0.03161],
  [21, 1.0, 82.3186, 0.03164], [22, 1.0, 83.1252, 0.03167], [23, 1.0, 83.9076, 0.03170],
  [24, 1.0, 84.6665, 0.03173],
];

// ── Height-for-age (2-19 years) ──
const HFA_BOYS: LMSRow[] = [
  [24, 1.0, 87.1155, 0.03174], [30, 1.0, 91.1176, 0.03213], [36, 1.0, 94.7046, 0.03258],
  [42, 1.0, 97.9493, 0.03305], [48, 1.0, 100.8885, 0.03354], [54, 1.0, 103.5476, 0.03404],
  [60, 1.0, 105.9484, 0.03455], [72, 1.0, 110.1335, 0.03562], [84, 1.0, 113.8065, 0.03668],
  [96, 1.0, 117.0850, 0.03772], [108, 1.0, 120.0350, 0.03872], [120, 1.0, 122.7050, 0.03968],
  [132, 1.0, 125.1950, 0.04061], [144, 1.0, 127.6200, 0.04150], [156, 1.0, 130.0600, 0.04233],
  [168, 1.0, 132.5550, 0.04310], [180, 1.0, 135.0700, 0.04382], [192, 1.0, 137.5350, 0.04452],
  [204, 1.0, 139.8900, 0.04522], [216, 1.0, 142.1050, 0.04593], [228, 1.0, 144.1500, 0.04666],
];

const HFA_GIRLS: LMSRow[] = [
  [24, 1.0, 84.6665, 0.03173], [30, 1.0, 88.5100, 0.03225], [36, 1.0, 91.9530, 0.03282],
  [42, 1.0, 95.0580, 0.03342], [48, 1.0, 97.8760, 0.03403], [54, 1.0, 100.4410, 0.03465],
  [60, 1.0, 102.7770, 0.03527], [72, 1.0, 106.9850, 0.03652], [84, 1.0, 110.6880, 0.03774],
  [96, 1.0, 113.9810, 0.03890], [108, 1.0, 116.9140, 0.03999], [120, 1.0, 119.5220, 0.04100],
  [132, 1.0, 121.8660, 0.04192], [144, 1.0, 124.0300, 0.04275], [156, 1.0, 126.0850, 0.04350],
  [168, 1.0, 128.0650, 0.04418], [180, 1.0, 129.9500, 0.04481], [192, 1.0, 131.7000, 0.04542],
  [204, 1.0, 133.3050, 0.04602], [216, 1.0, 134.7750, 0.04662], [228, 1.0, 136.1150, 0.04724],
];

// ── Weight-for-length (45-110 cm boys, 45-110 cm girls) ──
type WFLRow = [number, number, number, number]; // [lengthCm, L, M, S]
const WFL_BOYS: WFLRow[] = [
  [45.0, -0.3521, 2.4410, 0.09182], [50.0, -0.3521, 3.0530, 0.08703],
  [55.0, -0.3521, 3.7080, 0.08391], [60.0, -0.3521, 4.3580, 0.08206],
  [65.0, -0.3521, 5.1470, 0.08082], [70.0, -0.3521, 6.0360, 0.08018],
  [75.0, -0.3521, 6.9930, 0.07997], [80.0, -0.3521, 8.0420, 0.08002],
  [85.0, -0.3521, 9.1920, 0.08022], [90.0, -0.3521, 10.4130, 0.08050],
  [95.0, -0.3521, 11.6770, 0.08083], [100.0, -0.3521, 12.9520, 0.08118],
  [105.0, -0.3521, 14.2090, 0.08154], [110.0, -0.3521, 15.4300, 0.08189],
];

const WFL_GIRLS: WFLRow[] = [
  [45.0, -0.3833, 2.4608, 0.09030], [50.0, -0.3833, 3.0397, 0.08596],
  [55.0, -0.3833, 3.6333, 0.08297], [60.0, -0.3833, 4.2454, 0.08115],
  [65.0, -0.3833, 5.0172, 0.07999], [70.0, -0.3833, 5.9000, 0.07938],
  [75.0, -0.3833, 6.8620, 0.07921], [80.0, -0.3833, 7.8950, 0.07930],
  [85.0, -0.3833, 9.0110, 0.07955], [90.0, -0.3833, 10.1990, 0.07989],
  [95.0, -0.3833, 11.4300, 0.08027], [100.0, -0.3833, 12.6670, 0.08067],
  [105.0, -0.3833, 13.8730, 0.08108], [110.0, -0.3833, 15.0240, 0.08149],
];

// ── BMI-for-age (0-19 years) ──
const BMI_BOYS: LMSRow[] = [
  [0, 0.3487, 13.4106, 0.09191], [1, 0.2297, 16.1908, 0.08007], [3, 0.1735, 17.2438, 0.06866],
  [6, 0.1377, 17.5316, 0.06092], [9, 0.1229, 17.4230, 0.05720], [12, 0.1199, 17.1651, 0.05527],
  [18, 0.1377, 16.7144, 0.05316], [24, 0.1604, 16.3898, 0.05223], [30, 0.1766, 16.1420, 0.05175],
  [36, 0.1878, 15.9451, 0.05148], [48, 0.1970, 15.6250, 0.05128], [60, 0.1968, 15.3756, 0.05141],
  [72, 1.0, 15.3550, 0.07687], [84, 1.0, 15.3890, 0.07737], [96, 1.0, 15.5240, 0.07793],
  [108, 1.0, 15.7240, 0.07856], [120, 1.0, 15.9650, 0.07930], [132, 1.0, 16.2260, 0.08014],
  [144, 1.0, 16.4810, 0.08109], [156, 1.0, 16.7070, 0.08214], [168, 1.0, 16.8880, 0.08328],
  [180, 1.0, 17.0120, 0.08448], [192, 1.0, 17.0750, 0.08572], [204, 1.0, 17.0770, 0.08696],
  [216, 1.0, 17.0230, 0.08816], [228, 1.0, 16.9210, 0.08929],
];

const BMI_GIRLS: LMSRow[] = [
  [0, 0.3809, 13.0068, 0.08865], [1, 0.2794, 15.4027, 0.07666], [3, 0.2072, 16.2810, 0.06585],
  [6, 0.1673, 16.4827, 0.05855], [9, 0.1498, 16.3282, 0.05509], [12, 0.1436, 16.0885, 0.05328],
  [18, 0.1596, 15.7075, 0.05131], [24, 0.1849, 15.4475, 0.05048], [30, 0.2033, 15.2612, 0.05007],
  [36, 0.2156, 15.1151, 0.04985], [48, 0.2266, 14.8777, 0.04972], [60, 0.2268, 14.6894, 0.04989],
  [72, 1.0, 14.7780, 0.08232], [84, 1.0, 14.9500, 0.08293], [96, 1.0, 15.1630, 0.08360],
  [108, 1.0, 15.3990, 0.08436], [120, 1.0, 15.6410, 0.08523], [132, 1.0, 15.8720, 0.08622],
  [144, 1.0, 16.0800, 0.08731], [156, 1.0, 16.2580, 0.08850], [168, 1.0, 16.4030, 0.08977],
  [180, 1.0, 16.5160, 0.09109], [192, 1.0, 16.6040, 0.09241], [204, 1.0, 16.6730, 0.09370],
  [216, 1.0, 16.7310, 0.09493], [228, 1.0, 16.7820, 0.09606],
];

// ── Head circumference-for-age (0-60 months) ──
const HC_BOYS: LMSRow[] = [
  [0, 1.0, 34.4618, 0.03686], [1, 1.0, 37.2754, 0.03179], [2, 1.0, 39.1303, 0.02952],
  [3, 1.0, 40.5135, 0.02818], [4, 1.0, 41.6317, 0.02726], [5, 1.0, 42.5438, 0.02657],
  [6, 1.0, 43.3147, 0.02602], [7, 1.0, 43.9882, 0.02557], [8, 1.0, 44.5818, 0.02520],
  [9, 1.0, 45.1081, 0.02488], [10, 1.0, 45.5774, 0.02461], [11, 1.0, 45.9975, 0.02438],
  [12, 1.0, 46.3745, 0.02418], [15, 1.0, 47.1908, 0.02368], [18, 1.0, 47.8046, 0.02330],
  [21, 1.0, 48.2917, 0.02300], [24, 1.0, 48.6887, 0.02276], [30, 1.0, 49.2648, 0.02240],
  [36, 1.0, 49.6380, 0.02214], [42, 1.0, 49.8841, 0.02195], [48, 1.0, 50.0536, 0.02180],
  [54, 1.0, 50.1751, 0.02169], [60, 1.0, 50.2658, 0.02160],
];

const HC_GIRLS: LMSRow[] = [
  [0, 1.0, 33.8782, 0.03496], [1, 1.0, 36.5467, 0.03024], [2, 1.0, 38.2512, 0.02818],
  [3, 1.0, 39.4753, 0.02697], [4, 1.0, 40.4638, 0.02616], [5, 1.0, 41.2970, 0.02555],
  [6, 1.0, 42.0126, 0.02506], [7, 1.0, 42.6422, 0.02466], [8, 1.0, 43.2018, 0.02432],
  [9, 1.0, 43.7009, 0.02403], [10, 1.0, 44.1480, 0.02379], [11, 1.0, 44.5498, 0.02357],
  [12, 1.0, 44.9121, 0.02339], [15, 1.0, 45.7384, 0.02295], [18, 1.0, 46.3531, 0.02260],
  [21, 1.0, 46.8354, 0.02233], [24, 1.0, 47.2256, 0.02211], [30, 1.0, 47.7931, 0.02179],
  [36, 1.0, 48.1589, 0.02154], [42, 1.0, 48.3910, 0.02135], [48, 1.0, 48.5413, 0.02120],
  [54, 1.0, 48.6438, 0.02108], [60, 1.0, 48.7165, 0.02098],
];

// ── MUAC-for-age (3-60 months) ──
const MUAC_BOYS: LMSRow[] = [
  [3, 0.1547, 12.854, 0.08210], [6, 0.1351, 13.880, 0.07945], [9, 0.1238, 14.434, 0.07771],
  [12, 0.1185, 14.730, 0.07656], [18, 0.1225, 14.959, 0.07517], [24, 0.1276, 15.005, 0.07448],
  [30, 0.1318, 14.975, 0.07410], [36, 0.1361, 14.904, 0.07389], [42, 0.1407, 14.811, 0.07378],
  [48, 0.1455, 14.708, 0.07374], [54, 0.1505, 14.601, 0.07374], [60, 0.1557, 14.494, 0.07378],
];

const MUAC_GIRLS: LMSRow[] = [
  [3, 0.1489, 12.593, 0.08121], [6, 0.1314, 13.560, 0.07836], [9, 0.1211, 14.069, 0.07659],
  [12, 0.1169, 14.339, 0.07547], [18, 0.1209, 14.556, 0.07411], [24, 0.1257, 14.602, 0.07343],
  [30, 0.1296, 14.573, 0.07306], [36, 0.1335, 14.501, 0.07285], [42, 0.1378, 14.404, 0.07275],
  [48, 0.1424, 14.296, 0.07272], [54, 0.1472, 14.183, 0.07274], [60, 0.1522, 14.068, 0.07279],
];

// ── Fenton Preterm (22-50 weeks PMA) ──
// Simplified reference points for key weeks
interface FentonReference {
  weeks: number;
  sex: Sex;
  weight: { M: number; SD: number };
  length: { M: number; SD: number };
  hc: { M: number; SD: number };
}

const FENTON_DATA: FentonReference[] = [
  { weeks: 22, sex: 'male', weight: { M: 0.440, SD: 0.084 }, length: { M: 27.3, SD: 1.8 }, hc: { M: 19.5, SD: 0.9 } },
  { weeks: 24, sex: 'male', weight: { M: 0.630, SD: 0.110 }, length: { M: 30.1, SD: 2.1 }, hc: { M: 21.5, SD: 1.0 } },
  { weeks: 26, sex: 'male', weight: { M: 0.850, SD: 0.140 }, length: { M: 33.0, SD: 2.3 }, hc: { M: 23.5, SD: 1.1 } },
  { weeks: 28, sex: 'male', weight: { M: 1.080, SD: 0.180 }, length: { M: 35.8, SD: 2.5 }, hc: { M: 25.8, SD: 1.2 } },
  { weeks: 30, sex: 'male', weight: { M: 1.420, SD: 0.230 }, length: { M: 38.5, SD: 2.7 }, hc: { M: 28.0, SD: 1.3 } },
  { weeks: 32, sex: 'male', weight: { M: 1.750, SD: 0.280 }, length: { M: 41.0, SD: 2.8 }, hc: { M: 30.0, SD: 1.4 } },
  { weeks: 34, sex: 'male', weight: { M: 2.180, SD: 0.320 }, length: { M: 43.8, SD: 2.9 }, hc: { M: 31.8, SD: 1.4 } },
  { weeks: 36, sex: 'male', weight: { M: 2.630, SD: 0.350 }, length: { M: 46.2, SD: 2.9 }, hc: { M: 33.3, SD: 1.4 } },
  { weeks: 38, sex: 'male', weight: { M: 3.100, SD: 0.370 }, length: { M: 48.3, SD: 2.8 }, hc: { M: 34.5, SD: 1.3 } },
  { weeks: 40, sex: 'male', weight: { M: 3.520, SD: 0.380 }, length: { M: 50.0, SD: 2.7 }, hc: { M: 35.4, SD: 1.3 } },
  { weeks: 42, sex: 'male', weight: { M: 3.820, SD: 0.390 }, length: { M: 51.2, SD: 2.6 }, hc: { M: 35.9, SD: 1.2 } },
  { weeks: 44, sex: 'male', weight: { M: 4.050, SD: 0.390 }, length: { M: 52.1, SD: 2.5 }, hc: { M: 36.3, SD: 1.2 } },
  { weeks: 22, sex: 'female', weight: { M: 0.420, SD: 0.080 }, length: { M: 26.8, SD: 1.8 }, hc: { M: 19.0, SD: 0.9 } },
  { weeks: 24, sex: 'female', weight: { M: 0.600, SD: 0.105 }, length: { M: 29.5, SD: 2.1 }, hc: { M: 21.0, SD: 1.0 } },
  { weeks: 26, sex: 'female', weight: { M: 0.810, SD: 0.135 }, length: { M: 32.4, SD: 2.3 }, hc: { M: 23.0, SD: 1.1 } },
  { weeks: 28, sex: 'female', weight: { M: 1.030, SD: 0.170 }, length: { M: 35.2, SD: 2.5 }, hc: { M: 25.3, SD: 1.2 } },
  { weeks: 30, sex: 'female', weight: { M: 1.350, SD: 0.220 }, length: { M: 37.9, SD: 2.7 }, hc: { M: 27.5, SD: 1.3 } },
  { weeks: 32, sex: 'female', weight: { M: 1.680, SD: 0.270 }, length: { M: 40.5, SD: 2.8 }, hc: { M: 29.5, SD: 1.4 } },
  { weeks: 34, sex: 'female', weight: { M: 2.080, SD: 0.310 }, length: { M: 43.3, SD: 2.9 }, hc: { M: 31.3, SD: 1.4 } },
  { weeks: 36, sex: 'female', weight: { M: 2.520, SD: 0.340 }, length: { M: 45.7, SD: 2.9 }, hc: { M: 32.8, SD: 1.4 } },
  { weeks: 38, sex: 'female', weight: { M: 2.970, SD: 0.360 }, length: { M: 47.8, SD: 2.8 }, hc: { M: 34.0, SD: 1.3 } },
  { weeks: 40, sex: 'female', weight: { M: 3.380, SD: 0.370 }, length: { M: 49.5, SD: 2.7 }, hc: { M: 34.9, SD: 1.3 } },
  { weeks: 42, sex: 'female', weight: { M: 3.680, SD: 0.380 }, length: { M: 50.7, SD: 2.6 }, hc: { M: 35.4, SD: 1.2 } },
  { weeks: 44, sex: 'female', weight: { M: 3.910, SD: 0.380 }, length: { M: 51.6, SD: 2.5 }, hc: { M: 35.8, SD: 1.2 } },
];

// ─── Helper Functions ───

function interpolateLMS(rows: LMSRow[], target: number): { L: number; M: number; S: number } | null {
  if (rows.length === 0) return null;
  if (target <= rows[0][0]) return { L: rows[0][1], M: rows[0][2], S: rows[0][3] };
  if (target >= rows[rows.length - 1][0]) return { L: rows[rows.length - 1][1], M: rows[rows.length - 1][2], S: rows[rows.length - 1][3] };

  for (let i = 0; i < rows.length - 1; i++) {
    const [a, La, Ma, Sa] = rows[i];
    const [b, Lb, Mb, Sb] = rows[i + 1];
    if (target >= a && target <= b) {
      const t = (target - a) / (b - a);
      return {
        L: La + (Lb - La) * t,
        M: Ma + (Mb - Ma) * t,
        S: Sa + (Sb - Sa) * t,
      };
    }
  }
  return null;
}

function interpolateWFL(rows: WFLRow[], targetCm: number): { L: number; M: number; S: number } | null {
  if (rows.length === 0) return null;
  if (targetCm <= rows[0][0]) return { L: rows[0][1], M: rows[0][2], S: rows[0][3] };
  if (targetCm >= rows[rows.length - 1][0]) return { L: rows[rows.length - 1][1], M: rows[rows.length - 1][2], S: rows[rows.length - 1][3] };
  for (let i = 0; i < rows.length - 1; i++) {
    const [a, La, Ma, Sa] = rows[i];
    const [b, Lb, Mb, Sb] = rows[i + 1];
    if (targetCm >= a && targetCm <= b) {
      const t = (targetCm - a) / (b - a);
      return { L: La + (Lb - La) * t, M: Ma + (Mb - Ma) * t, S: Sa + (Sb - Sa) * t };
    }
  }
  return null;
}

function interpolateFenton(data: FentonReference[], weeks: number, sex: Sex, field: 'weight' | 'length' | 'hc'): { M: number; SD: number } | null {
  const filtered = data.filter(d => d.sex === sex);
  if (filtered.length === 0) return null;
  if (weeks <= filtered[0].weeks) return filtered[0][field];
  if (weeks >= filtered[filtered.length - 1].weeks) return filtered[filtered.length - 1][field];
  for (let i = 0; i < filtered.length - 1; i++) {
    if (weeks >= filtered[i].weeks && weeks <= filtered[i + 1].weeks) {
      const t = (weeks - filtered[i].weeks) / (filtered[i + 1].weeks - filtered[i].weeks);
      return {
        M: filtered[i][field].M + (filtered[i + 1][field].M - filtered[i][field].M) * t,
        SD: filtered[i][field].SD + (filtered[i + 1][field].SD - filtered[i][field].SD) * t,
      };
    }
  }
  return null;
}

function computeZScore(value: number, L: number, M: number, S: number): number {
  if (S <= 0 || M <= 0 || value <= 0) return 0;
  if (Math.abs(L) < 0.001) {
    return Math.log(value / M) / S;
  }
  return (Math.pow(value / M, L) - 1) / (L * S);
}

function zScoreToPercentile(z: number): number {
  return 100 * (0.5 * (1 + erf(z / Math.SQRT2)));
}

function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function getDataForIndicator(indicator: GrowthIndicator, sex: Sex): LMSRow[] | WFLRow[] | null {
  const isWFL = indicator === 'weight_for_length' || indicator === 'weight_for_height';
  if (isWFL) {
    if (sex === 'male') return WFL_BOYS;
    return WFL_GIRLS;
  }
  switch (indicator) {
    case 'weight_for_age': return sex === 'male' ? WFA_BOYS : WFA_GIRLS;
    case 'length_for_age': return sex === 'male' ? LFA_BOYS : LFA_GIRLS;
    case 'height_for_age': return sex === 'male' ? HFA_BOYS : HFA_GIRLS;
    case 'bmi_for_age': return sex === 'male' ? BMI_BOYS : BMI_GIRLS;
    case 'head_circumference_for_age': return sex === 'male' ? HC_BOYS : HC_GIRLS;
    case 'muac_for_age': return sex === 'male' ? MUAC_BOYS : MUAC_GIRLS;
  }
  return null;
}

export function computeCorrectedAge(
  chronologicalAgeMonths: number,
  gestationalWeeksAtBirth: number,
): number {
  const fullTerm = 40;
  const prematurityWeeks = fullTerm - gestationalWeeksAtBirth;
  if (prematurityWeeks <= 0) return chronologicalAgeMonths;
  const correctedMonths = chronologicalAgeMonths - prematurityWeeks * (12 / 52);
  return Math.max(0, correctedMonths);
}

export function getExpectedRange(
  indicator: GrowthIndicator,
  ageMonths: number,
  sex: Sex,
  lengthCm?: number,
): { min: number; max: number; median: number; unit: string } | null {
  const isWFL = indicator === 'weight_for_length' || indicator === 'weight_for_height';
  let ref: { L: number; M: number; S: number } | null = null;

  if (isWFL && lengthCm != null) {
    const rows = getDataForIndicator(indicator, sex) as WFLRow[];
    ref = interpolateWFL(rows, lengthCm);
  } else if (indicator === 'height_for_age' && ageMonths < 24) {
    const rows = getDataForIndicator('length_for_age', sex) as LMSRow[];
    ref = interpolateLMS(rows, ageMonths);
  } else {
    const rows = getDataForIndicator(indicator, sex) as LMSRow[];
    ref = interpolateLMS(rows, ageMonths);
  }

  if (!ref) return null;

  const zMin = -2, zMax = 2;
  const minVal = ref.L === 0 ? ref.M * Math.exp(zMin * ref.S) : ref.M * Math.pow(1 + zMin * ref.L * ref.S, 1 / ref.L);
  const maxVal = ref.L === 0 ? ref.M * Math.exp(zMax * ref.S) : ref.M * Math.pow(1 + zMax * ref.L * ref.S, 1 / ref.L);

  const units: Record<string, string> = {
    weight_for_age: 'kg', length_for_age: 'cm', height_for_age: 'cm',
    weight_for_length: 'kg', weight_for_height: 'kg', bmi_for_age: 'kg/m²',
    head_circumference_for_age: 'cm', muac_for_age: 'cm',
  };

  return {
    min: Math.round(minVal * 100) / 100,
    max: Math.round(maxVal * 100) / 100,
    median: Math.round(ref.M * 100) / 100,
    unit: units[indicator] || '',
  };
}

export interface ClassificationDetail {
  label: string;
  zScoreMin: number;
  zScoreMax: number;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
}

const CLASSIFICATIONS: Record<string, ClassificationDetail[]> = {
  weight_for_age: [
    { label: 'Severe underweight', zScoreMin: -Infinity, zScoreMax: -3, severity: 'severe' },
    { label: 'Underweight', zScoreMin: -3, zScoreMax: -2, severity: 'moderate' },
    { label: 'Normal weight-for-age', zScoreMin: -2, zScoreMax: 2, severity: 'normal' },
    { label: 'Above expected', zScoreMin: 2, zScoreMax: Infinity, severity: 'mild' },
  ],
  length_for_age: [
    { label: 'Severe stunting', zScoreMin: -Infinity, zScoreMax: -3, severity: 'severe' },
    { label: 'Stunting', zScoreMin: -3, zScoreMax: -2, severity: 'moderate' },
    { label: 'Normal length-for-age', zScoreMin: -2, zScoreMax: 2, severity: 'normal' },
    { label: 'Tall for age', zScoreMin: 2, zScoreMax: Infinity, severity: 'mild' },
  ],
  height_for_age: [
    { label: 'Severe stunting', zScoreMin: -Infinity, zScoreMax: -3, severity: 'severe' },
    { label: 'Stunting', zScoreMin: -3, zScoreMax: -2, severity: 'moderate' },
    { label: 'Normal height-for-age', zScoreMin: -2, zScoreMax: 2, severity: 'normal' },
    { label: 'Tall for age', zScoreMin: 2, zScoreMax: Infinity, severity: 'mild' },
  ],
  weight_for_length: [
    { label: 'Severe wasting', zScoreMin: -Infinity, zScoreMax: -3, severity: 'severe' },
    { label: 'Wasting', zScoreMin: -3, zScoreMax: -2, severity: 'moderate' },
    { label: 'Normal weight-for-length', zScoreMin: -2, zScoreMax: 2, severity: 'normal' },
    { label: 'Overweight', zScoreMin: 2, zScoreMax: 3, severity: 'mild' },
    { label: 'Obese', zScoreMin: 3, zScoreMax: Infinity, severity: 'severe' },
  ],
  bmi_for_age: [
    { label: 'Severe thinness', zScoreMin: -Infinity, zScoreMax: -3, severity: 'severe' },
    { label: 'Thinness', zScoreMin: -3, zScoreMax: -2, severity: 'moderate' },
    { label: 'Normal BMI-for-age', zScoreMin: -2, zScoreMax: 1, severity: 'normal' },
    { label: 'Overweight', zScoreMin: 1, zScoreMax: 2, severity: 'mild' },
    { label: 'Obese', zScoreMin: 2, zScoreMax: Infinity, severity: 'severe' },
  ],
  head_circumference_for_age: [
    { label: 'Microcephaly (severe)', zScoreMin: -Infinity, zScoreMax: -3, severity: 'severe' },
    { label: 'Microcephaly', zScoreMin: -3, zScoreMax: -2, severity: 'moderate' },
    { label: 'Normal head circumference', zScoreMin: -2, zScoreMax: 2, severity: 'normal' },
    { label: 'Macrocephaly', zScoreMin: 2, zScoreMax: 3, severity: 'mild' },
    { label: 'Macrocephaly (marked)', zScoreMin: 3, zScoreMax: Infinity, severity: 'severe' },
  ],
  muac_for_age: [
    { label: 'Severe Acute Malnutrition (SAM)', zScoreMin: -Infinity, zScoreMax: -3, severity: 'severe' },
    { label: 'Moderate Acute Malnutrition (MAM)', zScoreMin: -3, zScoreMax: -2, severity: 'moderate' },
    { label: 'Normal MUAC', zScoreMin: -2, zScoreMax: 2, severity: 'normal' },
  ],
};

export function classifyGrowth(indicator: GrowthIndicator, zScore: number): ClassificationDetail {
  const cls = CLASSIFICATIONS[indicator];
  if (!cls) return { label: 'Unclassified', zScoreMin: -Infinity, zScoreMax: Infinity, severity: 'normal' };
  for (const c of cls) {
    if (zScore >= c.zScoreMin && zScore < c.zScoreMax) return c;
  }
  return cls[cls.length - 1];
}

// ─── Main Interpretation Engine ───

export function interpretGrowth(
  indicator: GrowthIndicator,
  value: number,
  ageMonths: number,
  sex: Sex,
  options?: {
    correctedAgeMonths?: number;
    gestationalWeeksAtBirth?: number;
    lengthCm?: number;
    heightCm?: number;
  },
): GrowthInterpretation {
  const correctedAge = options?.correctedAgeMonths ?? (
    options?.gestationalWeeksAtBirth
      ? computeCorrectedAge(ageMonths, options.gestationalWeeksAtBirth)
      : undefined
  );
  const effectiveAge = correctedAge != null ? Math.min(correctedAge, ageMonths) : ageMonths;
  const applyLength = indicator === 'weight_for_length' || indicator === 'weight_for_height';
  const lengthForRef = applyLength ? (options?.lengthCm ?? options?.heightCm ?? 0) : 0;

  const isHeight = indicator === 'height_for_age';

  let ref: { L: number; M: number; S: number } | null = null;

  if (applyLength) {
    const rows = getDataForIndicator(indicator, sex) as WFLRow[];
    ref = interpolateWFL(rows, lengthForRef);
  } else if (isHeight && effectiveAge < 24) {
    const rows = getDataForIndicator('length_for_age', sex) as LMSRow[];
    ref = interpolateLMS(rows, effectiveAge);
  } else {
    const rows = getDataForIndicator(indicator, sex) as LMSRow[];
    ref = interpolateLMS(rows, effectiveAge);
  }

  if (!ref) {
    return {
      indicator, value, unit: '', ageMonths, sex,
      zScore: null, percentile: null,
      classification: 'Reference data not available',
      narrative: `${value} measured. Reference data not available for this age/sex.`,
      alertLevel: 'out_of_range',
      reference: 'WHO',
    };
  }

  const zScore = computeZScore(value, ref.L, ref.M, ref.S);
  const percentile = zScoreToPercentile(zScore);
  const classification = classifyGrowth(indicator, zScore);

  const expected = getExpectedRange(indicator, effectiveAge, sex, lengthForRef || undefined);

  let narrative: string;
  let alertLevel: 'normal' | 'caution' | 'warning' | 'critical' | 'out_of_range' = 'normal';
  let alertMessage: string | undefined;

  const valStr = value.toFixed(1);
  const refStr = ref.M.toFixed(1);
  const units: Record<string, string> = {
    weight_for_age: 'kg', length_for_age: 'cm', height_for_age: 'cm',
    weight_for_length: 'kg', weight_for_height: 'kg', bmi_for_age: 'kg/m²',
    head_circumference_for_age: 'cm', muac_for_age: 'cm',
  };
  const unit = units[indicator] || '';

  const indicatorLabel: Record<string, string> = {
    weight_for_age: 'Weight', length_for_age: 'Length', height_for_age: 'Height',
    weight_for_length: 'Weight', weight_for_height: 'Weight', bmi_for_age: 'BMI',
    head_circumference_for_age: 'Head circumference', muac_for_age: 'MUAC',
  };
  const label = indicatorLabel[indicator] || indicator;

  const ageDesc = correctedAge != null
    ? `${ageMonths >= 24 ? `${Math.floor(ageMonths / 12)}yr ${Math.round(ageMonths % 12)}mo` : `${Math.round(ageMonths)}mo`} (corrected ${Math.round(effectiveAge)}mo for prematurity)`
    : ageMonths >= 24
      ? `${Math.floor(ageMonths / 12)}yr ${Math.round(ageMonths % 12)}mo`
      : `${Math.round(ageMonths)}mo`;

  if (classification.severity === 'severe') {
    alertLevel = 'critical';
    alertMessage = `Clinically significant abnormality requiring immediate attention.`;
    narrative = `${label} is ${valStr} ${unit}, which is significantly outside the expected range (z-score ${zScore.toFixed(1)}, <${classification.zScoreMax}th percentile).`;
    if (indicator === 'weight_for_age') {
      narrative += ` This is consistent with severe underweight. Evaluate for acute or chronic malnutrition, underlying illness, or feeding difficulties.`;
    } else if (indicator === 'head_circumference_for_age') {
      narrative += ` This is consistent with ${zScore < -3 ? 'severe microcephaly' : 'macrocephaly'}. Correlate with developmental history, neurological examination, and neuroimaging where indicated.`;
    } else if (indicator === 'muac_for_age') {
      narrative += ` This is consistent with Severe Acute Malnutrition (SAM). Initiate therapeutic feeding protocol.`;
    }
  } else if (classification.severity === 'moderate') {
    alertLevel = 'warning';
    alertMessage = 'Outside expected range. Consider further evaluation.';
    if (indicator === 'weight_for_age') {
      narrative = `${label} is ${valStr} ${unit}, below the expected ${refStr} ${unit} for this age (z-score ${zScore.toFixed(1)}). This is suggestive of underweight for a ${sex} child aged ${ageDesc}. Assess nutritional intake, screen for chronic illness, and plot on growth chart.`;
    } else if (indicator === 'length_for_age' || indicator === 'height_for_age') {
      narrative = `${label} is ${valStr} ${unit}, below the expected ${refStr} ${unit} for this age (z-score ${zScore.toFixed(1)}). This is consistent with stunting for a ${sex} child aged ${ageDesc}. Evaluate for chronic malnutrition, endocrine disorders, or chronic disease.`;
    } else if (indicator === 'weight_for_length' || indicator === 'weight_for_height') {
      narrative = `${label} is ${valStr} ${unit} at a length/height of ${lengthForRef} cm (z-score ${zScore.toFixed(1)}). This is consistent with wasting. Assess for acute malnutrition and initiate appropriate nutritional intervention.`;
    } else if (indicator === 'bmi_for_age') {
      if (zScore < -2) {
        narrative = `BMI is ${valStr} ${unit}, below expected for age (z-score ${zScore.toFixed(1)}). This is consistent with thinness. Evaluate nutritional status and dietary intake.`;
      } else {
        narrative = `BMI is ${valStr} ${unit}, above expected for age (z-score ${zScore.toFixed(1)}). This is consistent with overweight/obesity. Provide dietary counseling and lifestyle modification.`;
      }
    } else if (indicator === 'head_circumference_for_age') {
      narrative = `Head circumference is ${valStr} ${unit}, ${zScore < -2 ? 'below' : 'above'} expected for age (z-score ${zScore.toFixed(1)}). This is consistent with ${zScore < -2 ? 'microcephaly' : 'macrocephaly'} for a ${sex} child aged ${ageDesc}. ${zScore < -2 ? 'Correlate with developmental history and neurological examination.' : 'Evaluate for hydrocephalus or other intracranial pathology.'}`;
    } else {
      narrative = `${label} is ${valStr} ${unit} (expected ${refStr} ${unit}, z-score ${zScore.toFixed(1)}) for a ${sex} aged ${ageDesc}. This falls outside the expected range and warrants clinical correlation.`;
    }
  } else if (classification.severity === 'mild') {
    alertLevel = 'caution';
    narrative = `${label} is ${valStr} ${unit}, above the expected range (z-score ${zScore.toFixed(1)}, ~${Math.round(percentile)}th percentile) for a ${sex} aged ${ageDesc}. Monitor trend.`;
    if (indicator === 'bmi_for_age') {
      narrative += ' Provide anticipatory guidance on healthy diet and physical activity.';
    }
  } else {
    narrative = `${label} is ${valStr} ${unit}, corresponding to approximately the ${Math.round(percentile)}th percentile for ${sex === 'male' ? 'a male' : 'a female'} aged ${ageDesc} according to WHO Child Growth Standards. This is within the expected range.`;
  }

  return {
    indicator, value, unit, ageMonths,
    correctedAgeMonths: correctedAge,
    sex, zScore, percentile,
    classification: classification.label,
    narrative,
    alertLevel,
    alertMessage,
    expectedMin: expected?.min,
    expectedMax: expected?.max,
    reference: indicator === 'weight_for_age' || indicator === 'height_for_age' || indicator === 'bmi_for_age'
      ? 'WHO 2006/2007'
      : 'WHO',
  };
}

// ─── Adult BMI Classification (WHO) ───

export interface AdultBmiInterpretation {
  bmi: number;
  classification: string;
  risk: string;
  narrative: string;
}

export function interpretAdultBmi(bmi: number, sex: Sex): AdultBmiInterpretation {
  let classification: string;
  let risk: string;
  if (bmi < 16.0) { classification = 'Severe thinness'; risk: 'Very severe'; risk = 'Very severe'; }
  else if (bmi < 17.0) { classification = 'Moderate thinness'; risk = 'Severe'; }
  else if (bmi < 18.5) { classification = 'Mild thinness'; risk = 'Moderate'; }
  else if (bmi < 25.0) { classification = 'Normal range'; risk = 'Low'; }
  else if (bmi < 30.0) { classification = 'Overweight (pre-obese)'; risk = 'Increased'; }
  else if (bmi < 35.0) { classification = 'Obese Class I'; risk = 'Moderate'; }
  else if (bmi < 40.0) { classification = 'Obese Class II'; risk = 'Severe'; }
  else { classification = 'Obese Class III (Morbid)'; risk = 'Very severe'; }

  const narrative = `BMI is ${bmi.toFixed(1)} kg/m², classified as "${classification}" with ${risk.toLowerCase()} risk of metabolic complications.`;
  return { bmi, classification, risk, narrative };
}

// ─── MUAC Adult Classification ───

export function interpretAdultMuac(muacCm: number, sex: Sex, pregnant: boolean): GrowthInterpretation {
  let classification: string;
  let alertLevel: 'normal' | 'caution' | 'warning' | 'critical' | 'out_of_range';
  let narrative: string;

  if (pregnant) {
    if (muacCm < 23.0) {
      classification = 'Acute malnutrition (pregnancy)';
      alertLevel = 'critical';
      narrative = `MUAC is ${muacCm.toFixed(1)} cm, below 23.0 cm, indicating acute malnutrition in pregnancy. Associated with increased risk of low birth weight.`;
    } else {
      classification = 'Normal (pregnancy)';
      alertLevel = 'normal';
      narrative = `MUAC is ${muacCm.toFixed(1)} cm, above 23.0 cm, indicating adequate nutritional status.`;
    }
  } else if (sex === 'female') {
    if (muacCm < 19.0) { classification = 'Severe Acute Malnutrition'; alertLevel = 'critical'; narrative = `MUAC is ${muacCm.toFixed(1)} cm, below 19.0 cm, consistent with SAM.`; }
    else if (muacCm < 22.0) { classification = 'Moderate Acute Malnutrition'; alertLevel = 'warning'; narrative = `MUAC is ${muacCm.toFixed(1)} cm, below 22.0 cm, consistent with MAM.`; }
    else if (muacCm < 23.0) { classification = 'At risk of malnutrition'; alertLevel = 'caution'; narrative = `MUAC is ${muacCm.toFixed(1)} cm, borderline low. Monitor nutritional status.`; }
    else { classification = 'Normal'; alertLevel = 'normal'; narrative = `MUAC is ${muacCm.toFixed(1)} cm, above 23.0 cm, within normal range.`; }
  } else {
    if (muacCm < 19.0) { classification = 'Severe Acute Malnutrition'; alertLevel = 'critical'; narrative = `MUAC is ${muacCm.toFixed(1)} cm, below 19.0 cm, consistent with SAM.`; }
    else if (muacCm < 22.0) { classification = 'Moderate Acute Malnutrition'; alertLevel = 'warning'; narrative = `MUAC is ${muacCm.toFixed(1)} cm, below 22.0 cm, consistent with MAM.`; }
    else if (muacCm < 23.0) { classification = 'At risk of malnutrition'; alertLevel = 'caution'; narrative = `MUAC is ${muacCm.toFixed(1)} cm, borderline low. Monitor.`; }
    else { classification = 'Normal'; alertLevel = 'normal'; narrative = `MUAC is ${muacCm.toFixed(1)} cm, within normal range for a ${sex === 'male' ? 'man' : 'woman'}.`; }
  }

  return {
    indicator: 'muac_for_age', value: muacCm, unit: 'cm', ageMonths: 720, sex,
    zScore: null, percentile: null, classification, narrative,
    alertLevel, reference: 'WHO Adult MUAC',
  };
}
