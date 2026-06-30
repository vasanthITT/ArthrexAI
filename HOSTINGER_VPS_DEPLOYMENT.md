# 🚀 Hostinger VPS Deployment Guide
**Target IP:** `89.116.20.228`

This guide explains how to deploy the migrated **Next.js frontend** and **FastAPI backend** on your Hostinger Linux VPS (Ubuntu 20.04 / 22.04 LTS).

---

## 1. Prerequisites (Run on VPS)

SSH into your VPS:
```bash
ssh root@89.116.20.228
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

Install Git, Node.js (v18 or v20), Nginx, PostgreSQL, and Python 3:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx, Git, Python pip
sudo apt install -y nginx git python3-pip python3-venv pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

---

## 2. Set Up PostgreSQL

Start and enable PostgreSQL:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Log in as `postgres` and create the database and user:
```bash
sudo -i -u postgres
psql
```

Inside the PostgreSQL terminal, run:
```sql
CREATE DATABASE arthrex_db;
CREATE USER arthrex_user WITH PASSWORD 'choose_a_strong_password';
GRANT ALL PRIVILEGES ON DATABASE arthrex_db TO arthrex_user;
\q
exit
```

---

## 3. Clone and Configure the Application

Clone your GitHub repository onto the VPS (e.g., in `/var/www/arthrex`):
```bash
sudo mkdir -p /var/www/arthrex
sudo chown -R $USER:$USER /var/www/arthrex
cd /var/www/arthrex
git clone <YOUR_GIT_REPO_URL> .
```

### Configure Backend Environment
```bash
cd /var/www/arthrex/backend
cp .env.example .env
nano .env
```
Update `.env` with:
```ini
DATABASE_URL=postgresql://arthrex_user:choose_a_strong_password@localhost/arthrex_db
SECRET_KEY=generate_a_random_long_secret_key
FRONTEND_URL=http://89.116.20.228
```

### Configure Frontend Environment
```bash
cd /var/www/arthrex/frontend
nano .env.local
```
Add:
```ini
NEXT_PUBLIC_API_URL=http://89.116.20.228
```

---

## 4. Install and Build

### Set up Python Virtual Environment (Backend)
```bash
cd /var/www/arthrex/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Seed database
```bash
python -m app.seed
deactivate
```

### Install and Build Frontend
```bash
cd /var/www/arthrex/frontend
npm install --legacy-peer-deps
npm run build
```

---

## 5. Keep Services Alive with PM2

Install PM2 globally if not already done:
```bash
sudo npm install -y -g pm2
```

### Run Backend under PM2:
Create a ecosystem file or run directly:
```bash
cd /var/www/arthrex/backend
pm2 start "venv/bin/uvicorn app.main:app --port 8000 --host 127.0.0.1" --name "arthrex-backend"
```

### Run Frontend under PM2:
```bash
cd /var/www/arthrex/frontend
pm2 start "npm run start -- --port 3000" --name "arthrex-frontend"
```

Save PM2 configuration so they start on system boot:
```bash
pm2 save
pm2 startup
# Copy and run the command printed by PM2 startup
```

---

## 6. Configure Nginx Reverse Proxy

Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/arthrex
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name 89.116.20.228; # Replace with your domain name later if you have one

    # Frontend Reverse Proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }

    # Backend Static uploads Reverse Proxy
    location /static/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/arthrex /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. Setup SSL (Optional but Highly Recommended)
If you connect a domain to `89.116.20.228`:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```
Certbot will automatically update the Nginx configuration to support HTTPS.
