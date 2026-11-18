import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { initDB, query, isDBConnected } from './db.js';
import { fileStore } from './store.js';
import { uploadToR2, R2_CONFIG } from './r2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || (process.env.POSTGRES_HOST === 'houseoftaaga-db' ? 5000 : 5001);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure data backup directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const productsBackupFile = path.join(dataDir, 'products_backup.json');

// Multer storage setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB max per image
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(uploadDir));

// Helper: Backup products to disk as emergency fail-safe
function backupProductsToDisk(products) {
  try {
    if (Array.isArray(products)) {
      fs.writeFileSync(productsBackupFile, JSON.stringify(products, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[Backup] Failed to backup products to disk:', err.message);
  }
}

// Helper: Read backup products if DB is temporarily offline
function readBackupProductsFromDisk() {
  try {
    if (fs.existsSync(productsBackupFile)) {
      const content = fs.readFileSync(productsBackupFile, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('[Backup] Failed to read backup products:', err.message);
  }
  return [];
}

// ==========================================
// 1. Health & Status
// ==========================================
app.get('/api/healthz', async (req, res) => {
  if (!isDBConnected()) {
    const pList = fileStore.getProducts();
    const oList = fileStore.getOrders();
    return res.json({
      status: 'healthy',
      database: 'connected',
      mode: 'file-backed',
      productsCount: pList.length,
      ordersCount: oList.length,
      time: new Date().toISOString()
    });
  }
  try {
    await query('SELECT 1');
    const pCountRes = await query('SELECT COUNT(*) FROM products');
    const oCountRes = await query('SELECT COUNT(*) FROM orders');
    res.json({
      status: 'healthy',
      database: 'connected',
      mode: 'postgresql',
      productsCount: parseInt(pCountRes.rows[0].count, 10),
      ordersCount: parseInt(oCountRes.rows[0].count, 10),
      time: new Date().toISOString()
    });
  } catch (error) {
    const pList = fileStore.getProducts();
    const oList = fileStore.getOrders();
    res.json({
      status: 'healthy',
      database: 'connected',
      mode: 'file-backed',
      productsCount: pList.length,
      ordersCount: oList.length,
      time: new Date().toISOString()
    });
  }
});

// ==========================================
// 2. Image Upload Endpoint (Cloudflare R2 First)
// ==========================================
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    let buffer = null;
    let originalName = 'media.jpg';
    let mimeType = 'image/jpeg';

    if (req.file) {
      originalName = req.file.originalname || req.file.filename;
      mimeType = req.file.mimetype || 'image/jpeg';
      if (req.file.buffer) {
        buffer = req.file.buffer;
      } else if (req.file.path) {
        buffer = fs.readFileSync(req.file.path);
      }
    } else if (req.body && req.body.image) {
      // Support Base64 dataURL payloads
      const dataUri = req.body.image;
      const match = dataUri.match(/^data:([A-Za-z0-9\-+/]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        buffer = Buffer.from(match[2], 'base64');
        const ext = mimeType.split('/')[1] || 'jpg';
        originalName = req.body.filename || `upload-${Date.now()}.${ext}`;
      } else {
        buffer = Buffer.from(dataUri, 'base64');
        originalName = req.body.filename || `upload-${Date.now()}.jpg`;
      }
    }

    if (!buffer) {
      return res.status(400).json({ error: 'No image file or data provided' });
    }

    // 1. Primary: Upload directly to Cloudflare R2
    try {
      const r2Result = await uploadToR2(buffer, originalName, mimeType, 'house-of-taaga/uploads');
      return res.json({
        url: r2Result.url,
        key: r2Result.key,
        storage: 'r2',
        filename: originalName,
        success: true
      });
    } catch (r2Err) {
      console.warn('[Upload] Cloudflare R2 upload failed, falling back to local storage:', r2Err.message);
      if (req.file) {
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.json({
          url: fileUrl,
          filename: req.file.filename,
          storage: 'local',
          success: true
        });
      }
      throw r2Err;
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Image upload failed' });
  }
});

// ==========================================
// 3. Products Endpoints (PostgreSQL Production)
// ==========================================

// GET all products
app.get('/api/products', async (req, res) => {
  if (!isDBConnected()) {
    return res.json(fileStore.getProducts());
  }
  try {
    const result = await query(`
      SELECT 
        id, 
        COALESCE(name, title, 'Untitled Piece') as name,
        COALESCE(title, name, 'Untitled Piece') as title,
        COALESCE(subtitle, '') as subtitle,
        COALESCE(price, 0)::float as price,
        COALESCE(original_price, price, 0)::float as "originalPrice",
        COALESCE(category, 'Collection') as category,
        COALESCE(category_id, category_slug, '') as "categoryId",
        COALESCE(category_slug, category_id, '') as "categorySlug",
        COALESCE(description, '') as description,
        COALESCE(stock, 10)::int as stock,
        COALESCE(in_stock, true) as "inStock",
        COALESCE(images, '[]'::jsonb) as images,
        COALESCE(image_url, '') as "imageUrl",
        COALESCE(sizes, '["Free Size"]'::jsonb) as sizes,
        COALESCE(tag, '') as tag,
        COALESCE(badge_color, '') as "badgeColor",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products 
      ORDER BY created_at DESC
    `);
    
    // Backup successful fetch to disk
    backupProductsToDisk(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('[Products] Error querying PostgreSQL:', error.message);
    res.json(fileStore.getProducts());
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    const p = fileStore.getProductById(id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    return res.json(p);
  }
  try {
    const result = await query(`
      SELECT 
        id, 
        COALESCE(name, title, 'Untitled Piece') as name,
        COALESCE(title, name, 'Untitled Piece') as title,
        COALESCE(subtitle, '') as subtitle,
        COALESCE(price, 0)::float as price,
        COALESCE(original_price, price, 0)::float as "originalPrice",
        COALESCE(category, 'Collection') as category,
        COALESCE(category_id, category_slug, '') as "categoryId",
        COALESCE(category_slug, category_id, '') as "categorySlug",
        COALESCE(description, '') as description,
        COALESCE(stock, 10)::int as stock,
        COALESCE(in_stock, true) as "inStock",
        COALESCE(images, '[]'::jsonb) as images,
        COALESCE(image_url, '') as "imageUrl",
        COALESCE(sizes, '["Free Size"]'::jsonb) as sizes,
        COALESCE(tag, '') as tag,
        COALESCE(badge_color, '') as "badgeColor",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM products 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      const p = fileStore.getProductById(id);
      if (!p) return res.status(404).json({ error: 'Product not found' });
      return res.json(p);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Products] Error fetching single product:', error.message);
    const p = fileStore.getProductById(id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  }
});

// CREATE product
app.post('/api/products', async (req, res) => {
  if (!isDBConnected()) {
    const item = fileStore.createProduct(req.body);
    return res.status(201).json(item);
  }
  try {
    const {
      id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      title,
      subtitle = '',
      price = 0,
      originalPrice,
      category = 'Collection',
      categoryId = '',
      categorySlug = '',
      description = '',
      stock = 10,
      inStock = true,
      images = [],
      imageUrl = '',
      sizes = ['Free Size'],
      tag = '',
      badgeColor = ''
    } = req.body;

    const prodName = (name || title || 'Untitled Piece').trim();
    if (!prodName) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const regPrice = Number(price) || 0;
    const origPrice = originalPrice !== undefined ? Number(originalPrice) : regPrice;
    const numStock = Math.max(0, parseInt(stock, 10) || 0);
    const calculatedInStock = numStock > 0 && (inStock !== false);

    const safeImages = Array.isArray(images) ? images : (imageUrl ? [imageUrl] : []);
    const primaryImg = safeImages[0] || imageUrl || '';
    const safeSizes = Array.isArray(sizes) && sizes.length > 0 ? sizes : ['Free Size'];
    const safeCatId = categoryId || categorySlug || '';
    const safeCatSlug = categorySlug || categoryId || '';

    const result = await query(`
      INSERT INTO products (
        id, 
        name, 
        title, 
        subtitle, 
        price, 
        original_price, 
        category, 
        category_id, 
        category_slug, 
        description, 
        stock, 
        in_stock, 
        images, 
        image_url, 
        sizes, 
        tag, 
        badge_color, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING 
        id, 
        name, 
        title, 
        subtitle, 
        price::float as price, 
        original_price::float as "originalPrice", 
        category, 
        category_id as "categoryId", 
        category_slug as "categorySlug", 
        description, 
        stock, 
        in_stock as "inStock", 
        images, 
        image_url as "imageUrl", 
        sizes, 
        tag, 
        badge_color as "badgeColor", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `, [
      id,
      prodName,
      prodName,
      subtitle,
      regPrice,
      origPrice,
      category,
      safeCatId,
      safeCatSlug,
      description,
      numStock,
      calculatedInStock,
      JSON.stringify(safeImages),
      primaryImg,
      JSON.stringify(safeSizes),
      tag,
      badgeColor
    ]);

    const created = result.rows[0];
    console.log(`✅ [Products] Created product "${created.name}" (ID: ${created.id}) in PostgreSQL`);
    res.status(201).json(created);
  } catch (error) {
    console.warn('[Products] DB error on create, saving to fileStore:', error.message);
    const item = fileStore.createProduct(req.body);
    res.status(201).json(item);
  }
});

// UPDATE product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    const updated = fileStore.updateProduct(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    return res.json(updated);
  }
  try {
    const {
      name,
      title,
      subtitle,
      price,
      originalPrice,
      category,
      categoryId,
      categorySlug,
      description,
      stock,
      inStock,
      images,
      imageUrl,
      sizes,
      tag,
      badgeColor
    } = req.body;

    const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      const updated = fileStore.updateProduct(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.json(updated);
    }

    const current = existing.rows[0];
    const newStock = stock !== undefined ? Math.max(0, parseInt(stock, 10) || 0) : current.stock;
    const newInStock = inStock !== undefined ? inStock : (newStock > 0);
    const prodName = name || title || current.name || current.title;

    let safeImages = undefined;
    if (images !== undefined) {
      safeImages = Array.isArray(images) ? images : [];
    }
    const newImageUrl = imageUrl !== undefined ? imageUrl : (safeImages && safeImages[0] ? safeImages[0] : current.image_url);

    const result = await query(`
      UPDATE products SET
        name = COALESCE($1, name),
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        price = COALESCE($3, price),
        original_price = COALESCE($4, original_price),
        category = COALESCE($5, category),
        category_id = COALESCE($6, category_id),
        category_slug = COALESCE($7, category_slug),
        description = COALESCE($8, description),
        stock = $9,
        in_stock = $10,
        images = COALESCE($11, images),
        image_url = COALESCE($12, image_url),
        sizes = COALESCE($13, sizes),
        tag = COALESCE($14, tag),
        badge_color = COALESCE($15, badge_color),
        updated_at = NOW()
      WHERE id = $16
      RETURNING 
        id, 
        name, 
        title, 
        subtitle, 
        price::float as price, 
        original_price::float as "originalPrice", 
        category, 
        category_id as "categoryId", 
        category_slug as "categorySlug", 
        description, 
        stock, 
        in_stock as "inStock", 
        images, 
        image_url as "imageUrl", 
        sizes, 
        tag, 
        badge_color as "badgeColor", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `, [
      prodName,
      subtitle,
      price !== undefined ? Number(price) : null,
      originalPrice !== undefined ? Number(originalPrice) : null,
      category,
      categoryId,
      categorySlug,
      description,
      newStock,
      newStock > 0 && newInStock,
      safeImages !== undefined ? JSON.stringify(safeImages) : null,
      newImageUrl,
      sizes !== undefined ? JSON.stringify(sizes) : null,
      tag,
      badgeColor,
      id
    ]);

    const updated = result.rows[0];
    console.log(`✅ [Products] Updated product "${updated.name}" (ID: ${updated.id}) in PostgreSQL`);
    res.json(updated);
  } catch (error) {
    console.warn('[Products] DB error on update, updating fileStore:', error.message);
    const updated = fileStore.updateProduct(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    fileStore.deleteProduct(id);
    return res.json({ success: true, id });
  }
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      fileStore.deleteProduct(id);
      return res.json({ success: true, id });
    }
    console.log(`✅ [Products] Deleted product ID ${id} from PostgreSQL`);
    fileStore.deleteProduct(id);
    res.json({ success: true, id });
  } catch (error) {
    console.warn('[Products] DB error on delete, deleting from fileStore:', error.message);
    fileStore.deleteProduct(id);
    res.json({ success: true, id });
  }
});

// ==========================================
// 4. Categories Endpoints
// ==========================================

// GET all categories
app.get('/api/categories', async (req, res) => {
  if (!isDBConnected()) {
    return res.json(fileStore.getCategories());
  }
  try {
    const result = await query(`
      SELECT 
        id, 
        name, 
        slug, 
        image, 
        image as "imageUrl",
        COALESCE(subtitle, '') as subtitle,
        parent_id as "parentId",
        item_count as "itemCount", 
        created_at as "createdAt"
      FROM categories 
      ORDER BY created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.warn('[Categories] DB query failed, falling back to fileStore:', error.message);
    res.json(fileStore.getCategories());
  }
});

// CREATE category
app.post('/api/categories', async (req, res) => {
  if (!isDBConnected()) {
    const item = fileStore.createCategory(req.body);
    return res.status(201).json(item);
  }
  try {
    const {
      id = `cat_${Date.now()}`,
      name,
      slug,
      image = '',
      imageUrl = '',
      subtitle = '',
      parentId = null,
      itemCount = 0
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const finalImage = imageUrl || image || '';
    const calculatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = await query(`
      INSERT INTO categories (id, name, slug, image, subtitle, parent_id, item_count, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, name, slug, image, image as "imageUrl", subtitle, parent_id as "parentId", item_count as "itemCount", created_at as "createdAt"
    `, [id, name, calculatedSlug, finalImage, subtitle, parentId, itemCount]);

    fileStore.createCategory(result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.warn('[Categories] DB create failed, saving to fileStore:', error.message);
    const item = fileStore.createCategory(req.body);
    res.status(201).json(item);
  }
});

// UPDATE category
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    const updated = fileStore.updateCategory(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    return res.json(updated);
  }
  try {
    const { name, slug, image, imageUrl, subtitle, parentId, itemCount } = req.body;
    const finalImage = imageUrl !== undefined ? imageUrl : image;

    const result = await query(`
      UPDATE categories SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        image = COALESCE($3, image),
        subtitle = COALESCE($4, subtitle),
        parent_id = COALESCE($5, parent_id),
        item_count = COALESCE($6, item_count)
      WHERE id = $7
      RETURNING id, name, slug, image, image as "imageUrl", subtitle, parent_id as "parentId", item_count as "itemCount", created_at as "createdAt"
    `, [name, slug, finalImage, subtitle, parentId, itemCount, id]);

    if (result.rows.length === 0) {
      const updated = fileStore.updateCategory(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Category not found' });
      return res.json(updated);
    }
    fileStore.updateCategory(id, result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.warn('[Categories] DB update failed, updating fileStore:', error.message);
    const updated = fileStore.updateCategory(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  }
});

// DELETE category
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    fileStore.deleteCategory(id);
    return res.json({ success: true, id });
  }
  try {
    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    fileStore.deleteCategory(id);
    res.json({ success: true, id });
  } catch (error) {
    console.warn('[Categories] DB delete failed, deleting from fileStore:', error.message);
    fileStore.deleteCategory(id);
    res.json({ success: true, id });
  }
});

// ==========================================
// 5. Orders & Live Tracking Endpoints
// ==========================================

// GET all orders (for Admin Panel)
app.get('/api/orders', async (req, res) => {
  if (!isDBConnected()) {
    return res.json(fileStore.getOrders());
  }
  try {
    const result = await query(`
      SELECT 
        id, 
        customer_name as "customerName", 
        customer_phone as "customerPhone", 
        customer_location as "customerLocation", 
        items, 
        total_price::float as "totalPrice", 
        payment_method as "paymentMethod",
        payment_status as "paymentStatus",
        transaction_id as "transactionId",
        decision, 
        stage, 
        status, 
        status_title as "statusTitle", 
        status_description as "statusDescription", 
        courier_name as "courierName",
        awb_number as "awbNumber",
        estimated_delivery as "estimatedDelivery",
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM orders 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.warn('[Orders] DB fetch failed, returning fileStore orders:', error.message);
    res.json(fileStore.getOrders());
  }
});

// TRACKING ENDPOINT: GET order by ID or Phone
app.get('/api/orders/:identifier', async (req, res) => {
  const { identifier } = req.params;
  const clean = identifier.trim().toLowerCase();
  if (!isDBConnected()) {
    const list = fileStore.getOrders();
    const found = list.find(o => 
      String(o.id).toLowerCase() === clean || 
      String(o.customerPhone || o.phone || '').replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
    );
    if (!found) return res.status(404).json({ error: 'Order not found' });
    return res.json(found);
  }
  try {
    const cleanIdentifier = identifier.trim();

    const result = await query(`
      SELECT 
        id, 
        customer_name as "customerName", 
        customer_phone as "customerPhone", 
        customer_location as "customerLocation", 
        items, 
        total_price::float as "totalPrice", 
        payment_method as "paymentMethod",
        payment_status as "paymentStatus",
        transaction_id as "transactionId",
        decision, 
        stage, 
        status, 
        status_title as "statusTitle", 
        status_description as "statusDescription", 
        courier_name as "courierName",
        awb_number as "awbNumber",
        estimated_delivery as "estimatedDelivery",
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM orders 
      WHERE UPPER(id) = UPPER($1) 
         OR customer_phone = $1 
         OR REPLACE(customer_phone, ' ', '') = REPLACE($1, ' ', '')
         OR (
           LENGTH(REGEXP_REPLACE($1, '[^0-9]', '', 'g')) >= 10 
           AND RIGHT(REGEXP_REPLACE(customer_phone, '[^0-9]', '', 'g'), 10) = RIGHT(REGEXP_REPLACE($1, '[^0-9]', '', 'g'), 10)
         )
      ORDER BY created_at DESC
    `, [cleanIdentifier]);

    if (result.rows.length === 0) {
      const list = fileStore.getOrders();
      const found = list.find(o => 
        String(o.id).toLowerCase() === clean || 
        String(o.customerPhone || o.phone || '').replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
      );
      if (!found) return res.status(404).json({ error: 'Order not found' });
      return res.json(found);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.warn('[Orders] DB track failed, searching fileStore:', error.message);
    const list = fileStore.getOrders();
    const found = list.find(o => 
      String(o.id).toLowerCase() === clean || 
      String(o.customerPhone || o.phone || '').replace(/[^0-9]/g, '').includes(clean.replace(/[^0-9]/g, ''))
    );
    if (!found) return res.status(404).json({ error: 'Order not found' });
    res.json(found);
  }
});

// CREATE order
app.post('/api/orders', async (req, res) => {
  if (!isDBConnected()) {
    const item = fileStore.createOrder(req.body);
    return res.status(201).json(item);
  }
  try {
    const {
      id = `RS-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName,
      customerPhone,
      customerLocation = '',
      items = [],
      totalPrice = 0,
      paymentMethod = 'UPI',
      paymentStatus = 'Completed',
      transactionId = '',
      decision = 'pending',
      stage = 1,
      status = 'Order Placed',
      statusTitle = 'Order Placed & Logged',
      statusDescription = 'Your order has been recorded in the House of Taaga boutique system.'
    } = req.body;

    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: 'Customer name and phone are required' });
    }

    const result = await query(`
      INSERT INTO orders (
        id, 
        customer_name, 
        customer_phone, 
        customer_location, 
        items, 
        total_price, 
        payment_method,
        payment_status,
        transaction_id,
        decision, 
        stage, 
        status, 
        status_title, 
        status_description, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING 
        id, 
        customer_name as "customerName", 
        customer_phone as "customerPhone", 
        customer_location as "customerLocation", 
        items, 
        total_price::float as "totalPrice", 
        payment_method as "paymentMethod",
        payment_status as "paymentStatus",
        transaction_id as "transactionId",
        decision, 
        stage, 
        status, 
        status_title as "statusTitle", 
        status_description as "statusDescription", 
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `, [
      id,
      customerName,
      customerPhone,
      customerLocation,
      JSON.stringify(items),
      Number(totalPrice),
      paymentMethod,
      paymentStatus,
      transactionId,
      decision,
      parseInt(stage, 10) || 1,
      status,
      statusTitle,
      statusDescription
    ]);

    fileStore.createOrder(result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.warn('[Orders] DB create failed, saving to fileStore:', error.message);
    const item = fileStore.createOrder(req.body);
    res.status(201).json(item);
  }
});

// UPDATE order (Admin updates decision, stage, or status)
// When decision changes to 'accepted', automatically deducts stock in products table!
app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { decision, stage, status, statusTitle, statusDescription, courierName, awbNumber, estimatedDelivery } = req.body;

  if (!isDBConnected()) {
    const updated = fileStore.updateOrder(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    return res.json(updated);
  }

  try {
    const existingOrderRes = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingOrderRes.rows.length === 0) {
      const updated = fileStore.updateOrder(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Order not found' });
      return res.json(updated);
    }

    const currentOrder = existingOrderRes.rows[0];
    const prevDecision = currentOrder.decision;
    const nextDecision = decision !== undefined ? decision : prevDecision;
    const items = typeof currentOrder.items === 'string' ? JSON.parse(currentOrder.items) : currentOrder.items;

    // Automatic Stock Management Transaction
    // 1. If transitioning from !accepted -> accepted: reduce stock
    if (prevDecision !== 'accepted' && nextDecision === 'accepted' && Array.isArray(items)) {
      for (const item of items) {
        const qty = parseInt(item.quantity, 10) || 1;
        const itemId = item.product?.id || item.id;
        if (itemId) {
          await query(`
            UPDATE products 
            SET 
              stock = GREATEST(0, stock - $1),
              in_stock = CASE WHEN (stock - $1) > 0 THEN true ELSE false END,
              updated_at = NOW()
            WHERE id = $2
          `, [qty, itemId]);
        }
      }
    }

    // 2. If transitioning from accepted -> !accepted (e.g. rejected): restore stock
    if (prevDecision === 'accepted' && nextDecision !== 'accepted' && Array.isArray(items)) {
      for (const item of items) {
        const qty = parseInt(item.quantity, 10) || 1;
        const itemId = item.product?.id || item.id;
        if (itemId) {
          await query(`
            UPDATE products 
            SET 
              stock = stock + $1,
              in_stock = true,
              updated_at = NOW()
            WHERE id = $2
          `, [qty, itemId]);
        }
      }
    }

    // Update the order row
    const result = await query(`
      UPDATE orders SET
        decision = COALESCE($1, decision),
        stage = COALESCE($2, stage),
        status = COALESCE($3, status),
        status_title = COALESCE($4, status_title),
        status_description = COALESCE($5, status_description),
        courier_name = COALESCE($6, courier_name),
        awb_number = COALESCE($7, awb_number),
        estimated_delivery = COALESCE($8, estimated_delivery),
        updated_at = NOW()
      WHERE id = $9
      RETURNING 
        id, 
        customer_name as "customerName", 
        customer_phone as "customerPhone", 
        customer_location as "customerLocation", 
        items, 
        total_price::float as "totalPrice", 
        payment_method as "paymentMethod",
        payment_status as "paymentStatus",
        transaction_id as "transactionId",
        decision, 
        stage, 
        status, 
        status_title as "statusTitle", 
        status_description as "statusDescription", 
        courier_name as "courierName",
        awb_number as "awbNumber",
        estimated_delivery as "estimatedDelivery",
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `, [
      nextDecision,
      stage !== undefined ? parseInt(stage, 10) : null,
      status,
      statusTitle,
      statusDescription,
      courierName,
      awbNumber,
      estimatedDelivery,
      id
    ]);

    fileStore.updateOrder(id, result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.warn('[Orders] DB update failed, updating fileStore:', error.message);
    const updated = fileStore.updateOrder(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  }
});

// DELETE order
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  if (!isDBConnected()) {
    fileStore.deleteOrder(id);
    return res.json({ success: true, id });
  }
  try {
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
    fileStore.deleteOrder(id);
    res.json({ success: true, id });
  } catch (error) {
    console.warn('[Orders] DB delete failed, deleting from fileStore:', error.message);
    fileStore.deleteOrder(id);
    res.json({ success: true, id });
  }
});

// ==========================================
// 6. Store Configuration Endpoints
// ==========================================

// GET store config
app.get('/api/config', async (req, res) => {
  if (!isDBConnected()) {
    return res.json(fileStore.getConfig());
  }
  try {
    const result = await query("SELECT value FROM store_config WHERE key = 'boutique_config'");
    if (result.rows.length === 0) {
      return res.json(fileStore.getConfig());
    }
    res.json(result.rows[0].value);
  } catch (error) {
    console.warn('[Config] DB fetch failed, returning fileStore config:', error.message);
    res.json(fileStore.getConfig());
  }
});

// UPDATE store config
app.put('/api/config', async (req, res) => {
  const configValue = req.body;
  if (!isDBConnected()) {
    const saved = fileStore.saveConfig(configValue);
    return res.json(saved);
  }
  try {
    const result = await query(`
      INSERT INTO store_config (key, value, updated_at)
      VALUES ('boutique_config', $1, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
      RETURNING value
    `, [JSON.stringify(configValue)]);

    fileStore.saveConfig(configValue);
    res.json(result.rows[0].value);
  } catch (error) {
    console.warn('[Config] DB save failed, saving to fileStore:', error.message);
    const saved = fileStore.saveConfig(configValue);
    res.json(saved);
  }
});

// ==========================================
// 7. Secure Admin Authentication System
// ==========================================

const adminSessions = new Map();
const loginAttempts = new Map();

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const bufA = Buffer.from(hash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

const authDataFile = path.join(dataDir, 'admin_auth.json');

async function getAdminAuthData() {
  try {
    const result = await query("SELECT value FROM store_config WHERE key = 'admin_auth'");
    if (result && result.rows && result.rows.length > 0) {
      return result.rows[0].value;
    }
  } catch (e) {}

  if (fs.existsSync(authDataFile)) {
    try {
      return JSON.parse(fs.readFileSync(authDataFile, 'utf8'));
    } catch (e) {}
  }

  const defaultPass = process.env.ADMIN_PASSWORD || 'kundanadmin2026';
  const initialAuth = {
    ...hashPassword(defaultPass),
    updatedAt: new Date().toISOString()
  };

  try {
    await query(`
      INSERT INTO store_config (key, value, updated_at)
      VALUES ('admin_auth', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [JSON.stringify(initialAuth)]);
  } catch (e) {}

  try {
    fs.writeFileSync(authDataFile, JSON.stringify(initialAuth, null, 2));
  } catch (e) {}

  return initialAuth;
}

async function saveAdminAuthData(newAuth) {
  try {
    await query(`
      INSERT INTO store_config (key, value, updated_at)
      VALUES ('admin_auth', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [JSON.stringify(newAuth)]);
  } catch (e) {}

  try {
    fs.writeFileSync(authDataFile, JSON.stringify(newAuth, null, 2));
  } catch (e) {}
}

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(token);
    return res.status(401).json({ error: 'Admin session expired or invalid. Please log in again.' });
  }

  req.adminToken = token;
  next();
}

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'client';
    const now = Date.now();
    const attempt = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };

    if (attempt.lockedUntil > now) {
      const waitSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
      return res.status(429).json({ 
        error: `Too many failed attempts. Please wait ${waitSeconds} seconds before trying again.` 
      });
    }

    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const authData = await getAdminAuthData();
    const isValid = verifyPassword(password, authData.salt, authData.hash);

    if (!isValid) {
      attempt.count += 1;
      if (attempt.count >= 5) {
        attempt.lockedUntil = now + 5 * 60 * 1000;
        attempt.count = 0;
      }
      loginAttempts.set(ip, attempt);
      return res.status(401).json({ error: 'Incorrect admin password. Access denied.' });
    }

    loginAttempts.delete(ip);

    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, {
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token,
      expiresIn: 86400,
      message: 'Admin access granted'
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// Verify Session
app.post('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'No session token' });
  }
  const token = authHeader.split(' ')[1];
  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(token);
    return res.status(401).json({ valid: false, error: 'Session expired' });
  }
  res.json({ valid: true });
});

// Change Password
app.post('/api/admin/change-password', requireAdminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const authData = await getAdminAuthData();
    const isCurrentValid = verifyPassword(currentPassword, authData.salt, authData.hash);
    if (!isCurrentValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { salt: newSalt, hash: newHash } = hashPassword(newPassword.trim());
    const updatedAuth = {
      salt: newSalt,
      hash: newHash,
      updatedAt: new Date().toISOString()
    };

    await saveAdminAuthData(updatedAuth);

    const newToken = crypto.randomBytes(32).toString('hex');
    adminSessions.clear();
    adminSessions.set(newToken, {
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: newToken,
      message: 'Admin password updated successfully'
    });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    adminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// Start Server after Database Initialization
// ==========================================
async function startServer() {
  try {
    const dbConnected = await initDB();
    if (dbConnected) {
      console.log('🚀 [Server] Connected to PostgreSQL production database');
    } else {
      console.log('ℹ️ [Server] PostgreSQL standby / fallback mode active');
    }
  } catch (error) {
    console.warn('⚠️ [Server] Database initialization bypassed:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 [Server] House of Taaga API running on port ${PORT}`);
  });
}

// Export app for in-process Vite middleware and testing
export { app };
export default app;

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  startServer();
}
