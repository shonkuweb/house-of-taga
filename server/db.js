import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Connection configuration
const connectionString = process.env.DATABASE_URL || 
  `postgres://${process.env.POSTGRES_USER || 'taaga_admin'}:${process.env.POSTGRES_PASSWORD || 'taaga_secure_pass_2026'}@${process.env.POSTGRES_HOST || 'houseoftaaga-db'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'houseoftaaga'}`;

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

let dbIsReady = false;

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

export const query = (text, params) => pool.query(text, params);
export const isDBConnected = () => dbIsReady;

/**
 * Initialize and auto-migrate PostgreSQL tables with retry mechanism.
 * Gives PostgreSQL time to boot in Docker Compose (up to 30-40 seconds).
 */
export async function initDB(maxRetries = 15, delayMs = 1500) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DB] Connecting to PostgreSQL (attempt ${attempt}/${maxRetries})...`);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // 1. Categories Table
        await client.query(`
          CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            image TEXT,
            item_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);

        // Categories Auto-Migrations
        await client.query(`
          ALTER TABLE categories ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';
          ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id TEXT DEFAULT NULL;
          ALTER TABLE categories ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
        `);

        // 2. Products Table
        await client.query(`
          CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            title TEXT,
            subtitle TEXT DEFAULT '',
            price NUMERIC(10, 2) NOT NULL DEFAULT 0,
            original_price NUMERIC(10, 2) DEFAULT 0,
            category TEXT DEFAULT 'Collection',
            category_id TEXT DEFAULT '',
            category_slug TEXT DEFAULT '',
            description TEXT DEFAULT '',
            stock INTEGER DEFAULT 10,
            in_stock BOOLEAN DEFAULT true,
            images JSONB DEFAULT '[]'::jsonb,
            image_url TEXT DEFAULT '',
            sizes JSONB DEFAULT '["Free Size"]'::jsonb,
            tag TEXT DEFAULT '',
            badge_color TEXT DEFAULT '',
            shipping_scope TEXT DEFAULT 'all_india',
            allowed_states JSONB DEFAULT '[]'::jsonb,
            allowed_pincodes JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);

        // 3. Products Table Auto-Migrations
        await client.query(`
          ALTER TABLE products ADD COLUMN IF NOT EXISTS name TEXT;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS title TEXT;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2) DEFAULT 0;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Collection';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id TEXT DEFAULT '';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS category_slug TEXT DEFAULT '';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 10;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '["Free Size"]'::jsonb;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT '';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT '';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_scope TEXT DEFAULT 'all_india';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS allowed_states JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS allowed_pincodes JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        `);

        // Backfill name from title or title from name if either was null in legacy records
        await client.query(`
          UPDATE products SET name = title WHERE name IS NULL AND title IS NOT NULL;
          UPDATE products SET title = name WHERE title IS NULL AND name IS NOT NULL;
        `);

        // 4. Orders Table
        await client.query(`
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_location TEXT DEFAULT '',
            items JSONB NOT NULL DEFAULT '[]'::jsonb,
            total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
            payment_method TEXT DEFAULT 'UPI',
            payment_status TEXT DEFAULT 'Completed',
            transaction_id TEXT DEFAULT '',
            decision TEXT DEFAULT 'pending',
            stage INTEGER DEFAULT 1,
            status TEXT DEFAULT 'Order Placed',
            status_title TEXT DEFAULT 'Order Placed & Logged',
            status_description TEXT DEFAULT 'Your order has been recorded in the House of Taaga boutique system.',
            courier_name TEXT DEFAULT 'Boutique Express Logistics',
            awb_number TEXT DEFAULT '',
            estimated_delivery TEXT DEFAULT 'Estimated 4-6 business days',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);

        // Orders Auto-Migrations
        await client.query(`
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'UPI';
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Completed';
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id TEXT DEFAULT '';
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT DEFAULT 'Boutique Express Logistics';
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_number TEXT DEFAULT '';
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT DEFAULT 'Estimated 4-6 business days';
        `);

        // 5. Store Config Table
        await client.query(`
          CREATE TABLE IF NOT EXISTS store_config (
            key TEXT PRIMARY KEY,
            value JSONB NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);

        // 6. Customers Table (Patron Accounts)
        await client.query(`
          CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            mobile TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            pincode TEXT DEFAULT '',
            state TEXT DEFAULT 'Maharashtra',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);

        // 7. Performance Indexes
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
          CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
          CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
        `);

        await client.query('COMMIT');
        dbIsReady = true;
        console.log('✅ [DB] PostgreSQL production database initialized & migrated successfully.');

        // Auto-seed initial catalog if PostgreSQL tables are newly created and empty
        try {
          const prodCountRes = await client.query('SELECT COUNT(*) FROM products');
          if (parseInt(prodCountRes.rows[0].count, 10) === 0) {
            const seedProdsPath = path.join(__dirname, 'data', 'products.json');
            if (fs.existsSync(seedProdsPath)) {
              const prods = JSON.parse(fs.readFileSync(seedProdsPath, 'utf8'));
              for (const p of prods) {
                await client.query(`
                  INSERT INTO products (
                    id, name, title, subtitle, price, original_price, category, category_slug, 
                    description, stock, in_stock, images, image_url, shipping_scope, allowed_states, allowed_pincodes
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                  ON CONFLICT (id) DO NOTHING
                `, [
                  p.id, p.name || p.title, p.title || p.name, p.subtitle || '',
                  p.price || 0, p.originalPrice || p.price || 0, p.category || 'Kurtas', p.categorySlug || 'kurtas',
                  p.description || '', p.stock ?? 10, p.inStock ?? true,
                  JSON.stringify(p.images || [p.imageUrl]), p.imageUrl || '',
                  p.shippingScope || 'all_india',
                  JSON.stringify(p.allowedStates || []),
                  JSON.stringify(p.allowedPincodes || [])
                ]);
              }
              console.log(`[DB] Auto-seeded ${prods.length} products into PostgreSQL.`);
            }
          }

          const catCountRes = await client.query('SELECT COUNT(*) FROM categories');
          if (parseInt(catCountRes.rows[0].count, 10) === 0) {
            const seedCatsPath = path.join(__dirname, 'data', 'categories.json');
            if (fs.existsSync(seedCatsPath)) {
              const cats = JSON.parse(fs.readFileSync(seedCatsPath, 'utf8'));
              for (const c of cats) {
                await client.query(`
                  INSERT INTO categories (id, name, slug, image, item_count)
                  VALUES ($1, $2, $3, $4, $5)
                  ON CONFLICT (id) DO NOTHING
                `, [c.id, c.name, c.slug, c.imageUrl || c.image || '', c.itemCount || 0]);
              }
              console.log(`[DB] Auto-seeded ${cats.length} categories into PostgreSQL.`);
            }
          }
        } catch (seedErr) {
          console.warn('[DB] Auto-seed warning:', seedErr.message);
        }

        return true;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.warn(`[DB] Connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      if (error.code === 'ENOTFOUND' && attempt >= 2) {
        console.warn('⚠️ [DB] Host not found (local development mode). Operating in file-backed fallback mode.');
        dbIsReady = false;
        return false;
      }
      if (attempt === maxRetries) {
        console.warn('⚠️ [DB] PostgreSQL connection timed out after retries. Operating in file-backed fallback mode.');
        dbIsReady = false;
        return false;
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  return false;
}
