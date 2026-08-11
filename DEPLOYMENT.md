# Complete Step-by-Step Server Deployment Guide

This guide will teach you how to deploy this Node.js web server from your **Local Laptop** to your **Server Laptop** via **SSH**, manage it with **Docker**, and expose it to the internet using your **Public IP**.

---

## 🏗️ Architecture & Workflow

```
[Local Laptop] ──(1. git push)──> [GitHub / GitLab]
      │                                 │
      │ (2. SSH commands)               │ (3. git pull)
      ▼                                 ▼
[Server Laptop] <───────────────────────┘
      │
      ├── [Nginx Reverse Proxy Container] (Port 80)
      │         │ (proxy_pass http://web:3000)
      │         ▼
      └── [Node.js Express App Container] (Internal Port 3000)
      │
[Router Port Forwarding] (External Port 80 ──> Server Laptop 80)
      ▲
      │ (Public Access)
[Internet User] ──> http://<YOUR_PUBLIC_IP>
```

---

## 📋 Prerequisites

1. **Local Laptop**: Git installed, code editor, SSH terminal (PowerShell, Command Prompt, or Git Bash).
2. **Server Laptop**: Connected to the same home Wi-Fi/LAN router initially.
3. **GitHub / GitLab Account**: A remote Git repository created for this project.

---

## Step 1: Test App Locally on Main Laptop

Before deploying, test the server on your local machine:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Test with Node.js directly:
   ```bash
   npm start
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000).

3. *(Optional)* Test with Docker locally:
   ```bash
   docker compose up --build
   ```

---

## Step 2: Push Code to GitHub / GitLab

Initialize Git and push your repository to your remote Git provider:

```bash
# 1. Initialize git
git init

# 2. Add files and commit
git add .
git commit -m "Initial commit of Node.js Docker app"

# 3. Create a main branch and link your remote repo
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 4. Push to remote
git push -u origin main
```

---

## Step 3: Set Up SSH on Server Laptop & Find Its Local IP

1. **Enable SSH Server on Server Laptop**:
   - **Linux (Ubuntu/Debian)**:
     ```bash
     sudo apt update && sudo apt install -y openssh-server
     sudo systemctl enable --now ssh
     ```
   - **Windows**: Go to *Settings > System > Optional Features > Add OpenSSH Server*. Start the `sshd` service.

2. **Find Server Laptop's Local IP Address**:
   - On Server Laptop, run:
     - Linux/macOS: `ip a` or `hostname -I`
     - Windows: `ipconfig`
   - Look for IPv4 address under your Wi-Fi or Ethernet adapter (e.g. `192.168.1.50`).

3. **Test SSH connection from Local Laptop**:
   From your local laptop terminal, run:
   ```bash
   ssh username@192.168.1.50
   ```
   *(Replace `username` with your Server Laptop login username and `192.168.1.50` with its IP address).*

---

## Step 4: Prepare Server Laptop (Docker & Git Installation)

Once connected to your Server Laptop via SSH, ensure Docker and Git are installed:

### On Ubuntu/Debian Server Laptop:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Git & Docker
sudo apt install -y git docker.io docker-compose-v2

# Enable Docker service
sudo systemctl enable --now docker

# Allow your user to run Docker without 'sudo'
sudo usermod -aG docker $USER

# Log out and log back in to apply group changes
exit
```

Reconnect via SSH: `ssh username@192.168.1.50`

---

## Step 5: Clone & Deploy Application on Server Laptop

Inside your SSH terminal on the Server Laptop:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Launch container using Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

3. **Verify container status**:
   ```bash
   docker compose ps
   docker compose logs -f
   ```

4. **Test local network access**:
   From your local laptop browser, visit `http://192.168.1.50:3000`. You should see the live dashboard!

---

## Step 6: Expose Server Laptop to Public Access via Public IP

To access your server from outside your home network (e.g. from mobile data or another location):

### 1. Find Your Public IP Address
Run this command from your server or local laptop:
```bash
curl ifconfig.me
```
*(Example output: `49.37.12.34`)*

### 2. Configure Router Port Forwarding
1. Open a browser and log into your home Wi-Fi Router Admin Portal (usually `http://192.168.1.1` or `http://192.168.0.1`).
2. Locate the **Port Forwarding** / **Virtual Server** / **NAT** section.
3. Add a new rule:
   - **Rule Name**: `NodeJS-Server`
   - **Protocol**: `TCP`
   - **External/WAN Port**: `3000` (or `80`)
   - **Internal/LAN Port**: `3000`
   - **Internal/Server IP Address**: `192.168.1.50` (Server Laptop Local IP)
4. Save & Apply changes.

### 3. Test Public Access
Disconnect your phone from Wi-Fi (use Mobile Data) or ask a friend to open:
```
http://<YOUR_PUBLIC_IP>:3000
```
🎉 Your Node.js application is now publicly accessible!

---

## 🔄 Step 7: How to Deploy Code Updates (The Real Developer Workflow)

Whenever you edit your code in the future, follow this seamless workflow:

1. **On Local Laptop**:
   ```bash
   git add .
   git commit -m "Feature update"
   git push
   ```

2. **On Local Laptop via SSH**:
   ```bash
   ssh username@192.168.1.50 "cd YOUR_REPO_NAME && git pull && docker compose up -d --build"
   ```

That single SSH command will automatically pull your latest code changes, rebuild the Docker image, and restart the container seamlessly!

---

## 💡 Troubleshooting Checklist

| Issue | Solution |
| :--- | :--- |
| `Connection refused` on SSH | Check if SSH server service is running on Server Laptop and firewall allows port 22. |
| Cannot access `http://<Local-IP>:3000` | Ensure Docker container is running (`docker compose ps`) and firewall opens port 3000 (`sudo ufw allow 3000/tcp`). |
| Cannot access `http://<Public-IP>:3000` | 1. Double check Router Port Forwarding rules.<br>2. Note: Some ISPs use CGNAT (Carrier-Grade NAT) which prevents public IP inbound routing. If so, free tools like **Ngrok** (`ngrok http 3000`) or **Cloudflare Tunnel** (`cloudflared`) bypass CGNAT easily without port forwarding. |
