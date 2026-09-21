
# art-bot-vps

Telegram Mini App for algorithmic art. Deployed on VPS via Cloudflare Tunnel. Includes `/imagine` powered by OpenRouter.

Built per ponytail rules: minimal files, no unrequested abstractions, stdlib first, one self-check per non-trivial logic. No emojis in code.

## Stack

- VPS (any Linux with Node 18+)
- Cloudflare Tunnel (free, HTTPS without opening VPS ports)
- GitHub (private repo, clone to VPS via JuiceSSH)
- Telegram bot + Mini App
- OpenRouter API (free tier models supported)

## Project layout

```
art-bot-vps/
  package.json
  .env.example
  .gitignore
  server.js          # Express + Telegram bot + OpenRouter (one file)
  public/
    index.html      # Mini App (one file, all inline)
  README.md
```

## Mobile workflow (Samsung A25 + JuiceSSH + Quick Edit)

### 1. Push code to GitHub

From a computer once (or upload files via GitHub web UI on phone):
- Create a private repo `art-bot-vps` on github.com
- Upload the contents of this folder to the repo
- Note the SSH or HTTPS clone URL

### 2. On VPS via JuiceSSH

Open JuiceSSH, connect to your VPS. Run:

```sh
git clone https://github.com/USERNAME/art-bot-vps.git
cd art-bot-vps
npm install
cp .env.example .env
nano .env
```

Edit `.env` (use Quick Edit locally if easier, then `git pull`):
- `BOT_TOKEN` - from @BotFather
- `WEBAPP_URL` - leave for now, fill after step 3
- `OPENROUTER_API_KEY` - from https://openrouter.ai/keys
- `OPENROUTER_MODEL` - keep default or pick another free model
- `ADMIN_USER_IDS` - your Telegram user ID (from @userinfobot), for `/broadcast`
- `CHANNEL_ID` - your channel ID (forward a channel post to @userinfobot)

### 3. Install Cloudflare Tunnel on VPS

```sh
# Debian/Ubuntu
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Or for any Linux (no sudo needed)
curl -L --output cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

### 4. Authenticate Cloudflare Tunnel

```sh
cloudflared tunnel login
```

This prints a URL. Open it on your phone browser, log in to Cloudflare, authorize your domain. Cloudflare writes credentials to `~/.cloudflared/cert.json` on the VPS.

### 5. Create and configure the tunnel

```sh
cloudflared tunnel create art-bot
```

This prints a tunnel UUID. Then create config file:

```sh
cat > ~/.cloudflared/config.yml <<EOF
tunnel: <TUNNEL_UUID>
credentials-file: /root/.cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: art.YOURDOMAIN.COM
    service: http://localhost:3000
  - service: http_status:404
EOF
```

Replace `<TUNNEL_UUID>` with the UUID from step 5. Replace `art.YOURDOMAIN.COM` with a subdomain you own.

### 6. Add DNS record

```sh
cloudflared tunnel route dns art-bot art.YOURDOMAIN.COM
```

This creates the CNAME record in Cloudflare automatically.

### 7. Start the tunnel and the server

Two JuiceSSH sessions (or use `screen` / `tmux`):

Session A (server):
```sh
cd ~/art-bot-vps
npm start
```

Session B (tunnel):
```sh
cloudflared tunnel run art-bot
```

Or install as systemd services (see "Production" below).

### 8. Update WEBAPP_URL in .env and restart server

```sh
nano .env
# set WEBAPP_URL=https://art.YOURDOMAIN.COM
# save (Ctrl+O, Enter, Ctrl+X)
```

Restart `npm start` in Session A.

### 9. Configure Telegram bot

In Telegram on phone:
- Open @BotFather
- /mybots -> your bot -> Bot Settings -> Menu Button -> Configure menu button
- Text: `Open Mini App`
- URL: `https://art.YOURDOMAIN.COM`

For group support:
- @BotFather -> /mybots -> your bot -> Bot Settings -> Group Privacy -> Turn off
  (so the bot can see /imagine commands in groups)

To add to your channel as admin:
- Add the bot to your channel as administrator with "Post Messages" right
- Set CHANNEL_ID in .env so /broadcast can post there

### 10. Test

In Telegram, message your bot:
- /start - greeting + button
- /imagine storm over tundra at dusk - AI generates parameters, you get a button to open Mini App
- /help - quick reference

Tap the button - Mini App opens with parameters from the URL. Adjust sliders, change seed, save PNG, or share back to Telegram.

## Commands

| Command | Where | What |
|---|---|---|
| `/start` | private, group | greeting + Mini App button |
| `/help` | private, group | quick reference |
| `/imagine <text>` | private, group | AI picks parameters, sends button |
| `/broadcast <text>` | private (admin only) | posts AI art to CHANNEL_ID |

## Production (systemd)

Run server and tunnel as services so they survive SSH disconnects.

Server service:
```sh
sudo tee /etc/systemd/system/art-bot.service <<EOF
[Unit]
Description=art-bot Express server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/art-bot-vps
ExecStart=$(which node) server.js
Restart=on-failure
EnvironmentFile=$HOME/art-bot-vps/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now art-bot
sudo systemctl status art-bot
```

Tunnel service:
```sh
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

## Update code

```sh
cd ~/art-bot-vps
git pull
npm install --omit=dev
sudo systemctl restart art-bot
```

## Self-checks

```sh
# Server-side URL builder:
node server.js --self-check

# Client-side URL param parser:
# open https://art.YOURDOMAIN.COM/?selfcheck=1
```

## OpenRouter notes

Free models that work with structured JSON output:
- `meta-llama/llama-3.2-3b-instruct:free` (default)
- `google/gemini-2.0-flash-exp:free`
- `mistralai/mistral-7b-instruct:free`

If a model returns non-JSON, you get an error in chat. Switch via `OPENROUTER_MODEL` in `.env`.

## License

Apache-2.0, same as the source skill (github.com/anthropics/skills/skills/algorithmic-art).
