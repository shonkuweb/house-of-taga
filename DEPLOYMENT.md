# Deployment Guide: House of Taaga on Shared VPS

This guide explains how to deploy the full-stack **House of Taaga** application with **PostgreSQL Database** and **Node.js Express REST API** in Docker on your VPS alongside other projects without any port, container, network, or volume conflicts.

---

## 🏗️ Architecture on Multi-Project VPS

The application runs as a fully isolated, namespaced 3-service Docker Compose stack:
1. **`houseoftaaga-db`**: PostgreSQL 16 Alpine with isolated persistent volume `houseoftaaga_postgres_data`.
2. **`houseoftaaga-api`**: Node.js Express REST API (`/api/products`, `/api/orders`, `/api/categories`, etc.) with media uploads volume `houseoftaaga_uploads_data` and file store volume `houseoftaaga_store_data`.
3. **`houseoftaaga-web`**: Alpine Nginx container serving the built React SPA and proxying `/api/` and `/uploads/` to `houseoftaaga-api:5000`. Exposes port `3050` (or your chosen `PORT` in `.env`) to the host VPS.

```
 Internet (HTTPS)
       │
       ▼
[ Your Domain ] ──> [ VPS Public IP ]
                             │
                             ▼
                    [ Host Nginx / Traefik / Caddy Reverse Proxy ]
                             │
                    (proxy_pass :3050)
                             │
                             ▼
           [ Docker: houseoftaaga-web (:3050 -> container :80) ]
                  ├── Static Frontend SPA (React)
                  └── Reverse Proxy /api/* & /uploads/*
                             │
                             ▼
           [ Docker: houseoftaaga-api (internal :5000) ]
                  └── Node.js / Express REST API
                             │
                             ▼
           [ Docker: houseoftaaga-db (internal :5432) ]
                  └── PostgreSQL 16 Alpine
```

---

## 🔒 Isolation Guarantees for Shared VPS

When hosting multiple Docker apps on one VPS:
- **No container name clashes**: Containers are explicitly named `houseoftaaga-web`, `houseoftaaga-api`, and `houseoftaaga-db`.
- **No volume collisions**: Dedicated named volumes `houseoftaaga_postgres_data`, `houseoftaaga_uploads_data`, `houseoftaaga_store_data`.
- **No internal network overlap**: Dedicated bridge network `houseoftaaga-net`.
- **Configurable host port**: Host port defaults to `3050` (instead of common 80, 443, 3000, 3040, 5000). You can change `PORT=...` in your `.env` file to any free port anytime.
- **Zero hardcoded catalog**: All products and categories are 100% dynamic. You can manage, add, edit, or delete them directly from the Admin Panel.

---

## 🚀 Quick Deployment (3 Steps)

### Step 1: Clone Repository on Your VPS

```bash
git clone https://github.com/shonkuweb/house-of-taga.git /var/www/house-of-taga
cd /var/www/house-of-taga
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

If port `3050` is already in use by another project on your VPS, simply edit `.env`:
```env
PORT=3055
```

### Step 3: Launch Docker Stack

```bash
docker compose up -d --build
```

Verify status:
```bash
docker compose ps
curl http://127.0.0.1:3050/api/healthz
# Expected output: {"status":"healthy","database":"connected",...}
```

---

## 🌐 Connecting Your Domain (Host Reverse Proxy)

If you have an existing Nginx instance on your VPS handling domain routing and SSL:

```bash
# 1. Copy sample configuration
sudo cp vps/demo.shonku.site.conf /etc/nginx/sites-available/houseoftaaga.conf

# 2. Update domain name and port in the conf if needed
sudo nano /etc/nginx/sites-available/houseoftaaga.conf

# 3. Enable site
sudo ln -sf /etc/nginx/sites-available/houseoftaaga.conf /etc/nginx/sites-enabled/

# 4. Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# 5. Issue free SSL Certificate with Certbot
sudo certbot --nginx -d yourdomain.com
```

---

## 🔑 Admin Panel Access

1. Open your browser to `/` and click the **Admin** shield icon in the top navigation or footer.
2. Default credentials:
   - **Password**: `taagaadmin2026` (can be changed anytime in Admin > Settings)
3. You can manage:
   - **Categories**: Create parent collections and subcategories with custom photos and banners.
   - **Products**: Add products with multiple gallery photos, descriptions, sizes, tags, and stock.
   - **Orders**: View live orders and update fulfillment stages (Confirmed -> Packed -> Shipped -> Delivered).
   - **Store Settings**: Customize WhatsApp order number, store name, studio address, announcement banner, and delivery options.
