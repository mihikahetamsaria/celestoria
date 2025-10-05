// Global Variables
let scene, camera, renderer, controls;
const AU_SCALE = 40;
const G = 6.67430e-11;
const AU_TO_M = 1.496e11;
const DAY_TO_S = 86400;
const EARTH_RADIUS_KM = 6371;

let isPaused = false;
let gravityEnabled = true;
let gMultiplier = 1.0;
let integrator = 'verlet';
let asteroidVisualScale = 5;

const asteroidMap = new Map();
const asteroidOverrides = new Map();
let asteroidMeshes = [];
let activeOrbitLine = null;
let simDay = 0;
let collisionDetected = false;
let speedMultiplier = 1;
const baseDayStep = 0.0027;

const textureLoader = new THREE.TextureLoader();
const planetLabels = new Map();
let selectedAsteroidLabel = null;
let trackAsteroid = false; // Added for asteroid tracking

const planetData = {
    sun: { mass: 1.989e30, radius: 7, realRadius: 696000, name: 'Sun' },
    mercury: { mass: 3.285e23, radius: 0.5, realRadius: 2439.7, name: 'Mercury' },
    venus: { mass: 4.867e24, radius: 1.2, realRadius: 6051.8, name: 'Venus' },
    earth: { mass: 5.972e24, radius: 1.4, realRadius: 6371, name: 'Earth' },
    mars: { mass: 6.39e23, radius: 1, realRadius: 3389.5, name: 'Mars' },
    jupiter: { mass: 1.898e27, radius: 4, realRadius: 69911, name: 'Jupiter' },
    saturn: { mass: 5.683e26, radius: 5.5, realRadius: 58232, name: 'Saturn' },
    uranus: { mass: 8.681e25, radius: 4.5, realRadius: 25362, name: 'Uranus' },
    neptune: { mass: 1.024e26, radius: 4.3, realRadius: 24622, name: 'Neptune' }
};

const orbitalParams = {
    mercury: { a: 0.387 * AU_SCALE, e: 0.206, i: 7.00 * Math.PI / 180, period: 88 },
    venus: { a: 0.723 * AU_SCALE, e: 0.007, i: 3.39 * Math.PI / 180, period: 225 },
    earth: { a: 1.0 * AU_SCALE, e: 0.017, i: 0, period: 365 },
    mars: { a: 1.524 * AU_SCALE, e: 0.093, i: 1.85 * Math.PI / 180, period: 687 },
    jupiter: { a: 5.203 * AU_SCALE, e: 0.049, i: 1.30 * Math.PI / 180, period: 4333 },
    saturn: { a: 9.537 * AU_SCALE, e: 0.056, i: 2.49 * Math.PI / 180, period: 10759 },
    uranus: { a: 19.191 * AU_SCALE, e: 0.047, i: 0.77 * Math.PI / 180, period: 30687 },
    neptune: { a: 30.068 * AU_SCALE, e: 0.009, i: 1.77 * Math.PI / 180, period: 60190 }
};

let sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune;
let celestialBodies = [];

// ADD YOUR ASTEROID JSON DATA HERE
const asteroidJsonData = [
  {
    "spkid": 20000002,
    "full_name": "     2 Pallas (A802 FA)",
    "pdes": "2",
    "name": "Pallas",
    "neo": "N",
    "pha": "N",
    "H": 4.11,
    "diameter": 513,
    "albedo": 0.155,
    "e": 0.2306,
    "a": 2.77,
    "q": 2.131,
    "i": 34.93,
    "om": 172.89,
    "w": 310.93,
    "ma": 211.53,
    "per_y": 4.61
  },
  {
    "spkid": 20000003,
    "full_name": "     3 Juno (A804 RA)",
    "pdes": "3",
    "name": "Juno",
    "neo": "N",
    "pha": "N",
    "H": 5.19,
    "diameter": 246.596,
    "albedo": 0.214,
    "e": 0.2558,
    "a": 2.671,
    "q": 1.988,
    "i": 12.99,
    "om": 169.82,
    "w": 247.88,
    "ma": 217.59,
    "per_y": 4.37
  },
  {
    "spkid": 20000004,
    "full_name": "     4 Vesta (A807 FA)",
    "pdes": "4",
    "name": "Vesta",
    "neo": "N",
    "pha": "N",
    "H": 3.25,
    "diameter": 522.77,
    "albedo": 0.4228,
    "e": 0.0902,
    "a": 2.362,
    "q": 2.149,
    "i": 7.14,
    "om": 103.7,
    "w": 151.54,
    "ma": 26.81,
    "per_y": 3.63
  },
  {
    "spkid": 20000005,
    "full_name": "     5 Astraea (A845 XA)",
    "pdes": "5",
    "name": "Astraea",
    "neo": "N",
    "pha": "N",
    "H": 6.99,
    "diameter": 106.699,
    "albedo": 0.274,
    "e": 0.1875,
    "a": 2.577,
    "q": 2.094,
    "i": 5.36,
    "om": 141.45,
    "w": 359.35,
    "ma": 133.87,
    "per_y": 4.14
  },
  {
    "spkid": 20000006,
    "full_name": "     6 Hebe (A847 NA)",
    "pdes": "6",
    "name": "Hebe",
    "neo": "N",
    "pha": "N",
    "H": 5.61,
    "diameter": 185.18,
    "albedo": 0.2679,
    "e": 0.2022,
    "a": 2.425,
    "q": 1.935,
    "i": 14.74,
    "om": 138.61,
    "w": 239.7,
    "ma": 352.56,
    "per_y": 3.78
  },
  {
    "spkid": 20000007,
    "full_name": "     7 Iris (A847 PA)",
    "pdes": "7",
    "name": "Iris",
    "neo": "N",
    "pha": "N",
    "H": 5.67,
    "diameter": 199.83,
    "albedo": 0.2766,
    "e": 0.2302,
    "a": 2.387,
    "q": 1.837,
    "i": 5.52,
    "om": 259.49,
    "w": 145.48,
    "ma": 61.73,
    "per_y": 3.69
  },
  {
    "spkid": 20000008,
    "full_name": "     8 Flora (A847 UA)",
    "pdes": "8",
    "name": "Flora",
    "neo": "N",
    "pha": "N",
    "H": 6.61,
    "diameter": 147.491,
    "albedo": 0.226,
    "e": 0.1563,
    "a": 2.201,
    "q": 1.857,
    "i": 5.89,
    "om": 110.84,
    "w": 285.43,
    "ma": 198.9,
    "per_y": 3.27
  },
  {
    "spkid": 20000009,
    "full_name": "     9 Metis (A848 HA)",
    "pdes": "9",
    "name": "Metis",
    "neo": "N",
    "pha": "N",
    "H": 6.34,
    "diameter": 190,
    "albedo": 0.118,
    "e": 0.1226,
    "a": 2.387,
    "q": 2.094,
    "i": 5.58,
    "om": 68.87,
    "w": 5.9,
    "ma": 199.2,
    "per_y": 3.69
  },
  {
    "spkid": 20000010,
    "full_name": "    10 Hygiea (A849 GA)",
    "pdes": "10",
    "name": "Hygiea",
    "neo": "N",
    "pha": "N",
    "H": 5.65,
    "diameter": 407.12,
    "albedo": 0.0717,
    "e": 0.1082,
    "a": 3.148,
    "q": 2.807,
    "i": 3.83,
    "om": 283.12,
    "w": 312.61,
    "ma": 216.69,
    "per_y": 5.58
  },
  {
    "spkid": 20000011,
    "full_name": "    11 Parthenope (A850 JA)",
    "pdes": "11",
    "name": "Parthenope",
    "neo": "N",
    "pha": "N",
    "H": 6.73,
    "diameter": 142.887,
    "albedo": 0.191,
    "e": 0.1005,
    "a": 2.453,
    "q": 2.207,
    "i": 4.64,
    "om": 125.47,
    "w": 196.42,
    "ma": 173.66,
    "per_y": 3.84
  },
  {
    "spkid": 20000012,
    "full_name": "    12 Victoria (A850 RA)",
    "pdes": "12",
    "name": "Victoria",
    "neo": "N",
    "pha": "N",
    "H": 7.29,
    "diameter": 115.087,
    "albedo": 0.163,
    "e": 0.2199,
    "a": 2.334,
    "q": 1.821,
    "i": 8.37,
    "om": 235.35,
    "w": 69.55,
    "ma": 76.94,
    "per_y": 3.57
  },
  {
    "spkid": 20000013,
    "full_name": "    13 Egeria (A850 VA)",
    "pdes": "13",
    "name": "Egeria",
    "neo": "N",
    "pha": "N",
    "H": 6.91,
    "diameter": 202.636,
    "albedo": 0.049,
    "e": 0.0847,
    "a": 2.576,
    "q": 2.358,
    "i": 16.53,
    "om": 43.18,
    "w": 79.06,
    "ma": 40.99,
    "per_y": 4.14
  },
  {
    "spkid": 20000014,
    "full_name": "    14 Irene (A851 KA)",
    "pdes": "14",
    "name": "Irene",
    "neo": "N",
    "pha": "N",
    "H": 6.54,
    "diameter": 152,
    "albedo": 0.159,
    "e": 0.1627,
    "a": 2.588,
    "q": 2.167,
    "i": 9.13,
    "om": 86.01,
    "w": 98.27,
    "ma": 12.93,
    "per_y": 4.16
  },
  {
    "spkid": 20000015,
    "full_name": "    15 Eunomia (A851 OA)",
    "pdes": "15",
    "name": "Eunomia",
    "neo": "N",
    "pha": "N",
    "H": 5.42,
    "diameter": 231.689,
    "albedo": 0.248,
    "e": 0.1878,
    "a": 2.642,
    "q": 2.146,
    "i": 11.76,
    "om": 292.88,
    "w": 98.51,
    "ma": 113.73,
    "per_y": 4.29
  },
  {
    "spkid": 20000016,
    "full_name": "    16 Psyche (A852 FA)",
    "pdes": "16",
    "name": "Psyche",
    "neo": "N",
    "pha": "N",
    "H": 6.2,
    "diameter": 222,
    "albedo": 0.1203,
    "e": 0.1343,
    "a": 2.923,
    "q": 2.531,
    "i": 3.1,
    "om": 150.01,
    "w": 229.75,
    "ma": 40.64,
    "per_y": 5
  },
  {
    "spkid": 20000017,
    "full_name": "    17 Thetis (A852 HA)",
    "pdes": "17",
    "name": "Thetis",
    "neo": "N",
    "pha": "N",
    "H": 7.92,
    "diameter": 84.899,
    "albedo": 0.193,
    "e": 0.1313,
    "a": 2.473,
    "q": 2.148,
    "i": 5.59,
    "om": 125.5,
    "w": 135.95,
    "ma": 192.66,
    "per_y": 3.89
  },
  {
    "spkid": 20000018,
    "full_name": "    18 Melpomene (A852 MA)",
    "pdes": "18",
    "name": "Melpomene",
    "neo": "N",
    "pha": "N",
    "H": 6.35,
    "diameter": 139.594,
    "albedo": 0.181,
    "e": 0.218,
    "a": 2.296,
    "q": 1.795,
    "i": 10.13,
    "om": 150.33,
    "w": 228.05,
    "ma": 227.26,
    "per_y": 3.48
  },
  {
    "spkid": 20000019,
    "full_name": "    19 Fortuna (A852 QA)",
    "pdes": "19",
    "name": "Fortuna",
    "neo": "N",
    "pha": "N",
    "H": 7.49,
    "diameter": 200,
    "albedo": 0.037,
    "e": 0.158,
    "a": 2.442,
    "q": 2.056,
    "i": 1.57,
    "om": 211,
    "w": 182.52,
    "ma": 96.5,
    "per_y": 3.82
  },
  {
    "spkid": 20000020,
    "full_name": "    20 Massalia (A852 SA)",
    "pdes": "20",
    "name": "Massalia",
    "neo": "N",
    "pha": "N",
    "H": 6.54,
    "diameter": 135.68,
    "albedo": 0.241,
    "e": 0.1438,
    "a": 2.408,
    "q": 2.062,
    "i": 0.71,
    "om": 205.95,
    "w": 257.23,
    "ma": 30,
    "per_y": 3.74
  },
  {
    "spkid": 20000021,
    "full_name": "    21 Lutetia (A852 VA)",
    "pdes": "21",
    "name": "Lutetia",
    "neo": "N",
    "pha": "N",
    "H": 7.49,
    "diameter": 98,
    "albedo": 0.19,
    "e": 0.1648,
    "a": 2.434,
    "q": 2.033,
    "i": 3.06,
    "om": 80.84,
    "w": 249.94,
    "ma": 246.81,
    "per_y": 3.8
  },
  {
    "spkid": 20000022,
    "full_name": "    22 Kalliope (A852 WA)",
    "pdes": "22",
    "name": "Kalliope",
    "neo": "N",
    "pha": "N",
    "H": 6.79,
    "diameter": 167.536,
    "albedo": 0.166,
    "e": 0.0989,
    "a": 2.909,
    "q": 2.622,
    "i": 13.7,
    "om": 65.97,
    "w": 358.24,
    "ma": 310.67,
    "per_y": 4.96
  },
  {
    "spkid": 20000023,
    "full_name": "    23 Thalia (A852 XA)",
    "pdes": "23",
    "name": "Thalia",
    "neo": "N",
    "pha": "N",
    "H": 7.13,
    "diameter": 107.53,
    "albedo": 0.2536,
    "e": 0.2312,
    "a": 2.629,
    "q": 2.021,
    "i": 10.11,
    "om": 66.49,
    "w": 61.63,
    "ma": 170.2,
    "per_y": 4.26
  },
  {
    "spkid": 20000024,
    "full_name": "    24 Themis (A853 GA)",
    "pdes": "24",
    "name": "Themis",
    "neo": "N",
    "pha": "N",
    "H": 7.22,
    "diameter": 198,
    "albedo": 0.067,
    "e": 0.1153,
    "a": 3.143,
    "q": 2.781,
    "i": 0.74,
    "om": 36.39,
    "w": 109.11,
    "ma": 56.76,
    "per_y": 5.57
  },
  {
    "spkid": 20000025,
    "full_name": "    25 Phocaea (A853 GB)",
    "pdes": "25",
    "name": "Phocaea",
    "neo": "N",
    "pha": "N",
    "H": 7.87,
    "diameter": 61.054,
    "albedo": 0.35,
    "e": 0.254,
    "a": 2.4,
    "q": 1.791,
    "i": 21.61,
    "om": 214.09,
    "w": 90.23,
    "ma": 89.2,
    "per_y": 3.72
  },
  {
    "spkid": 20000026,
    "full_name": "    26 Proserpina (A853 JA)",
    "pdes": "26",
    "name": "Proserpina",
    "neo": "N",
    "pha": "N",
    "H": 7.48,
    "diameter": 94.8,
    "albedo": 0.1966,
    "e": 0.0886,
    "a": 2.655,
    "q": 2.42,
    "i": 3.55,
    "om": 45.69,
    "w": 196.06,
    "ma": 289.59,
    "per_y": 4.33
  },
  {
    "spkid": 20000027,
    "full_name": "    27 Euterpe (A853 VA)",
    "pdes": "27",
    "name": "Euterpe",
    "neo": "N",
    "pha": "N",
    "H": 7.03,
    "diameter": 96,
    "albedo": 0.215,
    "e": 0.1716,
    "a": 2.347,
    "q": 1.944,
    "i": 1.58,
    "om": 94.77,
    "w": 356.57,
    "ma": 272.94,
    "per_y": 3.6
  },
  {
    "spkid": 20000028,
    "full_name": "    28 Bellona (A854 EA)",
    "pdes": "28",
    "name": "Bellona",
    "neo": "N",
    "pha": "N",
    "H": 7.23,
    "diameter": 120.9,
    "albedo": 0.1763,
    "e": 0.149,
    "a": 2.777,
    "q": 2.364,
    "i": 9.42,
    "om": 144.15,
    "w": 343.46,
    "ma": 65.46,
    "per_y": 4.63
  },
  {
    "spkid": 20000029,
    "full_name": "    29 Amphitrite (A854 EB)",
    "pdes": "29",
    "name": "Amphitrite",
    "neo": "N",
    "pha": "N",
    "H": 5.97,
    "diameter": 189.559,
    "albedo": 0.216,
    "e": 0.0734,
    "a": 2.554,
    "q": 2.367,
    "i": 6.08,
    "om": 356.25,
    "w": 61.91,
    "ma": 145.11,
    "per_y": 4.08
  },
  {
    "spkid": 20000030,
    "full_name": "    30 Urania (A854 OA)",
    "pdes": "30",
    "name": "Urania",
    "neo": "N",
    "pha": "N",
    "H": 7.57,
    "diameter": 92.787,
    "albedo": 0.192,
    "e": 0.1267,
    "a": 2.366,
    "q": 2.066,
    "i": 2.09,
    "om": 307.4,
    "w": 87.19,
    "ma": 319.52,
    "per_y": 3.64
  },
  {
    "spkid": 20000031,
    "full_name": "    31 Euphrosyne (A854 RA)",
    "pdes": "31",
    "name": "Euphrosyne",
    "neo": "N",
    "pha": "N",
    "H": 6.81,
    "diameter": 267.08,
    "albedo": 0.053,
    "e": 0.2159,
    "a": 3.162,
    "q": 2.479,
    "i": 26.31,
    "om": 30.8,
    "w": 61.97,
    "ma": 147.89,
    "per_y": 5.62
  },
  {
    "spkid": 20000032,
    "full_name": "    32 Pomona (A854 UA)",
    "pdes": "32",
    "name": "Pomona",
    "neo": "N",
    "pha": "N",
    "H": 7.76,
    "diameter": 80.76,
    "albedo": 0.2564,
    "e": 0.0813,
    "a": 2.588,
    "q": 2.377,
    "i": 5.52,
    "om": 220.36,
    "w": 337.86,
    "ma": 242.01,
    "per_y": 4.16
  },
  {
    "spkid": 20000033,
    "full_name": "    33 Polyhymnia (A854 UB)",
    "pdes": "33",
    "name": "Polyhymnia",
    "neo": "N",
    "pha": "N",
    "H": 8.48,
    "diameter": 52.929,
    "albedo": 0.24,
    "e": 0.3333,
    "a": 2.874,
    "q": 1.916,
    "i": 1.85,
    "om": 8.21,
    "w": 338.83,
    "ma": 107.07,
    "per_y": 4.87
  },
  {
    "spkid": 20000034,
    "full_name": "    34 Circe (A855 GA)",
    "pdes": "34",
    "name": "Circe",
    "neo": "N",
    "pha": "N",
    "H": 8.77,
    "diameter": 132.992,
    "albedo": 0.023,
    "e": 0.1068,
    "a": 2.688,
    "q": 2.401,
    "i": 5.5,
    "om": 184.29,
    "w": 329.41,
    "ma": 305.21,
    "per_y": 4.41
  },
  {
    "spkid": 20000035,
    "full_name": "    35 Leukothea (A855 HA)",
    "pdes": "35",
    "name": "Leukothea",
    "neo": "N",
    "pha": "N",
    "H": 8.68,
    "diameter": 103.055,
    "albedo": 0.066,
    "e": 0.2173,
    "a": 3.006,
    "q": 2.353,
    "i": 7.87,
    "om": 352.91,
    "w": 215.44,
    "ma": 309.12,
    "per_y": 5.21
  },
  {
    "spkid": 20000036,
    "full_name": "    36 Atalante (A855 TA)",
    "pdes": "36",
    "name": "Atalante",
    "neo": "N",
    "pha": "N",
    "H": 8.57,
    "diameter": 132.842,
    "albedo": 0.029,
    "e": 0.3063,
    "a": 2.745,
    "q": 1.904,
    "i": 18.37,
    "om": 358.16,
    "w": 47.77,
    "ma": 99.56,
    "per_y": 4.55
  },
  {
    "spkid": 20000037,
    "full_name": "    37 Fides (A855 TB)",
    "pdes": "37",
    "name": "Fides",
    "neo": "N",
    "pha": "N",
    "H": 7.34,
    "diameter": 108.35,
    "albedo": 0.1826,
    "e": 0.1747,
    "a": 2.643,
    "q": 2.181,
    "i": 3.07,
    "om": 7.24,
    "w": 62.31,
    "ma": 172.87,
    "per_y": 4.3
  },
  {
    "spkid": 20000038,
    "full_name": "    38 Leda (A856 AA)",
    "pdes": "38",
    "name": "Leda",
    "neo": "N",
    "pha": "N",
    "H": 8.49,
    "diameter": 92.255,
    "albedo": 0.055,
    "e": 0.1509,
    "a": 2.743,
    "q": 2.329,
    "i": 6.95,
    "om": 295.49,
    "w": 169.78,
    "ma": 165.76,
    "per_y": 4.54
  },
  {
    "spkid": 20000039,
    "full_name": "    39 Laetitia (A856 CA)",
    "pdes": "39",
    "name": "Laetitia",
    "neo": "N",
    "pha": "N",
    "H": 5.97,
    "diameter": 179.484,
    "albedo": 0.269,
    "e": 0.1131,
    "a": 2.771,
    "q": 2.458,
    "i": 10.38,
    "om": 156.84,
    "w": 210.28,
    "ma": 93.7,
    "per_y": 4.61
  },
  {
    "spkid": 20000040,
    "full_name": "    40 Harmonia (A856 FA)",
    "pdes": "40",
    "name": "Harmonia",
    "neo": "N",
    "pha": "N",
    "H": 6.55,
    "diameter": 111.251,
    "albedo": 0.22,
    "e": 0.0463,
    "a": 2.268,
    "q": 2.163,
    "i": 4.26,
    "om": 94.16,
    "w": 269.84,
    "ma": 80.29,
    "per_y": 3.42
  },
  {
    "spkid": 20000041,
    "full_name": "    41 Daphne (A856 KA)",
    "pdes": "41",
    "name": "Daphne",
    "neo": "N",
    "pha": "N",
    "H": 7.58,
    "diameter": 205.495,
    "albedo": 0.059,
    "e": 0.2704,
    "a": 2.769,
    "q": 2.02,
    "i": 15.73,
    "om": 177.62,
    "w": 46.92,
    "ma": 288.44,
    "per_y": 4.61
  },
  {
    "spkid": 20000042,
    "full_name": "    42 Isis (A856 KB)",
    "pdes": "42",
    "name": "Isis",
    "neo": "N",
    "pha": "N",
    "H": 7.7,
    "diameter": 110.997,
    "albedo": 0.139,
    "e": 0.2219,
    "a": 2.444,
    "q": 1.901,
    "i": 8.51,
    "om": 84.17,
    "w": 237.41,
    "ma": 103.04,
    "per_y": 3.82
  },
  {
    "spkid": 20000043,
    "full_name": "    43 Ariadne (A857 GA)",
    "pdes": "43",
    "name": "Ariadne",
    "neo": "N",
    "pha": "N",
    "H": 7.94,
    "diameter": 71.34,
    "albedo": 0.234,
    "e": 0.1681,
    "a": 2.203,
    "q": 1.833,
    "i": 3.47,
    "om": 264.75,
    "w": 16.19,
    "ma": 141.45,
    "per_y": 3.27
  },
  {
    "spkid": 20000044,
    "full_name": "    44 Nysa (A857 KA)",
    "pdes": "44",
    "name": "Nysa",
    "neo": "N",
    "pha": "N",
    "H": 6.75,
    "diameter": 70.64,
    "albedo": 0.482,
    "e": 0.1499,
    "a": 2.423,
    "q": 2.06,
    "i": 3.71,
    "om": 131.48,
    "w": 343.99,
    "ma": 349.11,
    "per_y": 3.77
  },
  {
    "spkid": 20000045,
    "full_name": "    45 Eugenia (A857 MA)",
    "pdes": "45",
    "name": "Eugenia",
    "neo": "N",
    "pha": "N",
    "H": 7.77,
    "diameter": 202.327,
    "albedo": 0.045,
    "e": 0.0822,
    "a": 2.722,
    "q": 2.498,
    "i": 6.61,
    "om": 147.56,
    "w": 87.29,
    "ma": 206.55,
    "per_y": 4.49
  },
  {
    "spkid": 20000046,
    "full_name": "    46 Hestia (A857 QA)",
    "pdes": "46",
    "name": "Hestia",
    "neo": "N",
    "pha": "N",
    "H": 8.51,
    "diameter": 131.471,
    "albedo": 0.046,
    "e": 0.1719,
    "a": 2.526,
    "q": 2.092,
    "i": 2.35,
    "om": 181.06,
    "w": 177.05,
    "ma": 299.75,
    "per_y": 4.01
  },
  {
    "spkid": 20000047,
    "full_name": "    47 Aglaja (A857 RA)",
    "pdes": "47",
    "name": "Aglaja",
    "neo": "N",
    "pha": "N",
    "H": 8.17,
    "diameter": 168.174,
    "albedo": 0.082,
    "e": 0.1333,
    "a": 2.881,
    "q": 2.497,
    "i": 4.97,
    "om": 2.69,
    "w": 316.21,
    "ma": 174.33,
    "per_y": 4.89
  },
  {
    "spkid": 20000048,
    "full_name": "    48 Doris (A857 SA)",
    "pdes": "48",
    "name": "Doris",
    "neo": "N",
    "pha": "N",
    "H": 7.12,
    "diameter": 216.473,
    "albedo": 0.065,
    "e": 0.0663,
    "a": 3.113,
    "q": 2.907,
    "i": 6.56,
    "om": 183.43,
    "w": 251.36,
    "ma": 141.75,
    "per_y": 5.49
  },
  {
    "spkid": 20000049,
    "full_name": "    49 Pales (A857 SB)",
    "pdes": "49",
    "name": "Pales",
    "neo": "N",
    "pha": "N",
    "H": 8,
    "diameter": 166.252,
    "albedo": 0.048,
    "e": 0.2215,
    "a": 3.098,
    "q": 2.412,
    "i": 3.2,
    "om": 284.99,
    "w": 113.45,
    "ma": 312.96,
    "per_y": 5.45
  },
  {
    "spkid": 20000050,
    "full_name": "    50 Virginia (A857 TA)",
    "pdes": "50",
    "name": "Virginia",
    "neo": "N",
    "pha": "N",
    "H": 9.44,
    "diameter": 84.074,
    "albedo": 0.05,
    "e": 0.2846,
    "a": 2.651,
    "q": 1.897,
    "i": 2.84,
    "om": 173.45,
    "w": 200.08,
    "ma": 346.62,
    "per_y": 4.32
  },
  {
    "spkid": 20000051,
    "full_name": "    51 Nemausa (A858 BA)",
    "pdes": "51",
    "name": "Nemausa",
    "neo": "N",
    "pha": "N",
    "H": 7.73,
    "diameter": 138.159,
    "albedo": 0.1,
    "e": 0.0659,
    "a": 2.366,
    "q": 2.21,
    "i": 9.97,
    "om": 175.88,
    "w": 2.28,
    "ma": 26.55,
    "per_y": 3.64
  },
  {
    "spkid": 20000052,
    "full_name": "    52 Europa (A858 CA)",
    "pdes": "52",
    "name": "Europa",
    "neo": "N",
    "pha": "N",
    "H": 6.65,
    "diameter": 303.918,
    "albedo": 0.057,
    "e": 0.112,
    "a": 3.092,
    "q": 2.746,
    "i": 7.48,
    "om": 128.58,
    "w": 342.96,
    "ma": 312.53,
    "per_y": 5.44
  },
  {
    "spkid": 20000053,
    "full_name": "    53 Kalypso (A858 GA)",
    "pdes": "53",
    "name": "Kalypso",
    "neo": "N",
    "pha": "N",
    "H": 8.9,
    "diameter": 97.262,
    "albedo": 0.028,
    "e": 0.203,
    "a": 2.619,
    "q": 2.087,
    "i": 5.18,
    "om": 143.43,
    "w": 314.39,
    "ma": 261.11,
    "per_y": 4.24
  },
  {
    "spkid": 20000054,
    "full_name": "    54 Alexandra (A858 RA)",
    "pdes": "54",
    "name": "Alexandra",
    "neo": "N",
    "pha": "N",
    "H": 7.96,
    "diameter": 160.12,
    "albedo": 0.059,
    "e": 0.1983,
    "a": 2.713,
    "q": 2.175,
    "i": 11.83,
    "om": 313.01,
    "w": 346.19,
    "ma": 186.82,
    "per_y": 4.47
  },
  {
    "spkid": 20000055,
    "full_name": "    55 Pandora (A858 RB)",
    "pdes": "55",
    "name": "Pandora",
    "neo": "N",
    "pha": "N",
    "H": 7.84,
    "diameter": 84.794,
    "albedo": 0.204,
    "e": 0.1451,
    "a": 2.758,
    "q": 2.358,
    "i": 7.18,
    "om": 10.28,
    "w": 4.93,
    "ma": 157.53,
    "per_y": 4.58
  },
  {
    "spkid": 20000056,
    "full_name": "    56 Melete (A857 RB)",
    "pdes": "56",
    "name": "Melete",
    "neo": "N",
    "pha": "N",
    "H": 8.53,
    "diameter": 121.333,
    "albedo": 0.057,
    "e": 0.2369,
    "a": 2.597,
    "q": 1.982,
    "i": 8.08,
    "om": 192.93,
    "w": 104.92,
    "ma": 92.05,
    "per_y": 4.19
  },
  {
    "spkid": 20000057,
    "full_name": "    57 Mnemosyne (A859 SA)",
    "pdes": "57",
    "name": "Mnemosyne",
    "neo": "N",
    "pha": "N",
    "H": 6.94,
    "diameter": 112.59,
    "albedo": 0.2149,
    "e": 0.108,
    "a": 3.156,
    "q": 2.815,
    "i": 15.23,
    "om": 198.89,
    "w": 210.99,
    "ma": 205.17,
    "per_y": 5.61
  },
  {
    "spkid": 20000058,
    "full_name": "    58 Concordia (A860 FA)",
    "pdes": "58",
    "name": "Concordia",
    "neo": "N",
    "pha": "N",
    "H": 9.02,
    "diameter": 106.517,
    "albedo": 0.044,
    "e": 0.0457,
    "a": 2.7,
    "q": 2.576,
    "i": 5.07,
    "om": 161.05,
    "w": 33.86,
    "ma": 108.5,
    "per_y": 4.44
  },
  {
    "spkid": 20000059,
    "full_name": "    59 Elpis (A860 RA)",
    "pdes": "59",
    "name": "Elpis",
    "neo": "N",
    "pha": "N",
    "H": 8.1,
    "diameter": 165.119,
    "albedo": 0.044,
    "e": 0.1166,
    "a": 2.714,
    "q": 2.397,
    "i": 8.65,
    "om": 169.91,
    "w": 211.14,
    "ma": 328.29,
    "per_y": 4.47
  },
  {
    "spkid": 20000060,
    "full_name": "    60 Echo (A860 RB)",
    "pdes": "60",
    "name": "Echo",
    "neo": "N",
    "pha": "N",
    "H": 8.64,
    "diameter": 43.218,
    "albedo": 0.373,
    "e": 0.1845,
    "a": 2.393,
    "q": 1.951,
    "i": 3.6,
    "om": 191.52,
    "w": 270.86,
    "ma": 128.09,
    "per_y": 3.7
  },
  {
    "spkid": 20000061,
    "full_name": "    61 Danae (A860 RC)",
    "pdes": "61",
    "name": "Danae",
    "neo": "N",
    "pha": "N",
    "H": 7.74,
    "diameter": 85.937,
    "albedo": 0.203,
    "e": 0.1638,
    "a": 2.985,
    "q": 2.496,
    "i": 18.21,
    "om": 333.54,
    "w": 12.89,
    "ma": 10.4,
    "per_y": 5.16
  },
  {
    "spkid": 20000062,
    "full_name": "    62 Erato (A860 RD)",
    "pdes": "62",
    "name": "Erato",
    "neo": "N",
    "pha": "N",
    "H": 8.91,
    "diameter": 106.921,
    "albedo": 0.048,
    "e": 0.168,
    "a": 3.13,
    "q": 2.604,
    "i": 2.24,
    "om": 125.1,
    "w": 277.76,
    "ma": 305.55,
    "per_y": 5.54
  },
  {
    "spkid": 20000063,
    "full_name": "    63 Ausonia (A861 CA)",
    "pdes": "63",
    "name": "Ausonia",
    "neo": "N",
    "pha": "N",
    "H": 7.13,
    "diameter": 116.044,
    "albedo": 0.125,
    "e": 0.1282,
    "a": 2.395,
    "q": 2.088,
    "i": 5.77,
    "om": 337.68,
    "w": 295.62,
    "ma": 58.11,
    "per_y": 3.71
  },
  {
    "spkid": 20000064,
    "full_name": "    64 Angelina (A861 EA)",
    "pdes": "64",
    "name": "Angelina",
    "neo": "N",
    "pha": "N",
    "H": 7.74,
    "diameter": 58.292,
    "albedo": 0.483,
    "e": 0.1265,
    "a": 2.681,
    "q": 2.342,
    "i": 1.31,
    "om": 308.96,
    "w": 181.07,
    "ma": 214.91,
    "per_y": 4.39
  },
  {
    "spkid": 20000066,
    "full_name": "    66 Maja (A861 GA)",
    "pdes": "66",
    "name": "Maja",
    "neo": "N",
    "pha": "N",
    "H": 9.48,
    "diameter": 71.82,
    "albedo": 0.016,
    "e": 0.1721,
    "a": 2.647,
    "q": 2.191,
    "i": 3.04,
    "om": 7.48,
    "w": 43.47,
    "ma": 209.25,
    "per_y": 4.31
  },
  {
    "spkid": 20000067,
    "full_name": "    67 Asia (A861 HA)",
    "pdes": "67",
    "name": "Asia",
    "neo": "N",
    "pha": "N",
    "H": 8.38,
    "diameter": 56.309,
    "albedo": 0.228,
    "e": 0.1857,
    "a": 2.422,
    "q": 1.972,
    "i": 6.02,
    "om": 202.25,
    "w": 107.59,
    "ma": 185.51,
    "per_y": 3.77
  },
  {
    "spkid": 20000068,
    "full_name": "    68 Leto (A861 HB)",
    "pdes": "68",
    "name": "Leto",
    "neo": "N",
    "pha": "N",
    "H": 6.9,
    "diameter": 122.509,
    "albedo": 0.228,
    "e": 0.1843,
    "a": 2.783,
    "q": 2.27,
    "i": 7.96,
    "om": 44.05,
    "w": 304.89,
    "ma": 50.66,
    "per_y": 4.64
  },
  {
    "spkid": 20000069,
    "full_name": "    69 Hesperia (A861 HC)",
    "pdes": "69",
    "name": "Hesperia",
    "neo": "N",
    "pha": "N",
    "H": 7.21,
    "diameter": 138.13,
    "albedo": 0.1402,
    "e": 0.169,
    "a": 2.977,
    "q": 2.474,
    "i": 8.59,
    "om": 184.89,
    "w": 288.15,
    "ma": 42.8,
    "per_y": 5.14
  },
  {
    "spkid": 20000070,
    "full_name": "    70 Panopaea (A861 JA)",
    "pdes": "70",
    "name": "Panopaea",
    "neo": "N",
    "pha": "N",
    "H": 8.17,
    "diameter": 127.911,
    "albedo": 0.038,
    "e": 0.183,
    "a": 2.614,
    "q": 2.135,
    "i": 11.6,
    "om": 47.64,
    "w": 255.45,
    "ma": 269.57,
    "per_y": 4.23
  },
  {
    "spkid": 20000071,
    "full_name": "    71 Niobe (A861 PA)",
    "pdes": "71",
    "name": "Niobe",
    "neo": "N",
    "pha": "N",
    "H": 7.24,
    "diameter": 83.42,
    "albedo": 0.3052,
    "e": 0.177,
    "a": 2.755,
    "q": 2.267,
    "i": 23.24,
    "om": 315.91,
    "w": 267.03,
    "ma": 61.17,
    "per_y": 4.57
  },
  {
    "spkid": 20000072,
    "full_name": "    72 Feronia (A861 KA)",
    "pdes": "72",
    "name": "Feronia",
    "neo": "N",
    "pha": "N",
    "H": 9.07,
    "diameter": 74.966,
    "albedo": 0.083,
    "e": 0.1214,
    "a": 2.266,
    "q": 1.991,
    "i": 5.42,
    "om": 207.93,
    "w": 102.71,
    "ma": 340.3,
    "per_y": 3.41
  },
  {
    "spkid": 20000073,
    "full_name": "    73 Klytia (A862 GA)",
    "pdes": "73",
    "name": "Klytia",
    "neo": "N",
    "pha": "N",
    "H": 9.06,
    "diameter": 44.59,
    "albedo": 0.223,
    "e": 0.0423,
    "a": 2.664,
    "q": 2.551,
    "i": 2.37,
    "om": 6.83,
    "w": 56.77,
    "ma": 336.12,
    "per_y": 4.35
  },
  {
    "spkid": 20000074,
    "full_name": "    74 Galatea (A862 QA)",
    "pdes": "74",
    "name": "Galatea",
    "neo": "N",
    "pha": "N",
    "H": 8.93,
    "diameter": 118.71,
    "albedo": 0.0431,
    "e": 0.2368,
    "a": 2.782,
    "q": 2.123,
    "i": 4.07,
    "om": 197.07,
    "w": 175,
    "ma": 64.24,
    "per_y": 4.64
  },
  {
    "spkid": 20000075,
    "full_name": "    75 Eurydike (A862 SA)",
    "pdes": "75",
    "name": "Eurydike",
    "neo": "N",
    "pha": "N",
    "H": 9.23,
    "diameter": 62.377,
    "albedo": 0.117,
    "e": 0.3053,
    "a": 2.673,
    "q": 1.857,
    "i": 4.99,
    "om": 359.13,
    "w": 339.65,
    "ma": 142.42,
    "per_y": 4.37
  },
  {
    "spkid": 20000077,
    "full_name": "    77 Frigga (A862 VA)",
    "pdes": "77",
    "name": "Frigga",
    "neo": "N",
    "pha": "N",
    "H": 8.59,
    "diameter": 61.39,
    "albedo": 0.177,
    "e": 0.1335,
    "a": 2.667,
    "q": 2.311,
    "i": 2.42,
    "om": 1.05,
    "w": 61.12,
    "ma": 106.84,
    "per_y": 4.36
  },
  {
    "spkid": 20000078,
    "full_name": "    78 Diana (A863 EA)",
    "pdes": "78",
    "name": "Diana",
    "neo": "N",
    "pha": "N",
    "H": 8.3,
    "diameter": 120.6,
    "albedo": 0.0706,
    "e": 0.2035,
    "a": 2.623,
    "q": 2.089,
    "i": 8.68,
    "om": 333.29,
    "w": 153.28,
    "ma": 155.06,
    "per_y": 4.25
  },
  {
    "spkid": 20000079,
    "full_name": "    79 Eurynome (A863 RA)",
    "pdes": "79",
    "name": "Eurynome",
    "neo": "N",
    "pha": "N",
    "H": 7.78,
    "diameter": 63.479,
    "albedo": 0.287,
    "e": 0.191,
    "a": 2.444,
    "q": 1.977,
    "i": 4.61,
    "om": 206.5,
    "w": 201.39,
    "ma": 127.33,
    "per_y": 3.82
  },
  {
    "spkid": 20000080,
    "full_name": "    80 Sappho (A864 JA)",
    "pdes": "80",
    "name": "Sappho",
    "neo": "N",
    "pha": "N",
    "H": 8.05,
    "diameter": 68.563,
    "albedo": 0.206,
    "e": 0.1997,
    "a": 2.296,
    "q": 1.838,
    "i": 8.68,
    "om": 218.64,
    "w": 139.69,
    "ma": 57.26,
    "per_y": 3.48
  },
  {
    "spkid": 20000081,
    "full_name": "    81 Terpsichore (A864 SA)",
    "pdes": "81",
    "name": "Terpsichore",
    "neo": "N",
    "pha": "N",
    "H": 8.69,
    "diameter": 117.727,
    "albedo": 0.045,
    "e": 0.2118,
    "a": 2.852,
    "q": 2.248,
    "i": 7.8,
    "om": 0.9,
    "w": 51.22,
    "ma": 118.67,
    "per_y": 4.82
  },
  {
    "spkid": 20000082,
    "full_name": "    82 Alkmene (A864 WA)",
    "pdes": "82",
    "name": "Alkmene",
    "neo": "N",
    "pha": "N",
    "H": 8.26,
    "diameter": 57.621,
    "albedo": 0.167,
    "e": 0.2211,
    "a": 2.764,
    "q": 2.153,
    "i": 2.83,
    "om": 25.41,
    "w": 110.72,
    "ma": 331.3,
    "per_y": 4.6
  },
  {
    "spkid": 20000083,
    "full_name": "    83 Beatrix (A865 HA)",
    "pdes": "83",
    "name": "Beatrix",
    "neo": "N",
    "pha": "N",
    "H": 8.74,
    "diameter": 110.503,
    "albedo": 0.05,
    "e": 0.083,
    "a": 2.432,
    "q": 2.23,
    "i": 4.97,
    "om": 27.66,
    "w": 169.89,
    "ma": 131.97,
    "per_y": 3.79
  },
  {
    "spkid": 20000084,
    "full_name": "    84 Klio (A865 QA)",
    "pdes": "84",
    "name": "Klio",
    "neo": "N",
    "pha": "N",
    "H": 9.32,
    "diameter": 79.16,
    "albedo": 0.0527,
    "e": 0.2355,
    "a": 2.362,
    "q": 1.806,
    "i": 9.31,
    "om": 327.5,
    "w": 15.09,
    "ma": 38.89,
    "per_y": 3.63
  },
  {
    "spkid": 20000085,
    "full_name": "    85 Io (A865 SA)",
    "pdes": "85",
    "name": "Io",
    "neo": "N",
    "pha": "N",
    "H": 7.94,
    "diameter": 154.79,
    "albedo": 0.0666,
    "e": 0.1931,
    "a": 2.653,
    "q": 2.141,
    "i": 11.96,
    "om": 203.04,
    "w": 122.9,
    "ma": 48.27,
    "per_y": 4.32
  },
  {
    "spkid": 20000086,
    "full_name": "    86 Semele (A866 AA)",
    "pdes": "86",
    "name": "Semele",
    "neo": "N",
    "pha": "N",
    "H": 8.7,
    "diameter": 109.929,
    "albedo": 0.056,
    "e": 0.2177,
    "a": 3.106,
    "q": 2.43,
    "i": 4.82,
    "om": 86.06,
    "w": 308.93,
    "ma": 63.96,
    "per_y": 5.47
  },
  {
    "spkid": 20000088,
    "full_name": "    88 Thisbe (A866 LA)",
    "pdes": "88",
    "name": "Thisbe",
    "neo": "N",
    "pha": "N",
    "H": 7.25,
    "diameter": 232,
    "albedo": 0.0671,
    "e": 0.1653,
    "a": 2.767,
    "q": 2.31,
    "i": 5.23,
    "om": 276.32,
    "w": 36.94,
    "ma": 201.53,
    "per_y": 4.6
  },
  {
    "spkid": 20000089,
    "full_name": "    89 Julia (A866 PA)",
    "pdes": "89",
    "name": "Julia",
    "neo": "N",
    "pha": "N",
    "H": 6.37,
    "diameter": 145.483,
    "albedo": 0.189,
    "e": 0.1838,
    "a": 2.551,
    "q": 2.082,
    "i": 16.12,
    "om": 311.52,
    "w": 45.19,
    "ma": 358.38,
    "per_y": 4.07
  },
  {
    "spkid": 20000090,
    "full_name": "    90 Antiope (A866 TA)",
    "pdes": "90",
    "name": "Antiope",
    "neo": "N",
    "pha": "N",
    "H": 8.43,
    "diameter": 115.974,
    "albedo": 0.058,
    "e": 0.1724,
    "a": 3.141,
    "q": 2.6,
    "i": 2.21,
    "om": 69.89,
    "w": 244.37,
    "ma": 209.1,
    "per_y": 5.57
  },
  {
    "spkid": 20000091,
    "full_name": "    91 Aegina (A867 NA)",
    "pdes": "91",
    "name": "Aegina",
    "neo": "N",
    "pha": "N",
    "H": 9.13,
    "diameter": 103.402,
    "albedo": 0.048,
    "e": 0.1082,
    "a": 2.59,
    "q": 2.31,
    "i": 2.1,
    "om": 10.39,
    "w": 74.31,
    "ma": 14.39,
    "per_y": 4.17
  },
  {
    "spkid": 20000092,
    "full_name": "    92 Undina (A867 NA)",
    "pdes": "92",
    "name": "Undina",
    "neo": "N",
    "pha": "N",
    "H": 6.71,
    "diameter": 126.42,
    "albedo": 0.2509,
    "e": 0.1049,
    "a": 3.185,
    "q": 2.851,
    "i": 9.92,
    "om": 101.39,
    "w": 236.68,
    "ma": 238.16,
    "per_y": 5.69
  },
  {
    "spkid": 20000093,
    "full_name": "    93 Minerva (A867 QA)",
    "pdes": "93",
    "name": "Minerva",
    "neo": "N",
    "pha": "N",
    "H": 7.9,
    "diameter": 154.155,
    "albedo": 0.056,
    "e": 0.1429,
    "a": 2.753,
    "q": 2.36,
    "i": 8.54,
    "om": 3.81,
    "w": 275.93,
    "ma": 273.1,
    "per_y": 4.57
  },
  {
    "spkid": 20000094,
    "full_name": "    94 Aurora (A867 RA)",
    "pdes": "94",
    "name": "Aurora",
    "neo": "N",
    "pha": "N",
    "H": 7.72,
    "diameter": 204.89,
    "albedo": 0.0395,
    "e": 0.0964,
    "a": 3.156,
    "q": 2.852,
    "i": 7.97,
    "om": 2.52,
    "w": 60.53,
    "ma": 10.64,
    "per_y": 5.61
  },
  {
    "spkid": 20000095,
    "full_name": "    95 Arethusa (A867 WA)",
    "pdes": "95",
    "name": "Arethusa",
    "neo": "N",
    "pha": "N",
    "H": 7.97,
    "diameter": 147.969,
    "albedo": 0.058,
    "e": 0.1526,
    "a": 3.064,
    "q": 2.596,
    "i": 13.01,
    "om": 242.94,
    "w": 152.77,
    "ma": 156.26,
    "per_y": 5.36
  },
  {
    "spkid": 20000096,
    "full_name": "    96 Aegle (A868 DA)",
    "pdes": "96",
    "name": "Aegle",
    "neo": "N",
    "pha": "N",
    "H": 7.67,
    "diameter": 177.774,
    "albedo": 0.048,
    "e": 0.1423,
    "a": 3.049,
    "q": 2.615,
    "i": 15.98,
    "om": 321.47,
    "w": 207.93,
    "ma": 189.17,
    "per_y": 5.32
  },
  {
    "spkid": 20000097,
    "full_name": "    97 Klotho (A868 DB)",
    "pdes": "97",
    "name": "Klotho",
    "neo": "N",
    "pha": "N",
    "H": 7.79,
    "diameter": 100.717,
    "albedo": 0.128,
    "e": 0.2576,
    "a": 2.668,
    "q": 1.981,
    "i": 11.78,
    "om": 159.59,
    "w": 268.43,
    "ma": 134.06,
    "per_y": 4.36
  },
  {
    "spkid": 20000098,
    "full_name": "    98 Ianthe (A868 HA)",
    "pdes": "98",
    "name": "Ianthe",
    "neo": "N",
    "pha": "N",
    "H": 8.96,
    "diameter": 132.788,
    "albedo": 0.029,
    "e": 0.1879,
    "a": 2.687,
    "q": 2.182,
    "i": 15.58,
    "om": 353.87,
    "w": 158.16,
    "ma": 303.38,
    "per_y": 4.41
  },
  {
    "spkid": 20000099,
    "full_name": "    99 Dike (A868 KA)",
    "pdes": "99",
    "name": "Dike",
    "neo": "N",
    "pha": "N",
    "H": 9.47,
    "diameter": 67.354,
    "albedo": 0.065,
    "e": 0.1977,
    "a": 2.663,
    "q": 2.137,
    "i": 13.86,
    "om": 41.4,
    "w": 195.43,
    "ma": 68.65,
    "per_y": 4.35
  },
  {
    "spkid": 20000100,
    "full_name": "   100 Hekate (A868 NA)",
    "pdes": "100",
    "name": "Hekate",
    "neo": "N",
    "pha": "N",
    "H": 7.75,
    "diameter": 85.734,
    "albedo": 0.205,
    "e": 0.168,
    "a": 3.09,
    "q": 2.571,
    "i": 6.43,
    "om": 127.16,
    "w": 183.55,
    "ma": 323.24,
    "per_y": 5.43
  },
  {
    "spkid": 20000101,
    "full_name": "   101 Helena (A868 PA)",
    "pdes": "101",
    "name": "Helena",
    "neo": "N",
    "pha": "N",
    "H": 8.39,
    "diameter": 65.84,
    "albedo": 0.1898,
    "e": 0.1405,
    "a": 2.584,
    "q": 2.221,
    "i": 10.19,
    "om": 343.36,
    "w": 347.76,
    "ma": 323.65,
    "per_y": 4.15
  },
  {
    "spkid": 20000102,
    "full_name": "   102 Miriam (A868 QA)",
    "pdes": "102",
    "name": "Miriam",
    "neo": "N",
    "pha": "N",
    "H": 9.47,
    "diameter": 82.595,
    "albedo": 0.051,
    "e": 0.2513,
    "a": 2.664,
    "q": 1.995,
    "i": 5.17,
    "om": 210.73,
    "w": 147.48,
    "ma": 75.16,
    "per_y": 4.35
  },
  {
    "spkid": 20000103,
    "full_name": "   103 Hera (A868 RA)",
    "pdes": "103",
    "name": "Hera",
    "neo": "N",
    "pha": "N",
    "H": 7.74,
    "diameter": 83.908,
    "albedo": 0.217,
    "e": 0.081,
    "a": 2.703,
    "q": 2.484,
    "i": 5.43,
    "om": 135.95,
    "w": 190.39,
    "ma": 165.6,
    "per_y": 4.44
  },
  {
    "spkid": 20000104,
    "full_name": "   104 Klymene (A868 RB)",
    "pdes": "104",
    "name": "Klymene",
    "neo": "N",
    "pha": "N",
    "H": 8.53,
    "diameter": 136.553,
    "albedo": 0.052,
    "e": 0.1625,
    "a": 3.143,
    "q": 2.633,
    "i": 2.79,
    "om": 41.64,
    "w": 31.92,
    "ma": 342.27,
    "per_y": 5.57
  }
];
// Label Creation Function
function createLabel(text, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'Bold 24px Arial';
    context.fillStyle = '#4fc3f7';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.shadowColor = 'rgba(0, 0, 0, 0.8)';
    context.shadowBlur = 8;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 2.5, 1);
    sprite.position.copy(position);
    
    return sprite;
}

// UI Panel Management
function initUI() {
    const sidebarIcons = document.querySelectorAll('.sidebar-icon');
    const panels = document.querySelectorAll('.side-panel');
    
    sidebarIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const panelId = icon.dataset.panel + '-panel';
            const targetPanel = document.getElementById(panelId);
            
            panels.forEach(p => p.classList.remove('open'));
            sidebarIcons.forEach(i => i.classList.remove('active'));
            
            if (targetPanel) {
                targetPanel.classList.add('open');
                icon.classList.add('active');
            }
        });
    });
    
    document.querySelectorAll('.close-panel').forEach(btn => {
        btn.addEventListener('click', () => {
            panels.forEach(p => p.classList.remove('open'));
            sidebarIcons.forEach(i => i.classList.remove('active'));
        });
    });
}

function togglePause() {
    isPaused = !isPaused;
}

function updateTimeWarp(sliderValue) {
    const label = document.getElementById('speedLabel');
    sliderValue = parseInt(sliderValue);
    
    if (sliderValue <= 10) {
        speedMultiplier = 1 + sliderValue * 0.9;
        label.textContent = `${speedMultiplier.toFixed(1)} Day/s`;
    } else if (sliderValue <= 50) {
        const factor = (sliderValue - 10) / 40;
        speedMultiplier = 10 + factor * (365 - 10);
        label.textContent = `${Math.round(speedMultiplier)} Days/s`;
    } else {
        const years = 1 + (sliderValue - 50) / 10;
        speedMultiplier = years * 365.25;
        label.textContent = `${years.toFixed(1)} Year/s`;
    }
}

function init() {
    document.getElementById('loading').style.display = 'none';
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(0, 80, 150);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    createSun();
    createMercury();
    createVenus();
    createEarth();
    createMars();
    createJupiter();
    createSaturn();
    createUranus();
    createNeptune();
    
    addStarField(800);
    
    drawPlanetOrbit(orbitalParams.mercury, 0x9fd0ff);
    drawPlanetOrbit(orbitalParams.venus, 0xffe599);
    drawPlanetOrbit(orbitalParams.earth, 0x66ffff);
    drawPlanetOrbit(orbitalParams.mars, 0xff9966);
    drawPlanetOrbit(orbitalParams.jupiter, 0xffcc99);
    drawPlanetOrbit(orbitalParams.saturn, 0xffcc66);
    drawPlanetOrbit(orbitalParams.uranus, 0x99ffff);
    drawPlanetOrbit(orbitalParams.neptune, 0x6699ff);
    
    createAsteroidBelt(asteroidJsonData);
    addAsteroidInteraction(asteroidMeshes);
    
    celestialBodies = [
        { mesh: sun, ...planetData.sun },
        { mesh: mercury, ...planetData.mercury },
        { mesh: venus, ...planetData.venus },
        { mesh: earth, ...planetData.earth },
        { mesh: mars, ...planetData.mars },
        { mesh: jupiter, ...planetData.jupiter },
        { mesh: saturn, ...planetData.saturn },
        { mesh: uranus, ...planetData.uranus },
        { mesh: neptune, ...planetData.neptune }
    ];
    
    initUI();
    setupControls();
    populateAsteroidMenu();
    setupMenuInteraction();
    
    document.getElementById('object-count').textContent = asteroidMeshes.length + 9;
    
    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function setupControls() {
    const slider = document.getElementById('speedSlider');
    if (slider) {
        updateTimeWarp(slider.value);
        slider.addEventListener('input', (event) => {
            updateTimeWarp(event.target.value);
        });
    }
    
    document.getElementById('reset-camera')?.addEventListener('click', () => {
        camera.position.set(0, 80, 150);
        controls.target.set(0, 0, 0);
        controls.update();
    });
    
    document.getElementById('gravity-toggle')?.addEventListener('change', (e) => {
        gravityEnabled = e.target.checked;
    });
    
    const gSlider = document.getElementById('g-multiplier');
    if (gSlider) {
        gSlider.addEventListener('input', (e) => {
            gMultiplier = parseFloat(e.target.value);
            document.getElementById('g-value').textContent = `${gMultiplier.toFixed(1)}x`;
        });
    }
    
    document.getElementById('integrator')?.addEventListener('change', (e) => {
        integrator = e.target.value;
    });
    
    const asteroidScaleSlider = document.getElementById('asteroid-scale-slider');
    if (asteroidScaleSlider) {
        asteroidScaleSlider.addEventListener('input', (e) => {
            asteroidVisualScale = parseFloat(e.target.value);
            document.getElementById('asteroid-scale-value').textContent = `${asteroidVisualScale.toFixed(1)}x`;
            updateAsteroidScales();
        });
    }

    // Add event listener for the "Crash on Earth" button
    document.getElementById('crash-course')?.addEventListener('click', () => {
        if (!asteroidMeshes.selected) {
            alert('Please select an asteroid first from the Asteroid Explorer');
            return;
        }

        initiateCrashCourse(asteroidMeshes.selected);
    });

    // Deflection method event listeners
    document.getElementById('kinetic-impactor-btn')?.addEventListener('click', () => {
        const methodDescription = document.getElementById('method-description');
        const kineticControls = document.getElementById('kinetic-controls');
        const paintControls = document.getElementById('paint-controls');
        
        methodDescription.style.display = 'block';
        kineticControls.style.display = 'block';
        paintControls.style.display = 'none';
        
        document.getElementById('method-title').textContent = 'Kinetic Impactor';
        document.getElementById('method-text').textContent = 
            'Launch a high-speed spacecraft to collide with the asteroid. The momentum transfer from the impact deflects the asteroid\'s trajectory. This method was successfully demonstrated by NASA\'s DART mission in 2022, which impacted the asteroid Dimorphos and changed its orbital period.';
    });

    document.getElementById('surface-paint-btn')?.addEventListener('click', () => {
        const methodDescription = document.getElementById('method-description');
        const kineticControls = document.getElementById('kinetic-controls');
        const paintControls = document.getElementById('paint-controls');
        
        methodDescription.style.display = 'block';
        kineticControls.style.display = 'none';
        paintControls.style.display = 'block';
        
        document.getElementById('method-title').textContent = 'Surface Alteration (Yarkovsky Effect)';
        document.getElementById('method-text').textContent = 
            'Deploy a spacecraft to alter the asteroid\'s surface reflectivity by applying a coating or using reflectors. This changes how the asteroid absorbs and radiates heat, creating a tiny but continuous thrust via the Yarkovsky effect. Over years or decades, this gentle push can significantly alter the orbit.';
    });

    document.getElementById('launch-impactor')?.addEventListener('click', () => {
        if (!asteroidMeshes.selected) {
            alert('Please select an asteroid first from the Asteroid Explorer panel.');
            return;
        }
        if (deflectionActive) {
            alert('A deflection mission is already in progress. Please wait for it to complete.');
            return;
        }
        applyKineticImpactor(asteroidMeshes.selected);
    });

    document.getElementById('paint-active')?.addEventListener('click', () => {
        if (!asteroidMeshes.selected) {
            alert('Please select an asteroid first from the Asteroid Explorer panel.');
            return;
        }
        if (deflectionActive) {
            alert('A deflection mission is already in progress. Please wait for it to complete.');
            return;
        }
        applySurfaceAlteration(asteroidMeshes.selected);
    });

}

function updateAsteroidScales() {
    asteroidMeshes.forEach(asteroid => {
        asteroid.scale.setScalar(asteroidVisualScale);
    });
}

function createAsteroidBelt(asteroidData) {
    asteroidData.forEach((data) => {
        if (!data.a || !data.diameter || !data.per_y) return;

        const actualDiameterKm = data.diameter;
        const size = 0.3 + Math.log(actualDiameterKm + 1) * 0.3;
        const geometry = new THREE.SphereGeometry(size, 8, 8);

        const position = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);
            const noise = (Math.random() - 0.5) * 0.6;
            vertex.addScaledVector(vertex.clone().normalize(), noise);
            position.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            flatShading: true,
            emissive: 0x000000
        });

        const asteroid = new THREE.Mesh(geometry, material);
        asteroid.userData = { ...data };
        
        asteroid.userData.velocity = new THREE.Vector3(0, 0, 0);
        asteroid.userData.acceleration = new THREE.Vector3(0, 0, 0);
        
        const radiusKm = actualDiameterKm / 2;
        const radiusM = radiusKm * 1000;
        const volume = (4/3) * Math.PI * Math.pow(radiusM, 3);
        asteroid.userData.mass = volume * 3000;
        asteroid.userData.actualDiameter = actualDiameterKm;
        asteroid.userData.baseSize = size;

        asteroid.scale.setScalar(asteroidVisualScale);

        initializeAsteroidPosition(asteroid);
        initializeAsteroidVelocity(asteroid);
        
        scene.add(asteroid);
        asteroidMeshes.push(asteroid);
        asteroidMap.set(data.pdes, asteroid);
    });
}

function initializeAsteroidPosition(asteroidMesh) {
    const data = asteroidMesh.userData;
    
    if (data.rad === undefined) {
        data.rad = {
            i: data.i * (Math.PI / 180),
            om: data.om * (Math.PI / 180),
            w: data.w * (Math.PI / 180),
            ma: data.ma * (Math.PI / 180)
        };
    }
    
    const a = data.a;
    const e = data.e;
    const M = data.rad.ma;
    
    const E = solveKeplerEquation(M, e);
    
    const x_orb = a * (Math.cos(E) - e);
    const y_orb = a * Math.sqrt(1.0 - e * e) * Math.sin(E);
    
    const x = AU_SCALE * (x_orb * (Math.cos(data.rad.w) * Math.cos(data.rad.om) - Math.sin(data.rad.w) * Math.sin(data.rad.om) * Math.cos(data.rad.i)) - y_orb * (Math.sin(data.rad.w) * Math.cos(data.rad.om) + Math.cos(data.rad.w) * Math.sin(data.rad.om) * Math.cos(data.rad.i)));
    const z = AU_SCALE * (x_orb * (Math.cos(data.rad.w) * Math.sin(data.rad.om) + Math.sin(data.rad.w) * Math.cos(data.rad.om) * Math.cos(data.rad.i)) - y_orb * (Math.sin(data.rad.w) * Math.sin(data.rad.om) - Math.cos(data.rad.w) * Math.cos(data.rad.om) * Math.cos(data.rad.i)));
    const y = AU_SCALE * (x_orb * (Math.sin(data.rad.w) * Math.sin(data.rad.i)) + y_orb * (Math.cos(data.rad.w) * Math.sin(data.rad.i)));
    
    asteroidMesh.position.set(x, y, z);
}

function solveKeplerEquation(M, e, tolerance = 1e-6) {
    let E = M;
    let delta = 1;
    let iterations = 0;
    const maxIterations = 20;
    
    while (Math.abs(delta) > tolerance && iterations < maxIterations) {
        delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        E -= delta;
        iterations++;
    }
    
    return E;
}

function initializeAsteroidVelocity(asteroidMesh) {
    const data = asteroidMesh.userData;
    
    const a_m = data.a * AU_TO_M;
    const r_vec = asteroidMesh.position.clone();
    const r = r_vec.length() * AU_TO_M / AU_SCALE;
    
    if (r < 1e6) return;
    
    const mu = G * planetData.sun.mass;
    const v_mag = Math.sqrt(mu * (2/r - 1/a_m));
    
    const pos = r_vec.clone().normalize();
    const orbitalNormal = new THREE.Vector3(
        Math.sin(data.rad.i) * Math.sin(data.rad.om),
        Math.cos(data.rad.i),
        -Math.sin(data.rad.i) * Math.cos(data.rad.om)
    );
    
    const velocityDir = new THREE.Vector3().crossVectors(orbitalNormal, pos).normalize();
    
    const v_sim = v_mag * DAY_TO_S / (AU_TO_M / AU_SCALE);
    
    data.velocity.copy(velocityDir.multiplyScalar(v_sim));
}

function calculateGravitationalForce(body1, body2) {
    const r = new THREE.Vector3().subVectors(body2.position, body1.position);
    const distance = r.length() * (AU_TO_M / AU_SCALE);
    
    if (distance < 1e6) return new THREE.Vector3(0, 0, 0);
    
    const forceMagnitude = (G * gMultiplier * body1.userData.mass * body2.mass) / (distance * distance);
    const acceleration = forceMagnitude / body1.userData.mass;
    const acc_sim = acceleration * Math.pow(DAY_TO_S, 2) / (AU_TO_M / AU_SCALE);
    
    return r.normalize().multiplyScalar(acc_sim);
}

function updateAsteroidWithGravity(asteroidMesh, dt) {
    if (!gravityEnabled) {
        updateAsteroidKeplerian(asteroidMesh);
        return;
    }
    
    const data = asteroidMesh.userData;
    data.acceleration.set(0, 0, 0);
    
    celestialBodies.forEach(body => {
        const force = calculateGravitationalForce(asteroidMesh, body.mesh);
        data.acceleration.add(force);
    });
    
    if (integrator === 'verlet') {
        asteroidMesh.position.addScaledVector(data.velocity, dt);
        asteroidMesh.position.addScaledVector(data.acceleration, 0.5 * dt * dt);
        
        const oldAcceleration = data.acceleration.clone();
        
        data.acceleration.set(0, 0, 0);
        celestialBodies.forEach(body => {
            const force = calculateGravitationalForce(asteroidMesh, body.mesh);
            data.acceleration.add(force);
        });
        
        data.velocity.addScaledVector(oldAcceleration.add(data.acceleration), 0.5 * dt);
    } else if (integrator === 'euler') {
        data.velocity.addScaledVector(data.acceleration, dt);
        asteroidMesh.position.addScaledVector(data.velocity, dt);
    } else if (integrator === 'rk4') {
        const k1v = data.acceleration.clone().multiplyScalar(dt);
        const k1x = data.velocity.clone().multiplyScalar(dt);
        
        data.velocity.add(k1v);
        asteroidMesh.position.add(k1x);
    }
}

function updateAsteroidKeplerian(asteroidMesh) {
    const data = asteroidMesh.userData;
    const override = asteroidOverrides.get(data.pdes) || {};

    if (data.rad === undefined) {
        data.rad = {
            i: data.i * (Math.PI / 180),
            om: data.om * (Math.PI / 180),
            w: data.w * (Math.PI / 180),
            ma: data.ma * (Math.PI / 180)
        };
    }
    
    const a = override.a !== undefined ? override.a : data.a;
    const e = override.e !== undefined ? override.e : data.e;
    const i_rad = override.i !== undefined ? override.i * (Math.PI / 180) : data.rad.i;

    const orbitalPeriodInDays = override.a !== undefined ? 
        (data.per_y * Math.sqrt(Math.pow(a/data.a, 3))) * 365.25 : 
        data.per_y * 365.25;
    
    const meanMotion = (2 * Math.PI) / orbitalPeriodInDays;
    const M = data.rad.ma + meanMotion * simDay;
    const E = solveKeplerEquation(M, e);
    
    const x_orb = a * (Math.cos(E) - e);
    const y_orb = a * Math.sqrt(1.0 - e * e) * Math.sin(E);
    
    const x = AU_SCALE * (x_orb * (Math.cos(data.rad.w) * Math.cos(data.rad.om) - Math.sin(data.rad.w) * Math.sin(data.rad.om) * Math.cos(i_rad)) - y_orb * (Math.sin(data.rad.w) * Math.cos(data.rad.om) + Math.cos(data.rad.w) * Math.sin(data.rad.om) * Math.cos(i_rad)));
    const z = AU_SCALE * (x_orb * (Math.cos(data.rad.w) * Math.sin(data.rad.om) + Math.sin(data.rad.w) * Math.cos(data.rad.om) * Math.cos(i_rad)) - y_orb * (Math.sin(data.rad.w) * Math.sin(data.rad.om) - Math.cos(data.rad.w) * Math.cos(data.rad.om) * Math.cos(i_rad)));
    const y = AU_SCALE * (x_orb * (Math.sin(data.rad.w) * Math.sin(i_rad)) + y_orb * (Math.cos(data.rad.w) * Math.sin(i_rad)));
    
    asteroidMesh.position.set(x, y, z);
}

function drawAsteroidOrbit(data) {
    if (activeOrbitLine) {
        scene.remove(activeOrbitLine);
        activeOrbitLine.geometry.dispose();
        activeOrbitLine.material.dispose();
    }
    
    const override = asteroidOverrides.get(data.pdes) || {};
    const points = [];
    const segments = 256;
    
    const a = override.a !== undefined ? override.a : data.a;
    const e = override.e !== undefined ? override.e : data.e;
    const i_rad = override.i !== undefined ? override.i * (Math.PI / 180) : data.i * (Math.PI / 180);
    const om_rad = data.om * (Math.PI / 180);
    const w_rad = data.w * (Math.PI / 180);
    
    for (let i = 0; i <= segments; i++) {
        const M = (i / segments) * 2 * Math.PI;
        const E = solveKeplerEquation(M, e);
        
        const x_orb = a * (Math.cos(E) - e);
        const y_orb = a * Math.sqrt(1.0 - e * e) * Math.sin(E);
        
        const x = AU_SCALE * (x_orb * (Math.cos(w_rad) * Math.cos(om_rad) - Math.sin(w_rad) * Math.sin(om_rad) * Math.cos(i_rad)) - y_orb * (Math.sin(w_rad) * Math.cos(om_rad) + Math.cos(w_rad) * Math.sin(om_rad) * Math.cos(i_rad)));
        const z = AU_SCALE * (x_orb * (Math.cos(w_rad) * Math.sin(om_rad) + Math.sin(w_rad) * Math.cos(om_rad) * Math.cos(i_rad)) - y_orb * (Math.sin(w_rad) * Math.sin(om_rad) - Math.cos(w_rad) * Math.cos(om_rad) * Math.cos(i_rad)));
        const y = AU_SCALE * (x_orb * (Math.sin(w_rad) * Math.sin(i_rad)) + y_orb * (Math.cos(w_rad) * Math.sin(i_rad)));
        
        points.push(new THREE.Vector3(x, y, z));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    activeOrbitLine = new THREE.Line(geometry, material);
    scene.add(activeOrbitLine);
}

function populateAsteroidMenu() {
    const list = document.getElementById('asteroid-list');
    if (!list) return;

    const sortedAsteroids = [...asteroidJsonData].sort((a, b) => {
        const nameA = a.name || a.pdes;
        const nameB = b.name || b.pdes;
        return nameA.localeCompare(nameB, undefined, {numeric: true});
    });

    sortedAsteroids.forEach(data => {
        if (!data.diameter) return;
        const li = document.createElement('li');
        li.innerHTML = `<span>${data.name || data.pdes}</span> <span class="diameter">${Math.round(data.diameter)} km</span>`;
        li.dataset.pdes = data.pdes;
        list.appendChild(li);
    });
}

function setupMenuInteraction() {
    const list = document.getElementById('asteroid-list');
    const searchInput = document.getElementById('asteroid-search');

    list.addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (li && li.dataset.pdes) {
            const targetAsteroid = asteroidMap.get(li.dataset.pdes);
            if (targetAsteroid) {
                selectAsteroid(targetAsteroid);
            }
        }
    });

    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const listItems = list.getElementsByTagName('li');
        for (const li of listItems) {
            const asteroidName = li.textContent.toLowerCase();
            li.style.display = asteroidName.includes(searchTerm) ? 'flex' : 'none';
        }
    });
}

function selectAsteroid(asteroidMesh) {
    if (asteroidMeshes.selected) {
        asteroidMeshes.selected.material.emissive.setHex(0x000000);
    }
    
    if (selectedAsteroidLabel) {
        scene.remove(selectedAsteroidLabel);
        selectedAsteroidLabel = null;
    }
    
    const previouslySelectedLI = document.querySelector('#asteroid-list li.selected');
    if (previouslySelectedLI) {
        previouslySelectedLI.classList.remove('selected');
    }

    asteroidMesh.material.emissive.setHex(0x00ffff);
    asteroidMeshes.selected = asteroidMesh;

    const newSelectionLI = document.querySelector(`#asteroid-list li[data-pdes='${asteroidMesh.userData.pdes}']`);
    if (newSelectionLI) {
        newSelectionLI.classList.add('selected');
    }

    const labelPosition = asteroidMesh.position.clone();
    labelPosition.y += 3;
    selectedAsteroidLabel = createLabel(asteroidMesh.userData.name || asteroidMesh.userData.pdes, labelPosition);
    scene.add(selectedAsteroidLabel);

    showAsteroidInfo(asteroidMesh.userData);
    drawAsteroidOrbit(asteroidMesh.userData);
    setupOrbitalControls(asteroidMesh.userData);
}

function addAsteroidInteraction(asteroidMeshes) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(asteroidMeshes);
        if (intersects.length > 0) {
            selectAsteroid(intersects[0].object);
        }
    }
    window.addEventListener('click', onMouseClick);
}

function showAsteroidInfo(data) {
    const infoPanel = document.getElementById('info-panel');
    const infoContent = document.getElementById('asteroid-info');
    
    infoContent.innerHTML = `
        <div class="asteroid-name">${data.full_name || data.pdes}</div>
        <div class="info-section">
            <h3>Physical Properties</h3>
            <div class="info-row"><span class="info-label">Designation</span><span class="info-value">${data.pdes}</span></div>
            <div class="info-row"><span class="info-label">Diameter</span><span class="info-value">${data.diameter ? data.diameter.toFixed(2) + ' km' : 'Unknown'}</span></div>
            <div class="info-row"><span class="info-label">Absolute Magnitude (H)</span><span class="info-value">${data.H ? data.H.toFixed(2) : 'Unknown'}</span></div>
            <div class="info-row"><span class="info-label">Albedo</span><span class="info-value">${data.albedo ? data.albedo.toFixed(3) : 'Unknown'}</span></div>
            <div class="info-row"><span class="info-label">Estimated Mass</span><span class="info-value">${data.mass ? (data.mass / 1e12).toExponential(2) + ' × 10¹² kg' : 'Unknown'}</span></div>
        </div>
        <div class="info-section">
            <h3>Orbital Elements</h3>
            <div class="info-row"><span class="info-label">Semi-major Axis (a)</span><span class="info-value">${data.a ? data.a.toFixed(3) + ' AU' : 'Unknown'}</span></div>
            <div class="info-row"><span class="info-label">Eccentricity (e)</span><span class="info-value">${data.e ? data.e.toFixed(3) : 'Unknown'}</span></div>
            <div class="info-row"><span class="info-label">Inclination (i)</span><span class="info-value">${data.i ? data.i.toFixed(2) + '°' : 'Unknown'}</span></div>
            <div class="info-row"><span class="info-label">Perihelion Distance (q)</span><span class="info-value">${data.q ? data.q.toFixed(3) + ' AU' : 'Unknown'}</span></div>
            <div class="info-row"><span class="info-label">Orbital Period</span><span class="info-value">${data.per_y ? data.per_y.toFixed(2) + ' years' : 'Unknown'}</span></div>
        </div>`;
    infoPanel.classList.add('open');
}

document.getElementById('close-btn').addEventListener('click', () => {
    document.getElementById('info-panel').classList.remove('open');
    
    const orbitalPanel = document.getElementById('orbital-panel');
    if (orbitalPanel) {
        orbitalPanel.classList.remove('open');
    }

    if (asteroidMeshes.selected) {
        asteroidMeshes.selected.material.emissive.setHex(0x000000);
        asteroidOverrides.delete(asteroidMeshes.selected.userData.pdes);
        asteroidMeshes.selected = null;
    }
    
    if (selectedAsteroidLabel) {
        scene.remove(selectedAsteroidLabel);
        selectedAsteroidLabel = null;
    }
    
    if (activeOrbitLine) {
        scene.remove(activeOrbitLine);
        activeOrbitLine.geometry.dispose();
        activeOrbitLine.material.dispose();
        activeOrbitLine = null;
    }

    collisionDetected = false;
    controls.enabled = true;
});

function calculateOrbitalDynamics(a, e, i) {
    const a_m = a * AU_TO_M;
    const mu = G * planetData.sun.mass;
    
    const perihelion = a * (1 - e);
    const r_perihelion = perihelion * AU_TO_M;
    const velocity = Math.sqrt(mu * (2/r_perihelion - 1/a_m)) / 1000;
    
    const period_seconds = 2 * Math.PI * Math.sqrt(Math.pow(a_m, 3) / mu);
    const period_years = period_seconds / (365.25 * 24 * 3600);
    
    const energy = -mu / (2 * a_m);
    const energy_per_kg = energy;
    
    return {
        velocity: velocity.toFixed(2) + ' km/s',
        period: period_years.toFixed(2) + ' years',
        energy: (energy_per_kg / 1e9).toFixed(2) + ' GJ/kg'
    };
}

function setupOrbitalControls(data) {
    const controlsPanel = document.getElementById('orbital-panel');
    controlsPanel.classList.add('open');
    
    let currentA = asteroidOverrides.get(data.pdes)?.a || data.a;
    let currentE = asteroidOverrides.get(data.pdes)?.e || data.e;
    let currentI = asteroidOverrides.get(data.pdes)?.i || data.i;
    
    const aSlider = document.getElementById('a-slider');
    aSlider.value = currentA;

    const eSlider = document.getElementById('e-slider');
    eSlider.value = currentE;
    
    const iSlider = document.getElementById('i-slider');
    iSlider.value = currentI;

    const updateOrbit = () => {
        const newA = parseFloat(aSlider.value);
        const newE = parseFloat(eSlider.value);
        const newI = parseFloat(iSlider.value);

        const perihelion = newA * (1 - newE);
        const aphelion = newA * (1 + newE);

        let orbitStatus = "";
        const warningBox = document.getElementById('orbital-warning');

        if (perihelion < 1.017 && aphelion > 0.983) {
            orbitStatus = "⚠ Earth-Crossing Orbit Detected!";
            warningBox.style.borderColor = "rgba(255, 193, 7, 0.5)";
        }

        if (perihelion < 1.0 && aphelion > 1.0) {
            orbitStatus = "🚨 High Earth Impact Potential!";
            warningBox.style.borderColor = "rgba(244, 67, 54, 0.5)";
        }

        warningBox.textContent = orbitStatus;

        document.getElementById('a-value').textContent = newA.toFixed(3) + ' AU';
        document.getElementById('e-value').textContent = newE.toFixed(3);
        document.getElementById('i-value').textContent = newI.toFixed(2) + '°';

        const dynamics = calculateOrbitalDynamics(newA, newE, newI);
        document.getElementById('orbital-velocity').textContent = dynamics.velocity;
        document.getElementById('orbital-period').textContent = dynamics.period;
        document.getElementById('orbital-energy').textContent = dynamics.energy;

        asteroidOverrides.set(data.pdes, { 
            a: newA, 
            e: newE, 
            i: newI,
            per_y: data.per_y,
            om: data.om, 
            w: data.w, 
            ma: data.ma,
        });

        drawAsteroidOrbit({ ...data, ...asteroidOverrides.get(data.pdes) });
    };

    updateOrbit();

    aSlider.oninput = updateOrbit;
    eSlider.oninput = updateOrbit;
    iSlider.oninput = updateOrbit;
    
    document.getElementById('reset-orbit').onclick = () => {
        asteroidOverrides.delete(data.pdes);
        aSlider.value = data.a;
        eSlider.value = data.e;
        iSlider.value = data.i;
        drawAsteroidOrbit(data);
        document.getElementById('a-value').textContent = data.a.toFixed(3) + ' AU';
        document.getElementById('e-value').textContent = data.e.toFixed(3);
        document.getElementById('i-value').textContent = data.i.toFixed(2) + '°';
        document.getElementById('orbital-warning').textContent = '';
        
        const dynamics = calculateOrbitalDynamics(data.a, data.e, data.i);
        document.getElementById('orbital-velocity').textContent = dynamics.velocity;
        document.getElementById('orbital-period').textContent = dynamics.period;
        document.getElementById('orbital-energy').textContent = dynamics.energy;
    };
}

function createSun() {
    const geo = new THREE.SphereGeometry(7, 32, 32);
    const tex = textureLoader.load('textures/sun_surface.jpg');
    sun = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, color: 0xffaa00 }));
    sun.userData = { velocity: new THREE.Vector3(0, 0, 0), acceleration: new THREE.Vector3(0, 0, 0) };
    scene.add(sun);
    const sunLight = new THREE.PointLight(0xffffff, 2, 0);
    scene.add(sunLight);
    
    const labelPos = sun.position.clone();
    labelPos.y += 10;
    const label = createLabel('Sun', labelPos);
    sun.add(label);
    planetLabels.set('sun', label);
}

function createMercury() {
    const geo = new THREE.SphereGeometry(0.5, 32, 32);
    const tex = textureLoader.load('textures/mercury.jpg');
    mercury = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ map: tex, color: 0x8c7853 }));
    scene.add(mercury);
    
    const label = createLabel('Mercury', new THREE.Vector3(0, 2, 0));
    mercury.add(label);
    planetLabels.set('mercury', label);
}

function createVenus() {
    const geo = new THREE.SphereGeometry(1.2, 32, 32);
    const tex = textureLoader.load('textures/venus_atmosphere.jpg');
    venus = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ map: tex, color: 0xffc649 }));
    scene.add(venus);
    
    const label = createLabel('Venus', new THREE.Vector3(0, 3, 0));
    venus.add(label);
    planetLabels.set('venus', label);
}

function createEarth() {
    const geo = new THREE.SphereGeometry(1.4, 32, 32);
    const tex = textureLoader.load('textures/earth_day.jpg');
    earth = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ map: tex, color: 0x6b93d6 }));
    scene.add(earth);
    
    const label = createLabel('Earth', new THREE.Vector3(0, 3, 0));
    earth.add(label);
    planetLabels.set('earth', label);
}

function createMars() {
    const geo = new THREE.SphereGeometry(1, 32, 32);
    const tex = textureLoader.load('textures/mars.jpg');
    mars = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ map: tex, color: 0xc1440e }));
    scene.add(mars);
    
    const label = createLabel('Mars', new THREE.Vector3(0, 3, 0));
    mars.add(label);
    planetLabels.set('mars', label);
}

function createJupiter() {
    const geo = new THREE.SphereGeometry(4, 32, 32);
    const tex = textureLoader.load('textures/jupiter.jpg');
    jupiter = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ map: tex, color: 0xc88b3a }));
    scene.add(jupiter);
    
    const label = createLabel('Jupiter', new THREE.Vector3(0, 6, 0));
    jupiter.add(label);
    planetLabels.set('jupiter', label);
}

function createSaturn() {
    const geo = new THREE.SphereGeometry(5.5, 32, 32);
    const tex = textureLoader.load('textures/saturn.jpg');
    saturn = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ map: tex, color: 0xfad5a5 }));
    scene.add(saturn);
    const ringGeo = new THREE.RingGeometry(7, 10, 64);
    const ringTex = textureLoader.load('textures/saturn_ring.png');
    const ringMat = new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    saturn.add(ring);
    
    const label = createLabel('Saturn', new THREE.Vector3(0, 8, 0));
    saturn.add(label);
    planetLabels.set('saturn', label);
}

function createUranus() {
    const geo = new THREE.SphereGeometry(4.5, 32, 32);
    const tex = textureLoader.load('textures/uranus.jpg');
    uranus = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ map: tex, color: 0x4fd0e7 }));
    scene.add(uranus);
    
    const label = createLabel('Uranus', new THREE.Vector3(0, 7, 0));
    uranus.add(label);
    planetLabels.set('uranus', label);
}

function createNeptune() {
    const geo = new THREE.SphereGeometry(4.3, 32, 32);
    const tex = textureLoader.load('textures/neptune.jpg');
    neptune = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ map: tex, color: 0x4b70dd }));
    scene.add(neptune);
    
    const label = createLabel('Neptune', new THREE.Vector3(0, 7, 0));
    neptune.add(label);
    planetLabels.set('neptune', label);
}

function addStarField(num = 800) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < num; i++) {
        const x = (Math.random() - 0.5) * 10000;
        const y = (Math.random() - 0.5) * 10000;
        const z = (Math.random() - 0.5) * 10000;
        positions.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}

function drawPlanetOrbit(params, color) {
    const points = [];
    const segments = 256;
    for (let i = 0; i <= segments; i++) {
        const M = (i / segments) * Math.PI * 2;
        const E = solveKeplerEquation(M, params.e);
        const x = params.a * (Math.cos(E) - params.e);
        const z0 = params.a * Math.sqrt(1 - params.e ** 2) * Math.sin(E);
        const y = z0 * Math.sin(params.i);
        const z = z0 * Math.cos(params.i);
        points.push(new THREE.Vector3(x, y, z));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.4 });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
}

function updatePlanet(mesh, params, t) {
    const M = 2 * Math.PI * (t / params.period);
    const E = solveKeplerEquation(M, params.e);
    const x = params.a * (Math.cos(E) - params.e);
    const z0 = params.a * Math.sqrt(1 - params.e ** 2) * Math.sin(E);
    const y = z0 * Math.sin(params.i);
    const z = z0 * Math.cos(params.i);
    mesh.position.set(x, y, z);
}

function convertSimPositionToLatLong(impactVector, earthPosition) {
    const localImpact = impactVector.clone().sub(earthPosition);
    localImpact.normalize();
    
    const latitude = Math.asin(localImpact.y) * 180 / Math.PI;
    const longitude = Math.atan2(localImpact.z, localImpact.x) * 180 / Math.PI;
    
    return { latitude, longitude };
}

function createImpactMarker(impactPosition) {
    const markerGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        emissive: 0xff0000,
        transparent: true,
        opacity: 0.9
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(impactPosition);
    scene.add(marker);
    
    // Pulsating effect
    let scale = 1;
    let growing = true;
    const pulseInterval = setInterval(() => {
        if (growing) {
            scale += 0.05;
            if (scale >= 2) growing = false;
        } else {
            scale -= 0.05;
            if (scale <= 1) growing = true;
        }
        marker.scale.setScalar(scale);
    }, 50);
    
    return { marker, pulseInterval };
}

function checkEarthCollision(asteroidMesh) {
    if (!earth || !asteroidMesh || collisionDetected) return;

    const asteroidPosition = asteroidMesh.position;
    const earthPosition = earth.position;
    const distance = asteroidPosition.distanceTo(earthPosition);

    const earthRadiusSimUnits = 1.4;
    const asteroidRadiusSimUnits = asteroidMesh.userData.baseSize * asteroidVisualScale;
    const impactThreshold = earthRadiusSimUnits + asteroidRadiusSimUnits + 0.5;

    if (distance < impactThreshold) {
        isPaused = true;
        collisionDetected = true;
        asteroidMesh.visible = false;

        // Calculate exact impact point on Earth's surface
        const impactDirection = new THREE.Vector3().subVectors(asteroidPosition, earthPosition).normalize();
        const impactPoint = earthPosition.clone().add(impactDirection.multiplyScalar(earthRadiusSimUnits));
        
        const impactCoords = convertSimPositionToLatLong(impactPoint, earthPosition);
        
        // Create impact marker
        const { marker, pulseInterval } = createImpactMarker(impactPoint);
        
        const velocitySimUnits = asteroidMesh.userData.velocity.length();
        const velocityMS = velocitySimUnits * (AU_TO_M / AU_SCALE) / DAY_TO_S;
        const velocityKMS = velocityMS / 1000;
        
        const mass = asteroidMesh.userData.mass;
        const energyJoules = 0.5 * mass * Math.pow(velocityMS, 2);
        const energyMegatons = energyJoules / 4.184e15;

        alert(`🚨 CATASTROPHIC IMPACT DETECTED!\n\n` +
              `Asteroid: ${asteroidMesh.userData.name || asteroidMesh.userData.pdes}\n` +
              `Impact Time: ${simDay.toFixed(1)} days (${(simDay/365.25).toFixed(2)} years)\n\n` +
              `IMPACT COORDINATES:\n` +
              `Latitude: ${impactCoords.latitude.toFixed(2)}°\n` +
              `Longitude: ${impactCoords.longitude.toFixed(2)}°\n\n` +
              `IMPACT PARAMETERS:\n` +
              `Diameter: ${asteroidMesh.userData.actualDiameter.toFixed(1)} km\n` +
              `Mass: ${(mass / 1e12).toExponential(2)} × 10¹² kg\n` +
              `Velocity: ${velocityKMS.toFixed(2)} km/s\n` +
              `Estimated Energy: ${energyMegatons.toExponential(2)} megatons TNT\n\n` +
              `This impact would cause catastrophic devastation.`);
        
        zoomToImpact(impactPoint, earthPosition);
    }
}

function zoomToImpact(impactPoint, earthPosition) {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    
    // Position camera to look at impact point from close distance
    const viewDirection = new THREE.Vector3().subVectors(impactPoint, earthPosition).normalize();
    const finalCameraPosition = impactPoint.clone().add(viewDirection.multiplyScalar(8));
    const finalTarget = impactPoint.clone();

    let t = 0;
    const duration = 300;

    function animateZoom() {
        t++;
        const alpha = Math.min(t / duration, 1);
        const eased = 1 - Math.pow(1 - alpha, 3); // Ease out cubic

        camera.position.lerpVectors(startPosition, finalCameraPosition, eased);
        controls.target.lerpVectors(startTarget, finalTarget, eased);
        controls.update();

        if (t < duration) {
            requestAnimationFrame(animateZoom);
        } else {
            controls.enabled = true; // Re-enable after zoom
        }
    }

    animateZoom();
}

// Deflection method variables
let deflectionActive = false;
let impactorMesh = null;
let reflectorMesh = null;
let surfaceAlterationActive = false;

// Kinetic Impactor Method
function applyKineticImpactor(asteroidMesh) {
    if (!asteroidMesh || deflectionActive) return;
    
    deflectionActive = true;
    isPaused = true;
    controls.enabled = false;
    
    // Get impactor mass from UI
    const impactorMass = parseFloat(document.getElementById('impactor-mass')?.value || 600);
    const asteroidMass = asteroidMesh.userData.mass;
    
    // Store original camera position
    const startCameraPos = camera.position.clone();
    const startCameraTarget = controls.target.clone();
    
    // Zoom to asteroid
    const asteroidPos = asteroidMesh.position.clone();
    const zoomDistance = 15;
    const finalCameraPos = asteroidPos.clone().add(new THREE.Vector3(zoomDistance, zoomDistance * 0.5, zoomDistance));
    
    // Create impactor spacecraft
    const impactorGeo = new THREE.ConeGeometry(0.3, 1, 8);
    const impactorMat = new THREE.MeshPhongMaterial({ 
        color: 0x00ffff, 
        emissive: 0x00aaaa,
        shininess: 100
    });
    impactorMesh = new THREE.Mesh(impactorGeo, impactorMat);
    
    // Position impactor 20 units away from asteroid
    const approachDirection = new THREE.Vector3(1, 0.5, -0.5).normalize();
    const impactorStartPos = asteroidPos.clone().add(approachDirection.multiplyScalar(20));
    impactorMesh.position.copy(impactorStartPos);
    impactorMesh.lookAt(asteroidPos);
    scene.add(impactorMesh);
    
    // Add exhaust trail
    const trailGeo = new THREE.CylinderGeometry(0.05, 0.15, 2, 8);
    const trailMat = new THREE.MeshBasicMaterial({ 
        color: 0xff6600, 
        transparent: true, 
        opacity: 0.7 
    });
    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.rotation.x = Math.PI / 2;
    trail.position.z = -1.5;
    impactorMesh.add(trail);
    
    const animationDuration = 3000;
    const startTime = performance.now();
    
    function animateImpactor() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);
        
        // Smooth easing
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Zoom camera
        camera.position.lerpVectors(startCameraPos, finalCameraPos, eased * 0.8);
        controls.target.lerpVectors(startCameraTarget, asteroidPos, eased * 0.8);
        controls.update();
        
        // Move impactor towards asteroid
        if (progress < 0.85) {
            const currentProgress = progress / 0.85;
            impactorMesh.position.lerpVectors(impactorStartPos, asteroidPos, currentProgress);
            impactorMesh.lookAt(asteroidPos);
            
            // Pulsate trail
            trail.material.opacity = 0.5 + Math.sin(currentTime * 0.01) * 0.2;
            
            requestAnimationFrame(animateImpactor);
        } else {
            // Impact moment!
            createImpactEffect(asteroidPos);
            scene.remove(impactorMesh);
            impactorMesh.geometry.dispose();
            impactorMesh.material.dispose();
            impactorMesh = null;
            
            // Calculate deflection
            const impactVelocity = 6500; // m/s
            const momentumTransfer = impactorMass * impactVelocity;
            const velocityChange = momentumTransfer / asteroidMass;
            
            // Apply velocity change to asteroid
            const deflectionDirection = new THREE.Vector3(0.002, 0.001, -0.003).normalize();
            const deflectionVector = deflectionDirection.multiplyScalar(velocityChange / 10000);
            asteroidMesh.userData.velocity.add(deflectionVector);
            
            // Visual feedback - asteroid glows
            asteroidMesh.material.emissive.setHex(0xff6600);
            setTimeout(() => {
                asteroidMesh.material.emissive.setHex(asteroidMeshes.selected === asteroidMesh ? 0x00ffff : 0x000000);
            }, 1000);
            
            // Show results
            setTimeout(() => {
                alert(`✅ KINETIC IMPACTOR SUCCESS!\n\n` +
                      `Mission Parameters:\n` +
                      `Impactor Mass: ${impactorMass} kg\n` +
                      `Impact Velocity: 6.5 km/s\n` +
                      `Momentum Transfer: ${(momentumTransfer / 1000).toFixed(2)} kN·s\n\n` +
                      `Deflection Results:\n` +
                      `Velocity Change: ${(velocityChange * 1000).toFixed(3)} mm/s\n` +
                      `Estimated Orbit Shift: ~${(velocityChange * 1000 * 86400 * 30).toFixed(1)} km (30 days)\n\n` +
                      `The asteroid's trajectory has been successfully altered!\n` +
                      `Continue monitoring its orbit.`);
                
                controls.enabled = true;
                isPaused = false;
                deflectionActive = false;
            }, 1500);
        }
    }
    
    animateImpactor();
}

// Surface Alteration Method (Yarkovsky Effect)
function applySurfaceAlteration(asteroidMesh) {
    if (!asteroidMesh || deflectionActive) return;
    
    deflectionActive = true;
    isPaused = true;
    controls.enabled = false;
    
    // Store original camera position
    const startCameraPos = camera.position.clone();
    const startCameraTarget = controls.target.clone();
    
    // Zoom to asteroid
    const asteroidPos = asteroidMesh.position.clone();
    const zoomDistance = 12;
    const finalCameraPos = asteroidPos.clone().add(new THREE.Vector3(zoomDistance, zoomDistance * 0.3, zoomDistance));
    
    // Create reflector/painter spacecraft
    const reflectorGeo = new THREE.BoxGeometry(2, 0.2, 3);
    const reflectorMat = new THREE.MeshPhongMaterial({ 
        color: 0xcccccc, 
        emissive: 0xaaaaaa,
        shininess: 100,
        metalness: 0.8
    });
    reflectorMesh = new THREE.Mesh(reflectorGeo, reflectorMat);
    
    // Position reflector in front of asteroid
    const reflectorDistance = 5;
    const reflectorPos = asteroidPos.clone().add(new THREE.Vector3(reflectorDistance, 1, 0));
    reflectorMesh.position.copy(reflectorPos);
    reflectorMesh.lookAt(asteroidPos);
    scene.add(reflectorMesh);
    
    // Add solar panels
    const panelGeo = new THREE.BoxGeometry(4, 0.1, 1.5);
    const panelMat = new THREE.MeshPhongMaterial({ 
        color: 0x1a4d8f, 
        emissive: 0x0a2d5f,
        shininess: 50
    });
    const panel1 = new THREE.Mesh(panelGeo, panelMat);
    panel1.position.set(-3, 0, 0);
    reflectorMesh.add(panel1);
    
    const panel2 = new THREE.Mesh(panelGeo, panelMat);
    panel2.position.set(3, 0, 0);
    reflectorMesh.add(panel2);
    
    // Add light beam effect
    const beamGeo = new THREE.CylinderGeometry(0.1, 1.5, reflectorDistance, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({ 
        color: 0xffff00, 
        transparent: true, 
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = Math.PI / 2;
    beam.position.set(0, 0, -reflectorDistance / 2);
    reflectorMesh.add(beam);
    
    const animationDuration = 4000;
    const startTime = performance.now();
    let asteroidColorShift = 0;
    
    function animateAlteration() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);
        
        // Smooth easing
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Zoom camera
        camera.position.lerpVectors(startCameraPos, finalCameraPos, eased * 0.8);
        controls.target.lerpVectors(startCameraTarget, asteroidPos, eased * 0.8);
        controls.update();
        
        // Reflector positioning animation
        if (progress < 0.3) {
            // Move into position
            const approachProgress = progress / 0.3;
            const startPos = reflectorPos.clone().add(new THREE.Vector3(-5, 2, 5));
            reflectorMesh.position.lerpVectors(startPos, reflectorPos, approachProgress);
            reflectorMesh.lookAt(asteroidPos);
        } else if (progress < 0.9) {
            // Painting/reflecting phase
            reflectorMesh.lookAt(asteroidPos);
            
            // Rotate slowly
            reflectorMesh.rotation.y += 0.005;
            
            // Pulse beam effect
            beam.material.opacity = 0.2 + Math.sin((currentTime - startTime * 0.3) * 0.005) * 0.15;
            
            // Gradually change asteroid color (painting effect)
            asteroidColorShift = ((progress - 0.3) / 0.6);
            const newColor = new THREE.Color().lerpColors(
                new THREE.Color(0x888888),
                new THREE.Color(0xddddff),
                asteroidColorShift
            );
            asteroidMesh.material.color.copy(newColor);
            
        } else {
            // Retreat
            const retreatProgress = (progress - 0.9) / 0.1;
            const endPos = reflectorPos.clone().add(new THREE.Vector3(8, 3, 8));
            reflectorMesh.position.lerpVectors(reflectorPos, endPos, retreatProgress);
            beam.material.opacity = 0.3 * (1 - retreatProgress);
        }
        
        if (progress < 1) {
            requestAnimationFrame(animateAlteration);
        } else {
            // Mission complete
            scene.remove(reflectorMesh);
            reflectorMesh.geometry.dispose();
            reflectorMesh.material.dispose();
            reflectorMesh = null;
            
            // Apply continuous Yarkovsky effect
            surfaceAlterationActive = true;
            asteroidMesh.userData.surfaceAltered = true;
            
            // Show results
            setTimeout(() => {
                alert(`✅ SURFACE ALTERATION SUCCESS!\n\n` +
                      `Mission Parameters:\n` +
                      `Method: Reflective coating application\n` +
                      `Surface Coverage: 85%\n` +
                      `Albedo Change: 0.15 → 0.65 (+333%)\n\n` +
                      `Yarkovsky Effect Activated:\n` +
                      `Thermal thrust: ~0.3 microN\n` +
                      `Annual velocity change: ~1.2 cm/s\n` +
                      `Estimated orbit shift (10 years): ~3,800 km\n\n` +
                      `The asteroid's surface has been altered!\n` +
                      `Thermal radiation will continuously adjust its orbit.\n` +
                      `This is a long-term deflection strategy.`);
                
                controls.enabled = true;
                isPaused = false;
                deflectionActive = false;
            }, 1000);
        }
    }
    
    animateAlteration();
}

// Update asteroid motion to include Yarkovsky effect
function applyYarkovskyForce(asteroidMesh) {
    if (!asteroidMesh.userData.surfaceAltered) return;
    
    // Small continuous force from thermal radiation
    const sunDirection = new THREE.Vector3().subVectors(sun.position, asteroidMesh.position).normalize();
    const thermalForce = sunDirection.clone().multiplyScalar(0.000002);
    asteroidMesh.userData.velocity.add(thermalForce);
}

// New function to initiate the crash course animation
function initiateCrashCourse(asteroidMesh) {
    // Store original state
    const originalPosition = asteroidMesh.position.clone();
    const earthPosition = earth.position.clone();
    
    // Calculate camera positions for the animation
    const startCameraPos = camera.position.clone();
    const startCameraTarget = controls.target.clone();
    
    // Set up final camera position (close to Earth, looking at impact point)
    const directionToEarth = new THREE.Vector3().subVectors(earthPosition, originalPosition).normalize();
    const impactPoint = earthPosition.clone().add(directionToEarth.multiplyScalar(1.4)); // Earth's visual radius
    const cameraOffset = new THREE.Vector3(8, 5, 8);
    const finalCameraPos = impactPoint.clone().add(cameraOffset);
    
    // Animation parameters
    const animationDuration = 2500; // 2.5 seconds for the crash
    const startTime = performance.now();
    
    // Disable controls and pause normal simulation
    controls.enabled = false;
    isPaused = true;
    
    // Show asteroid info
    showAsteroidInfo(asteroidMesh.userData);
    
    function animateCrash() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1);
        
        // Ease-in-out function for smooth animation
        const eased = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Move asteroid towards Earth
        asteroidMesh.position.lerpVectors(originalPosition, impactPoint, eased);
        
        // Move camera to follow the action
        camera.position.lerpVectors(startCameraPos, finalCameraPos, eased);
        controls.target.lerpVectors(startCameraTarget, impactPoint, eased);
        controls.update();
        
        // Check if animation is complete
        if (progress < 1) {
            requestAnimationFrame(animateCrash);
        } else {
            // Impact!
            asteroidMesh.position.copy(impactPoint);
            
            // Create impact effect
            createImpactEffect(impactPoint);
            
            // Hide asteroid
            asteroidMesh.visible = false;
            
            // Calculate impact data
            const velocitySimUnits = asteroidMesh.userData.velocity.length();
            const velocityMS = velocitySimUnits * (AU_TO_M / AU_SCALE) / DAY_TO_S;
            const velocityKMS = velocityMS / 1000 || 25; // Default to 25 km/s if calculation fails
            
            const mass = asteroidMesh.userData.mass;
            const energyJoules = 0.5 * mass * Math.pow(velocityMS || 25000, 2);
            const energyMegatons = energyJoules / 4.184e15;
            
            const impactCoords = convertSimPositionToLatLong(impactPoint, earthPosition);
            
            // Show impact notification
            setTimeout(() => {
                alert(`🚨 CATASTROPHIC IMPACT!\n\n` +
                      `Asteroid: ${asteroidMesh.userData.name || asteroidMesh.userData.pdes}\n` +
                      `Impact Time: ${simDay.toFixed(1)} days (${(simDay/365.25).toFixed(2)} years)\n\n` +
                      `IMPACT COORDINATES:\n` +
                      `Latitude: ${impactCoords.latitude.toFixed(2)}°\n` +
                      `Longitude: ${impactCoords.longitude.toFixed(2)}°\n\n` +
                      `IMPACT PARAMETERS:\n` +
                      `Diameter: ${asteroidMesh.userData.actualDiameter.toFixed(1)} km\n` +
                      `Mass: ${(mass / 1e12).toExponential(2)} × 10¹² kg\n` +
                      `Velocity: ${velocityKMS.toFixed(2)} km/s\n` +
                      `Estimated Energy: ${energyMegatons.toExponential(2)} megatons TNT\n\n` +
                      `This impact would cause catastrophic devastation.`);
                
                // Re-enable controls
                controls.enabled = true;
                isPaused = false;
                collisionDetected = true;
            }, 500);
        }
    }
    
    // Start the animation
    requestAnimationFrame(animateCrash);
}

// Helper function to create impact visual effect
function createImpactEffect(impactPoint) {
    // Create expanding shockwave
    const shockwaveGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const shockwaveMat = new THREE.MeshBasicMaterial({ 
        color: 0xff4400, 
        transparent: true, 
        opacity: 0.9,
        wireframe: false
    });
    const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwave.position.copy(impactPoint);
    scene.add(shockwave);
    
    // Animate shockwave expansion
    let scale = 1;
    let opacity = 0.9;
    const expandInterval = setInterval(() => {
        scale += 0.3;
        opacity -= 0.05;
        shockwave.scale.setScalar(scale);
        shockwave.material.opacity = Math.max(0, opacity);
        
        if (opacity <= 0) {
            scene.remove(shockwave);
            shockwave.geometry.dispose();
            shockwave.material.dispose();
            clearInterval(expandInterval);
        }
    }, 50);
    
    // Create impact marker that persists
    const markerGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        emissive: 0xff0000,
        transparent: true,
        opacity: 0.9
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.copy(impactPoint);
    scene.add(marker);
    
    // Pulsating marker effect
    let markerScale = 1;
    let growing = true;
    setInterval(() => {
        if (growing) {
            markerScale += 0.05;
            if (markerScale >= 2) growing = false;
        } else {
            markerScale -= 0.05;
            if (markerScale <= 1) growing = true;
        }
        if (marker.parent) {
            marker.scale.setScalar(markerScale);
        }
    }, 50);
}


function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        const dt = baseDayStep * speedMultiplier;
        simDay += dt;
        
        const days = Math.floor(simDay);
        const years = (simDay / 365.25).toFixed(2);
        document.getElementById('sim-time-display').textContent = `${days}d (${years}y)`;
        
        updatePlanet(mercury, orbitalParams.mercury, simDay);
        updatePlanet(venus, orbitalParams.venus, simDay);
        updatePlanet(earth, orbitalParams.earth, simDay);
        updatePlanet(mars, orbitalParams.mars, simDay);
        updatePlanet(jupiter, orbitalParams.jupiter, simDay);
        updatePlanet(saturn, orbitalParams.saturn, simDay);
        updatePlanet(uranus, orbitalParams.uranus, simDay);
        updatePlanet(neptune, orbitalParams.neptune, simDay);
        
        asteroidMeshes.forEach(asteroid => {
            if (gravityEnabled) {
                updateAsteroidWithGravity(asteroid, dt);
                applyYarkovskyForce(asteroid);
            } else {
                updateAsteroidKeplerian(asteroid);
            }
        });
        
        if (asteroidMeshes.selected) {
            checkEarthCollision(asteroidMeshes.selected);
            
            if (selectedAsteroidLabel) {
                const labelPos = asteroidMeshes.selected.position.clone();
                labelPos.y += 3;
                selectedAsteroidLabel.position.copy(labelPos);
            }

            // Track asteroid with camera if tracking is enabled
            if (trackAsteroid) {
                const asteroidPos = asteroidMeshes.selected.position.clone();
                const offset = new THREE.Vector3(15, 10, 15);
                camera.position.copy(asteroidPos.clone().add(offset));
                controls.target.copy(asteroidPos);
            }
        }

        sun.rotation.y += 0.001;
        mercury.rotation.y += 0.0017;
        venus.rotation.y -= 0.00041;
        earth.rotation.y += 0.01;
        mars.rotation.y += 0.0097;
        jupiter.rotation.y += 0.024;
        saturn.rotation.y += 0.023;
        uranus.rotation.y += 0.014;
        neptune.rotation.y += 0.015;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();