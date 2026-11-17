import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const productsFile = path.join(dataDir, 'products.json');
const categoriesFile = path.join(dataDir, 'categories.json');
const ordersFile = path.join(dataDir, 'orders.json');
const configFile = path.join(dataDir, 'config.json');
const adminFile = path.join(dataDir, 'admin.json');

const INITIAL_CATEGORIES = [
  {
    id: 'cat_kurtas',
    name: 'Kurtas',
    slug: 'kurtas',
    subtitle: 'Everyday Grace & Silhouettes',
    imageUrl: '/category-kurtas.jpg',
    order: 1,
  },
  {
    id: 'cat_sarees',
    name: 'Sarees',
    slug: 'sarees',
    subtitle: 'Six Yards of Handwoven Poetry',
    imageUrl: '/category-sarees.jpg',
    order: 2,
  },
  {
    id: 'cat_coord',
    name: 'Co-ord Sets',
    slug: 'coord-sets',
    subtitle: 'Modern Ease & Artisanal Cuts',
    imageUrl: '/category-coord.jpg',
    order: 3,
  },
  {
    id: 'cat_festive',
    name: 'Festive Edit',
    slug: 'festive-edit',
    subtitle: 'Heirloom Silks & Zari Details',
    imageUrl: '/category-festive.jpg',
    order: 4,
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 'taaga_prod_1',
    slug: 'mustard-bandhani-zari-kurta-set',
    title: 'Mustard Bandhani Zari Kurta Set',
    name: 'Mustard Bandhani Zari Kurta Set',
    category: 'Kurtas',
    categorySlug: 'kurtas',
    categoryIds: ['cat_kurtas'],
    price: 2890,
    originalPrice: 3690,
    tag: 'Bestseller',
    badgeColor: 'bg-[#B65A37]',
    sku: 'HT-KURT-01',
    stock: 12,
    inStock: true,
    imageUrl: '/category-kurtas.jpg',
    images: ['/category-kurtas.jpg', '/founders.jpg'],
    description: 'An ode to timeless craftsmanship, this radiant mustard yellow kurta is handcrafted in artisanal Bandhani resist-dye with intricate golden zari hand-embroidery adorning the split neckline and cuffs. Paired with straight-cut cotton silk pants and lightweight mulmul dupatta with playful handmade tassels.',
    fabric: 'Pure Modal Bandhani with Butter Cotton Lining',
    care: 'Dry clean recommended for first wash. Gentle cold hand wash thereafter with mild liquid detergent.',
    fit: 'Relaxed A-line silhouette with side slits. Model is wearing size S.',
    shippingScope: 'all_india',
    careTips: 'Dry clean recommended for first wash. Gentle cold hand wash thereafter with mild liquid detergent.',
    deliveryReturns: 'Dispatched in 2-3 business days. 7-day hassle-free replacement or store exchange available.',
    highlights: {
      replacement: '7-day easy exchange guarantee',
      delivery: 'Ships across India in 3-5 days',
      guidance: 'Direct WhatsApp styling advice',
      packaging: 'Sustainable artisanal cotton keepsake box',
      sold24h: '18 sold'
    },
    showSampleReviews: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: 'taaga_prod_2',
    slug: 'royal-mulberry-embroidered-kaftan-kurta',
    title: 'Royal Mulberry Kaftan Kurta',
    name: 'Royal Mulberry Kaftan Kurta',
    category: 'Festive Edit',
    categorySlug: 'festive-edit',
    categoryIds: ['cat_festive'],
    price: 3450,
    originalPrice: 4200,
    tag: 'Festive Pick',
    badgeColor: 'bg-[#A7472B]',
    sku: 'HT-KAFT-02',
    stock: 8,
    inStock: true,
    imageUrl: '/category-festive.jpg',
    images: ['/category-festive.jpg', '/founders.jpg'],
    description: 'Worn by co-founder Neeta in our Pune studio, this royal mulberry purple kaftan kurta features a rich yoke of intricate threadwork, gota border detailing, and delicate mirror highlights. Effortlessly regal yet supremely comfortable for festive gatherings and intimate evenings.',
    fabric: 'Silk Viscose Satin with Hand-Embroidered Yoke',
    care: 'Dry clean only to preserve delicate zari and embroidery work.',
    fit: 'Fluid relaxed kaftan drape with drawstring cinch for versatile styling.',
    shippingScope: 'all_india',
    careTips: 'Dry clean only to preserve delicate zari and embroidery work.',
    deliveryReturns: 'Dispatched within 48 hours. Free return pickup on damaged or wrong items.',
    highlights: {
      replacement: '7-day replacement guarantee',
      delivery: 'Fast express delivery across India',
      guidance: 'Personal styling and fit support',
      packaging: 'Luxury boutique dust bag included',
      sold24h: '12 sold'
    },
    showSampleReviews: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 42
  },
  {
    id: 'taaga_prod_3',
    slug: 'chanderi-lotus-handloom-saree',
    title: 'Chanderi Lotus Handloom Saree',
    name: 'Chanderi Lotus Handloom Saree',
    category: 'Sarees',
    categorySlug: 'sarees',
    categoryIds: ['cat_sarees'],
    price: 4990,
    originalPrice: 6200,
    tag: 'Handcrafted',
    badgeColor: 'bg-[#C69B52]',
    sku: 'HT-SAREE-03',
    stock: 6,
    inStock: true,
    imageUrl: '/category-sarees.jpg',
    images: ['/category-sarees.jpg'],
    description: 'Woven with whisper-light Chanderi silk and fine cotton warp, this saree features delicate hand-woven lotus bootis in antique golden zari, framed by a soft scalloped border in rosewood terracotta. Includes unstitched blouse fabric.',
    fabric: 'Handloom Chanderi Silk Cotton with Golden Zari Weave',
    care: 'Dry clean only. Store wrapped in pure unbleached cotton or muslin cloth.',
    fit: '6.5 meters with blouse piece. Drapes with fluid, airy elegance.',
    shippingScope: 'all_india',
    careTips: 'Store wrapped in pure cotton cloth away from direct sunlight.',
    deliveryReturns: 'Free insured delivery. 7-day return policy.',
    highlights: {
      replacement: 'Authenticity & weave guarantee',
      delivery: 'Insured transit across India',
      guidance: 'Draping assistance on WhatsApp',
      packaging: 'Heritage unbleached muslin wrap',
      sold24h: '7 sold'
    },
    showSampleReviews: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 29
  },
  {
    id: 'taaga_prod_4',
    slug: 'terracotta-slub-linen-co-ord-set',
    title: 'Terracotta Slub Linen Co-ord Set',
    name: 'Terracotta Slub Linen Co-ord Set',
    category: 'Co-ord Sets',
    categorySlug: 'coord-sets',
    categoryIds: ['cat_coord'],
    price: 2490,
    originalPrice: 3150,
    tag: 'New Arrival',
    badgeColor: 'bg-[#B65A37]',
    sku: 'HT-COORD-04',
    stock: 15,
    inStock: true,
    imageUrl: '/category-coord.jpg',
    images: ['/category-coord.jpg'],
    description: 'Designed for effortless everyday elegance, this two-piece co-ord set in rustic earthy terracotta combines a relaxed Mandarin-collar tunic with deep front pocket details and tailored wide-leg trousers with an elasticated waistband.',
    fabric: '100% Breathable Slub Cotton Linen',
    care: 'Machine wash gentle cold or hand wash with like colors. Line dry in shade.',
    fit: 'Relaxed contemporary fit with breathable ease.',
    shippingScope: 'all_india',
    careTips: 'Machine wash gentle cold or hand wash with like colors. Line dry in shade.',
    deliveryReturns: 'Ships in 24 hours. Easy size exchanges.',
    highlights: {
      replacement: 'Hassle-free size exchange',
      delivery: 'Ships across India in 3-4 days',
      guidance: 'Size recommendation assistance',
      packaging: 'Eco-conscious corrugated packaging',
      sold24h: '23 sold'
    },
    showSampleReviews: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 24
  },
  {
    id: 'taaga_prod_5',
    slug: 'ivory-marigold-kalidar-anarkali-set',
    title: 'Ivory & Marigold Kalidar Anarkali',
    name: 'Ivory & Marigold Kalidar Anarkali',
    category: 'Kurtas',
    categorySlug: 'kurtas',
    categoryIds: ['cat_kurtas'],
    price: 3890,
    originalPrice: 4800,
    tag: 'Editorial',
    badgeColor: 'bg-[#D85179]',
    sku: 'HT-ANAR-05',
    stock: 9,
    inStock: true,
    imageUrl: '/founders.jpg',
    images: ['/founders.jpg', '/category-kurtas.jpg'],
    description: 'Crafted in soft mulmul cotton with an ethereal 24-kali flare, finished with subtle marigold edging and delicate gota patti work along the hemline. Comes complete with churidar pants and a lightweight Kota Doria dupatta.',
    fabric: 'Pure Mulmul Cotton with Fine Gota Patti Detailing',
    care: 'Gentle hand wash cold or mild dry clean.',
    fit: 'Fitted empire bodice with voluminous kalidar flare.',
    shippingScope: 'all_india',
    careTips: 'Gentle hand wash cold or mild dry clean.',
    deliveryReturns: 'Delivered in 4-6 business days.',
    highlights: {
      replacement: '7-day replacement guarantee',
      delivery: 'Free express shipping',
      guidance: 'Custom sizing consultation available',
      packaging: 'Artisanal gift box',
      sold24h: '15 sold'
    },
    showSampleReviews: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 31
  },
  {
    id: 'taaga_prod_6',
    slug: 'bagh-e-pune-silk-brocade-saree',
    title: 'Bagh-e-Pune Silk Brocade Saree',
    name: 'Bagh-e-Pune Silk Brocade Saree',
    category: 'Festive Edit',
    categorySlug: 'festive-edit',
    categoryIds: ['cat_festive'],
    price: 5600,
    originalPrice: 7000,
    tag: 'Heirloom Edition',
    badgeColor: 'bg-[#A7472B]',
    sku: 'HT-PAITH-06',
    stock: 5,
    inStock: true,
    imageUrl: '/category-festive.jpg',
    images: ['/category-festive.jpg'],
    description: 'Inspired by the royal courts and gardens of historical Pune, this heritage silk brocade saree weaves traditional floral vine meenakari into deep jewel tones with an opulent antique zari pallu. An heirloom keepsake for festive milestones.',
    fabric: 'Pure Woven Silk Brocade with Antiqued Zari',
    care: 'Professional dry clean only.',
    fit: '6.5 meters with blouse piece.',
    shippingScope: 'all_india',
    careTips: 'Professional dry clean only.',
    deliveryReturns: 'Insured courier with signature confirmation.',
    highlights: {
      replacement: 'Heirloom silk authenticity guarantee',
      delivery: 'Express delivery 3-5 days',
      guidance: 'Live video call inspection on request',
      packaging: 'Handmade luxury heirloom box',
      sold24h: '9 sold'
    },
    showSampleReviews: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 19
  }
];

const INITIAL_CONFIG = {
  storeName: 'HOUSE OF TAAGA',
  shortName: 'House of Taaga',
  tagline: 'A little tradition, a lot of love',
  subHeading: 'A mother-daughter label born from our shared love for Indian wear, thoughtful details, and handcrafted pieces.',
  announcement: 'A little tradition, a lot of love',
  heroSubtitle: 'Rooted in love. Worn with grace.',
  promoBanner: 'Artisanal Indian Wear • Thoughtful Details',
  whatsappNumber: '+91 93133 06258',
  supportEmail: 'care@houseoftaaga.com',
  location: 'House of Taaga Studio, Pune, Maharashtra, India',
  city: 'Pune',
  instagram: 'house_of_taaga',
  owner: 'House of Taaga',
  facebook: 'House of Taaga',
  westernWear: 'house_of_taaga',
  shipping: {
    standardCharge: 40,
    freeDeliveryMin: 3999
  },
  offers: {
    showAnnouncement: true,
    announcementMessage: 'A little tradition, a lot of love',
    enableDiscount: false,
    discountTitle: 'Festive Celebration',
    discountType: 'percentage',
    discountPercentage: 10,
    minOrderSubtotal: 999,
    maxCap: 350,
    enableNudgeBanner: true
  },
  heroBanners: {
    mobile: [],
    desktop: [],
    belowTicker: 'House of Taaga · Pune Studio, Maharashtra, India | WhatsApp: +91 93133 06258',
    endTicker: 'Each piece is handcrafted with care in small batches. Please allow 2-4 days for careful packaging and quality check.'
  }
};

function readJson(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn(`[Store] Error reading ${file}:`, err.message);
  }
  return fallback;
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[Store] Error writing ${file}:`, err.message);
    return false;
  }
}

// Initialize seed data if files don't exist
if (!fs.existsSync(categoriesFile)) writeJson(categoriesFile, INITIAL_CATEGORIES);
if (!fs.existsSync(productsFile)) writeJson(productsFile, INITIAL_PRODUCTS);
if (!fs.existsSync(ordersFile)) writeJson(ordersFile, []);
if (!fs.existsSync(configFile)) writeJson(configFile, INITIAL_CONFIG);
if (!fs.existsSync(adminFile)) {
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultHash = crypto.pbkdf2Sync('kundanadmin2026', defaultSalt, 100000, 64, 'sha512').toString('hex');
  writeJson(adminFile, { passwordHash: defaultHash, salt: defaultSalt, tokenSecret: crypto.randomBytes(32).toString('hex') });
}

export const fileStore = {
  // Categories
  getCategories: () => readJson(categoriesFile, INITIAL_CATEGORIES),
  saveCategories: (cats) => writeJson(categoriesFile, cats),
  createCategory: (cat) => {
    const list = readJson(categoriesFile, INITIAL_CATEGORIES);
    const item = { ...cat, id: cat.id || `cat_${Date.now()}` };
    list.push(item);
    writeJson(categoriesFile, list);
    return item;
  },
  updateCategory: (id, updates) => {
    const list = readJson(categoriesFile, INITIAL_CATEGORIES);
    const idx = list.findIndex(c => c.id === id || c.slug === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    writeJson(categoriesFile, list);
    return list[idx];
  },
  deleteCategory: (id) => {
    const list = readJson(categoriesFile, INITIAL_CATEGORIES);
    const next = list.filter(c => c.id !== id && c.slug !== id);
    writeJson(categoriesFile, next);
    return true;
  },

  // Products
  getProducts: () => readJson(productsFile, INITIAL_PRODUCTS),
  getProductById: (id) => {
    const list = readJson(productsFile, INITIAL_PRODUCTS);
    return list.find(p => p.id === id || p.slug === id) || null;
  },
  createProduct: (prod) => {
    const list = readJson(productsFile, INITIAL_PRODUCTS);
    const item = {
      ...prod,
      id: prod.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    writeJson(productsFile, list);
    return item;
  },
  updateProduct: (id, updates) => {
    const list = readJson(productsFile, INITIAL_PRODUCTS);
    const idx = list.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJson(productsFile, list);
    return list[idx];
  },
  deleteProduct: (id) => {
    const list = readJson(productsFile, INITIAL_PRODUCTS);
    const next = list.filter(p => p.id !== id && p.slug !== id);
    writeJson(productsFile, next);
    return true;
  },

  // Orders
  getOrders: () => readJson(ordersFile, []),
  createOrder: (order) => {
    const list = readJson(ordersFile, []);
    const item = {
      ...order,
      id: order.id || `HT-ORD-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    writeJson(ordersFile, list);
    return item;
  },
  updateOrder: (id, updates) => {
    const list = readJson(ordersFile, []);
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    writeJson(ordersFile, list);
    return list[idx];
  },
  deleteOrder: (id) => {
    const list = readJson(ordersFile, []);
    const next = list.filter(o => o.id !== id);
    writeJson(ordersFile, next);
    return true;
  },

  // Config
  getConfig: () => readJson(configFile, INITIAL_CONFIG),
  saveConfig: (updates) => {
    const curr = readJson(configFile, INITIAL_CONFIG);
    const next = { ...curr, ...updates };
    writeJson(configFile, next);
    return next;
  },

  // Admin Auth
  getAdminAuth: () => readJson(adminFile, {}),
  saveAdminAuth: (auth) => writeJson(adminFile, auth)
};
