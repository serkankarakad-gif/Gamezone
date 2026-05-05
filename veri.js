// ============================================================
// TÜRK İMPARATORLUĞU — veri.js
// Tüm statik oyun verileri
// ============================================================
"use strict";

var D = {

  CONFIG: {
    INITIAL_TL:       20000,
    INITIAL_ELMAS:    10,
    INITIAL_KUPON:    1,
    LEVEL_XP_BASE:    1000,
    LEVEL_XP_MULT:    1.15,
    TAX_RATE:         0.18,
    AUTO_SAVE_SEC:    30,
    OFFLINE_MAX_H:    12,
    CREDIT_BOT_MIN:   5,    // Bot onay süresi (dakika)
    CREDIT_BOT_MAX:   15,
    REALTIME_MARKET:  true
  },

  // ══ SEVİYE KİLİTLERİ ══
  LOCKS: {
    bahceler:    5,
    ciftlikler:  10,
    fabrikalar:  20,
    madenler:    30,
    ihracat:     8,
    ihaleler:    12,
    lojistik:    6,
    borsaDetay:  3,
    kripto:      3,
    doviz:       5,
    fonlar:      10,
    gayrimenkul: 2,
    sigorta:     2,
    dijitalCuzdan: 3
  },

  // ══ BANKALAR ══
  BANKS: [
    { id:"tcmb",   name:"T.C. Merkez Bankası",   emoji:"🏛️", faizMevduat:0.55, faizKredi:0.65, maxKredi:0      },
    { id:"ziraat", name:"Ziraat Bankası",          emoji:"🌾", faizMevduat:0.38, faizKredi:0.45, maxKredi:500000 },
    { id:"is",     name:"İş Bankası",              emoji:"🔵", faizMevduat:0.42, faizKredi:0.50, maxKredi:400000 },
    { id:"halk",   name:"Halkbank",                emoji:"🟢", faizMevduat:0.36, faizKredi:0.44, maxKredi:300000 },
    { id:"vakif",  name:"VakıfBank",               emoji:"🔷", faizMevduat:0.40, faizKredi:0.48, maxKredi:350000 },
    { id:"garanti",name:"Garanti BBVA",            emoji:"🟢", faizMevduat:0.44, faizKredi:0.52, maxKredi:450000 },
    { id:"akbank", name:"Akbank",                  emoji:"🔴", faizMevduat:0.43, faizKredi:0.51, maxKredi:400000 },
    { id:"yapi",   name:"Yapı Kredi",              emoji:"🟡", faizMevduat:0.41, faizKredi:0.49, maxKredi:380000 }
  ],

  // ══ HİSSE SENETLERİ ══
  STOCKS: [
    { sym:"THYAO", name:"Türk Hava Yolları",   emoji:"✈️", price:285.4,  vol:0.025, div:0.02, color:"#1565C0" },
    { sym:"GARAN", name:"Garanti BBVA",         emoji:"🏦", price:108.7,  vol:0.018, div:0.03, color:"#2E7D32" },
    { sym:"ASELS", name:"ASELSAN",              emoji:"⚡", price:82.35,  vol:0.022, div:0.01, color:"#C62828" },
    { sym:"SISE",  name:"Şişe Cam",             emoji:"🔷", price:44.12,  vol:0.020, div:0.025,color:"#6A1B9A" },
    { sym:"KCHOL", name:"Koç Holding",          emoji:"🏢", price:182.3,  vol:0.016, div:0.025,color:"#E65100" },
    { sym:"SAHOL", name:"Sabancı Holding",      emoji:"🏛️", price:57.80,  vol:0.018, div:0.02, color:"#00695C" },
    { sym:"EREGL", name:"Ereğli Demir Çelik",  emoji:"⚙️", price:43.56,  vol:0.024, div:0.04, color:"#37474F" },
    { sym:"BIMAS", name:"BİM Mağazaları",       emoji:"🛒", price:445.5,  vol:0.014, div:0.015,color:"#F57F17" },
    { sym:"AKBNK", name:"Akbank",               emoji:"🔴", price:62.45,  vol:0.020, div:0.03, color:"#B71C1C" },
    { sym:"TUPRS", name:"Tüpraş",               emoji:"🛢️", price:186.7,  vol:0.022, div:0.045,color:"#4E342E" },
    { sym:"ARCLK", name:"Arçelik",              emoji:"🏠", price:121.5,  vol:0.020, div:0.02, color:"#1A237E" },
    { sym:"TOASO", name:"Tofaş Oto",            emoji:"🚗", price:228.4,  vol:0.022, div:0.035,color:"#880E4F" },
    { sym:"FROTO", name:"Ford Otosan",          emoji:"🚙", price:1050.2, vol:0.018, div:0.04, color:"#0D47A1" },
    { sym:"PGSUS", name:"Pegasus Hava.",        emoji:"🛫", price:594.3,  vol:0.030, div:0.01, color:"#4A148C" },
    { sym:"MGROS", name:"Migros",               emoji:"🛍️", price:188.4,  vol:0.016, div:0.015,color:"#BF360C" },
    { sym:"TTKOM", name:"Türk Telekom",         emoji:"📱", price:36.82,  vol:0.014, div:0.06, color:"#1565C0" },
    { sym:"EKGYO", name:"Emlak GYO",            emoji:"🏗️", price:14.28,  vol:0.028, div:0.02, color:"#558B2F" },
    { sym:"SOKM",  name:"Şok Marketler",        emoji:"🏪", price:60.14,  vol:0.016, div:0.015,color:"#E65100" },
    { sym:"VESTL", name:"Vestel",               emoji:"📺", price:22.46,  vol:0.032, div:0.01, color:"#006064" },
    { sym:"TAVHL", name:"TAV Havalimanları",    emoji:"🛬", price:132.8,  vol:0.022, div:0.025,color:"#37474F" },
    { sym:"KRDMD", name:"Kardemir",             emoji:"🔩", price:12.74,  vol:0.030, div:0.03, color:"#5D4037" },
    { sym:"ULKER", name:"Ülker",                emoji:"🍫", price:98.40,  vol:0.016, div:0.025,color:"#F9A825" },
    { sym:"MAVI",  name:"Mavi",                 emoji:"👕", price:148.9,  vol:0.020, div:0.015,color:"#1565C0" },
    { sym:"LOGO",  name:"Logo Yazılım",         emoji:"💻", price:410.5,  vol:0.024, div:0.01, color:"#2E7D32" }
  ],

  // ══ KRİPTOLAR ══
  CRYPTOS: [
    { sym:"BTC",  name:"Bitcoin",          emoji:"₿",  price:2850000, vol:0.040, color:"#F7931A" },
    { sym:"ETH",  name:"Ethereum",         emoji:"Ξ",  price:148000,  vol:0.050, color:"#627EEA" },
    { sym:"BNB",  name:"BNB",              emoji:"🟡", price:18500,   vol:0.045, color:"#F3BA2F" },
    { sym:"SOL",  name:"Solana",           emoji:"◎",  price:8200,    vol:0.060, color:"#9945FF" },
    { sym:"XRP",  name:"XRP",              emoji:"◈",  price:22.5,    vol:0.055, color:"#346AA9" },
    { sym:"ADA",  name:"Cardano",          emoji:"₳",  price:13.4,    vol:0.060, color:"#0033AD" },
    { sym:"AVAX", name:"Avalanche",        emoji:"🔺", price:1240,    vol:0.065, color:"#E84142" },
    { sym:"DOT",  name:"Polkadot",         emoji:"⬤",  price:285,     vol:0.058, color:"#E6007A" },
    { sym:"MATIC",name:"Polygon",          emoji:"🟣", price:32.5,    vol:0.070, color:"#8247E5" },
    { sym:"LINK", name:"Chainlink",        emoji:"⬡",  price:480,     vol:0.055, color:"#375BD2" }
  ],

  // ══ DÖVİZLER ══
  FOREX: [
    { sym:"USD", name:"Amerikan Doları",  flag:"🇺🇸", rate:33.2,  vol:0.008 },
    { sym:"EUR", name:"Euro",             flag:"🇪🇺", rate:36.1,  vol:0.007 },
    { sym:"GBP", name:"İngiliz Sterlini",flag:"🇬🇧", rate:42.8,  vol:0.009 },
    { sym:"CHF", name:"İsviçre Frangı",  flag:"🇨🇭", rate:38.2,  vol:0.006 },
    { sym:"JPY", name:"Japon Yeni",      flag:"🇯🇵", rate:0.224, vol:0.007 },
    { sym:"SAR", name:"Suudi Riyali",    flag:"🇸🇦", rate:8.85,  vol:0.004 },
    { sym:"AED", name:"BAE Dirhemi",     flag:"🇦🇪", rate:9.04,  vol:0.004 },
    { sym:"CNY", name:"Çin Yuanı",       flag:"🇨🇳", rate:4.58,  vol:0.006 },
    { sym:"RUB", name:"Rus Rublesi",     flag:"🇷🇺", rate:0.36,  vol:0.020 },
    { sym:"CAD", name:"Kanada Doları",   flag:"🇨🇦", rate:24.4,  vol:0.008 }
  ],

  // ══ EMTİA ══
  EMTIA: [
    { sym:"XAU", name:"Altın",       unit:"gram", emoji:"🥇", price:2980, vol:0.012 },
    { sym:"XAG", name:"Gümüş",      unit:"gram", emoji:"🥈", price:34.5, vol:0.018 },
    { sym:"OIL", name:"Ham Petrol",  unit:"varil",emoji:"🛢️", price:2920, vol:0.020 },
    { sym:"WHT", name:"Buğday",      unit:"ton",  emoji:"🌾", price:9200, vol:0.015 },
    { sym:"COP", name:"Bakır",       unit:"ton",  emoji:"🟤", price:295000,vol:0.014 }
  ],

  // ══ YATIRIM FONLARI ══
  FUNDS: [
    { id:"f1", name:"Türkiye Büyüme Fonu",     type:"Hisse",  risk:"Yüksek", yillikGetiri:0.38, minGiris:100   },
    { id:"f2", name:"Sabit Getiri Fonu",       type:"Tahvil", risk:"Düşük",  yillikGetiri:0.28, minGiris:500   },
    { id:"f3", name:"Dengeli Karma Fon",       type:"Karma",  risk:"Orta",   yillikGetiri:0.32, minGiris:250   },
    { id:"f4", name:"Altın & Emtia Fonu",      type:"Emtia",  risk:"Orta",   yillikGetiri:0.25, minGiris:1000  },
    { id:"f5", name:"Teknoloji Sektör Fonu",   type:"Hisse",  risk:"Yüksek", yillikGetiri:0.45, minGiris:200   },
    { id:"f6", name:"Kısa Vadeli Likit Fon",   type:"Likit",  risk:"Çok Düşük",yillikGetiri:0.22,minGiris:50  },
    { id:"f7", name:"Küresel Çeşitlilik Fonu", type:"Karma",  risk:"Orta",   yillikGetiri:0.30, minGiris:500   },
    { id:"f8", name:"Girişim Sermayesi Fonu",  type:"Özel",   risk:"Çok Yüksek",yillikGetiri:0.60,minGiris:10000}
  ],

  // ══ SİGORTA TÜRLERİ ══
  SIGORTALAR: [
    { id:"zorunlu_trafik", name:"Zorunlu Trafik Sig.", emoji:"🚗",  aylikPrim:150,  minLevel:1, desc:"Araç için zorunlu",        tip:"arac"   },
    { id:"kasko",          name:"Kasko",               emoji:"🛡️",  aylikPrim:450,  minLevel:2, desc:"Kapsamlı araç sigortası",  tip:"arac"   },
    { id:"konut",          name:"Konut Sigortası",      emoji:"🏠",  aylikPrim:200,  minLevel:2, desc:"Ev için koruma",           tip:"konut"  },
    { id:"dask",           name:"DASK (Deprem Sig.)",   emoji:"🌍",  aylikPrim:80,   minLevel:1, desc:"Zorunlu deprem sigortası", tip:"konut"  },
    { id:"saglik",         name:"Özel Sağlık Sig.",     emoji:"💊",  aylikPrim:800,  minLevel:3, desc:"Özel hastane erişimi",     tip:"saglik" },
    { id:"isyeri",         name:"İşyeri Sigortası",     emoji:"🏢",  aylikPrim:350,  minLevel:4, desc:"İşletme koruması",        tip:"isyeri" },
    { id:"hayat",          name:"Hayat Sigortası",      emoji:"❤️",  aylikPrim:300,  minLevel:3, desc:"Birikim + koruma",        tip:"hayat"  },
    { id:"seyahat",        name:"Seyahat Sigortası",    emoji:"✈️",  aylikPrim:100,  minLevel:2, desc:"Yurt dışı seyahat",       tip:"seyahat"}
  ],

  // ══ 81 İL ══
  ILLER: [
    {p:1,ad:"Adana",n:2258718,z:3},{p:2,ad:"Adıyaman",n:634365,z:1},{p:3,ad:"Afyonkarahisar",n:742251,z:2},
    {p:4,ad:"Ağrı",n:508588,z:1},{p:5,ad:"Amasya",n:337160,z:2},{p:6,ad:"Ankara",n:5782285,z:5},
    {p:7,ad:"Antalya",n:2688004,z:5},{p:8,ad:"Artvin",n:169543,z:2},{p:9,ad:"Aydın",n:1148241,z:3},
    {p:10,ad:"Balıkesir",n:1257590,z:3},{p:11,ad:"Bilecik",n:237194,z:2},{p:12,ad:"Bingöl",n:277212,z:1},
    {p:13,ad:"Bitlis",n:341065,z:1},{p:14,ad:"Bolu",n:322098,z:3},{p:15,ad:"Burdur",n:280969,z:2},
    {p:16,ad:"Bursa",n:3147818,z:5},{p:17,ad:"Çanakkale",n:578524,z:3},{p:18,ad:"Çankırı",n:196515,z:2},
    {p:19,ad:"Çorum",n:521882,z:2},{p:20,ad:"Denizli",n:1059684,z:4},{p:21,ad:"Diyarbakır",n:1804880,z:2},
    {p:22,ad:"Edirne",n:421099,z:3},{p:23,ad:"Elazığ",n:595170,z:2},{p:24,ad:"Erzincan",n:232781,z:2},
    {p:25,ad:"Erzurum",n:749754,z:2},{p:26,ad:"Eskişehir",n:906541,z:4},{p:27,ad:"Gaziantep",n:2154051,z:4},
    {p:28,ad:"Giresun",n:446388,z:2},{p:29,ad:"Gümüşhane",n:163423,z:1},{p:30,ad:"Hakkari",n:285373,z:1},
    {p:31,ad:"Hatay",n:1686043,z:3},{p:32,ad:"Isparta",n:446258,z:2},{p:33,ad:"Mersin",n:1916432,z:4},
    {p:34,ad:"İstanbul",n:15840900,z:5},{p:35,ad:"İzmir",n:4425789,z:5},{p:36,ad:"Kars",n:286891,z:1},
    {p:37,ad:"Kastamonu",n:376202,z:2},{p:38,ad:"Kayseri",n:1441523,z:4},{p:39,ad:"Kırklareli",n:371414,z:3},
    {p:40,ad:"Kırşehir",n:241852,z:2},{p:41,ad:"Kocaeli",n:2079072,z:5},{p:42,ad:"Konya",n:2277017,z:4},
    {p:43,ad:"Kütahya",n:567253,z:2},{p:44,ad:"Malatya",n:812580,z:3},{p:45,ad:"Manisa",n:1474669,z:4},
    {p:46,ad:"Kahramanmaraş",n:1175330,z:3},{p:47,ad:"Mardin",n:853826,z:2},{p:48,ad:"Muğla",n:1040118,z:5},
    {p:49,ad:"Muş",n:408542,z:1},{p:50,ad:"Nevşehir",n:307528,z:3},{p:51,ad:"Niğde",n:370198,z:2},
    {p:52,ad:"Ordu",n:748482,z:2},{p:53,ad:"Rize",n:346754,z:3},{p:54,ad:"Sakarya",n:1086956,z:4},
    {p:55,ad:"Samsun",n:1372877,z:4},{p:56,ad:"Siirt",n:327630,z:1},{p:57,ad:"Sinop",n:220341,z:2},
    {p:58,ad:"Sivas",n:621224,z:2},{p:59,ad:"Tekirdağ",n:1102247,z:4},{p:60,ad:"Tokat",n:597296,z:2},
    {p:61,ad:"Trabzon",n:814468,z:3},{p:62,ad:"Tunceli",n:82180,z:1},{p:63,ad:"Şanlıurfa",n:2143326,z:2},
    {p:64,ad:"Uşak",n:370519,z:2},{p:65,ad:"Van",n:1136371,z:2},{p:66,ad:"Yozgat",n:415247,z:1},
    {p:67,ad:"Zonguldak",n:597506,z:3},{p:68,ad:"Aksaray",n:426787,z:2},{p:69,ad:"Bayburt",n:84833,z:1},
    {p:70,ad:"Karaman",n:259679,z:2},{p:71,ad:"Kırıkkale",n:282439,z:2},{p:72,ad:"Batman",n:634205,z:2},
    {p:73,ad:"Şırnak",n:573745,z:1},{p:74,ad:"Bartın",n:204980,z:2},{p:75,ad:"Ardahan",n:97319,z:1},
    {p:76,ad:"Iğdır",n:200190,z:1},{p:77,ad:"Yalova",n:290793,z:4},{p:78,ad:"Karabük",n:251424,z:3},
    {p:79,ad:"Kilis",n:145826,z:2},{p:80,ad:"Osmaniye",n:558491,z:2},{p:81,ad:"Düzce",n:406347,z:3}
  ],

  // ══ GAYRİMENKUL TÜRLERİ ══
  ESTATE_TYPES: [
    { id:"daire_1_1",  name:"1+1 Daire",          emoji:"🏠", basePrice:850000,   gunlukKira:250,  il:"rastgele" },
    { id:"daire_2_1",  name:"2+1 Daire",          emoji:"🏠", basePrice:1400000,  gunlukKira:420,  il:"rastgele" },
    { id:"daire_3_1",  name:"3+1 Daire",          emoji:"🏠", basePrice:2200000,  gunlukKira:680,  il:"rastgele" },
    { id:"villa",      name:"Müstakil Villa",      emoji:"🏡", basePrice:5000000,  gunlukKira:1500, il:"rastgele" },
    { id:"isyeri",     name:"İşyeri / Ofis",       emoji:"🏢", basePrice:3500000,  gunlukKira:1200, il:"rastgele" },
    { id:"arsa_kucuk", name:"Arsa (küçük)",        emoji:"🌍", basePrice:500000,   gunlukKira:0,    il:"rastgele" },
    { id:"arsa_buyuk", name:"Arsa (büyük)",        emoji:"🌍", basePrice:2000000,  gunlukKira:0,    il:"rastgele" },
    { id:"depo",       name:"Depo / Antrepo",      emoji:"🏗️", basePrice:1800000,  gunlukKira:600,  il:"rastgele" },
    { id:"otel_oda",   name:"Otel Odası (hisse)",  emoji:"🏨", basePrice:800000,   gunlukKira:350,  il:"rastgele" },
    { id:"dukkan_no",  name:"Dükkan",             emoji:"🏪", basePrice:1200000,  gunlukKira:800,  il:"rastgele" }
  ],

  // ══ HABERLER ══
  NEWS_TEMPLATES: [
    "📈 {sym} hisseleri %{v} yükseldi — analistler olumlu.",
    "📉 {sym} değer kaybetti, satış baskısı devam ediyor.",
    "🏦 Merkez Bankası faizi değiştirmedi, piyasalar sakin.",
    "💰 {name} temettü ödeyecek, yatırımcılar memnun.",
    "🌍 Dolar/TL kuru {rate} seviyesinde seyrediyor.",
    "⚡ Kripto piyasaları hareketlendi, BTC atakta.",
    "🏗️ Konut fiyatları {baz} şehirde artışını sürdürüyor.",
    "📊 Borsa günü {yön} kapandı, işlem hacmi yüksek.",
    "🛢️ Petrol fiyatlarındaki değişim enerjiye yansıdı.",
    "🌾 Tarım ürünleri fiyatları mevsimsel artış gösterdi.",
    "💎 Altın fiyatları rekor kırdı, güvenli liman talebi arttı.",
    "🚗 Otomotiv sektöründe ihracat %{v} arttı.",
    "📱 Teknoloji hisseleri yükseldi, {sym} öne çıktı.",
    "🏪 Perakende satışları {ay} ayında %{v} artış gösterdi."
  ],

  // ══ DÜKKAN TÜRLERİ ══
  SHOP_TYPES: [
    { id:"market",  name:"Market",          emoji:"🛒", acilis:14000,  minLevel:1  },
    { id:"giyim",   name:"Giyim Mağazası",  emoji:"👕", acilis:21000,  minLevel:1  },
    { id:"telefon", name:"Teknoloji",       emoji:"📱", acilis:27000,  minLevel:5  },
    { id:"mobilya", name:"Mobilya",         emoji:"🪑", acilis:29000,  minLevel:8  },
    { id:"beyaz_e", name:"Beyaz Eşya",      emoji:"🏠", acilis:30000,  minLevel:10 },
    { id:"kuyumcu", name:"Kuyumcu",         emoji:"💍", acilis:42000,  minLevel:15 },
    { id:"oto",     name:"Oto Galeri",      emoji:"🚗", acilis:56000,  minLevel:20 },
    { id:"akaryak", name:"Akaryakıt",       emoji:"⛽", acilis:92000,  minLevel:25 }
  ]
};
