// Sample catalog data (demo only). Prices are placeholders.
const STORE = {
  name: "بومبا وميمونة",
  city: "الزقازيق",
  whatsapp: "201140177229",
  shipping: 50,
  weeklyOffer: 20 // percent, demo
};

// age in months: [min, max]
const PRODUCTS = [
  { id: "b1", cat: "boys", name: "طقم تيشيرت مقلم وجينز", img: "b_stripe", price: 450, ages: [24, 72], colors: ["#e9e6df", "#4a6fa5"], school: false, offer: true },
  { id: "b2", cat: "boys", name: "طقم قميص وبنطلون شينو", img: "b_shirt", price: 520, ages: [36, 96], colors: ["#cfe0f0", "#c9b48f"], school: true, offer: false },
  { id: "b3", cat: "boys", name: "طقم بولو وشورت جينز", img: "b_polo", price: 390, ages: [24, 72], colors: ["#3c6bb4", "#9cc3e6"], school: false, offer: true },
  { id: "b4", cat: "boys", name: "سويت شيرت بيج كاجوال", img: "b_sweat", price: 340, ages: [60, 120], colors: ["#d9c3a5", "#5b4636"], school: true, offer: false },
  { id: "b5", cat: "boys", name: "طقم كارديجان كحلي وشورت", img: "b_cardigan", price: 480, ages: [24, 60], colors: ["#24304f", "#3d7bd1"], school: true, offer: false },
  { id: "g1", cat: "girls", name: "فستان أحمر بكشكش", img: "g_red", price: 560, ages: [36, 96], colors: ["#c8202f"], school: false, offer: true },
  { id: "g2", cat: "girls", name: "فستان سهرة أحمر بأكمام منفوخة", img: "g_red2", price: 620, ages: [48, 120], colors: ["#b51b2b"], school: false, offer: false },
  { id: "g3", cat: "girls", name: "فستان قطن ألوان باستيل", img: "racks3", price: 430, ages: [24, 72], colors: ["#f6b6c1", "#bfe3d6", "#f7e2a0"], school: false, offer: true },
  { id: "g4", cat: "girls", name: "صندل كروكس بناتي بشارمز", img: "shoes_pink", price: 250, ages: [24, 72], colors: ["#f5a3c0"], school: false, offer: false },
  { id: "u1", cat: "boys", also: "girls", name: "تيشيرتات قطن 100% ألوان", img: "tees", price: 180, ages: [24, 144], colors: ["#e4572e", "#2e2e2e", "#f2c14e", "#3a7d44"], school: true, offer: false },
  { id: "u2", cat: "boys", also: "girls", name: "جاكيت فليس شتوي", img: "jackets", price: 590, ages: [36, 120], colors: ["#d8cfc4", "#6c7a89"], school: true, offer: false },
  { id: "n1", cat: "baby", name: "أوفرول رمادي بزراير", img: "bb_romper", price: 280, ages: [0, 12], colors: ["#9ea3a8"], school: false, offer: true },
  { id: "n2", cat: "baby", name: "طقم تريكو كحلي", img: "bb_knit", price: 320, ages: [6, 24], colors: ["#26324d"], school: false, offer: false },
  { id: "n3", cat: "baby", name: "طقم بيبي تيل مريح", img: "bb_teal", price: 300, ages: [0, 18], colors: ["#2f7f86", "#f0ebe3"], school: false, offer: false },
  { id: "n4", cat: "baby", name: "بادي قطن أبيض", img: "onesie", price: 120, ages: [0, 12], colors: ["#ffffff", "#bcd9ef"], school: false, offer: false },
  { id: "n5", cat: "baby", name: "طقم استقبال مولود", img: "basket", price: 650, ages: [0, 3], colors: ["#efe4d4", "#f6d6dc"], school: false, offer: false }
];

const AGE_FILTERS = [
  { id: "all", label: "كل الأعمار", r: [0, 999] },
  { id: "0", label: "0 - 12 شهر", r: [0, 12] },
  { id: "1", label: "1 - 2 سنة", r: [12, 36] },
  { id: "3", label: "3 - 4 سنين", r: [36, 60] },
  { id: "5", label: "5 - 6 سنين", r: [60, 84] },
  { id: "7", label: "7 - 8 سنين", r: [84, 108] },
  { id: "9", label: "9 - 12 سنة", r: [108, 156] }
];

const SIZE_GUIDE = [
  ["0 - 3 شهور", "50 - 62", "3 - 6", "NB"],
  ["3 - 6 شهور", "62 - 68", "6 - 8", "3M"],
  ["6 - 12 شهر", "68 - 80", "8 - 10", "9M"],
  ["1 - 2 سنة", "80 - 92", "10 - 13", "2Y"],
  ["3 - 4 سنين", "92 - 110", "13 - 18", "4Y"],
  ["5 - 6 سنين", "110 - 122", "18 - 23", "6Y"],
  ["7 - 8 سنين", "122 - 134", "23 - 29", "8Y"],
  ["9 - 10 سنين", "134 - 146", "29 - 37", "10Y"],
  ["11 - 12 سنة", "146 - 158", "37 - 45", "12Y"]
];

// size options derived from age range
function sizesFor(p) {
  const out = [];
  const steps = [[0, 3, "0-3 ش"], [3, 6, "3-6 ش"], [6, 12, "6-12 ش"], [12, 24, "1-2 س"], [24, 36, "2-3 س"], [36, 48, "3-4 س"], [48, 60, "4-5 س"], [60, 72, "5-6 س"], [72, 96, "7-8 س"], [96, 120, "9-10 س"], [120, 156, "11-12 س"]];
  for (const [a, b, l] of steps) if (b > p.ages[0] && a < p.ages[1]) out.push(l);
  return out;
}
