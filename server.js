const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { v4: uuidv4 } = require('uuid');

// Ensure downloads folder exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// ─── Automated Cleanup (Zero File Retention Guarantee) ─────────────────────
// Define activeJobs here to ensure it's accessible by cleanup
const activeJobs = new Map(); // jobId -> { status, progress, filePath, downloadName, error }

setInterval(() => {
  try {
    const files = fs.readdirSync(downloadsDir);
    const now = Date.now();
    let deletedCount = 0;
    files.forEach(f => {
      const p = path.join(downloadsDir, f);
      const stats = fs.statSync(p);
      if (now - stats.mtimeMs > 3600000) { // 1 hour
        fs.unlinkSync(p);
        deletedCount++;
        // Also clear from activeJobs if it's a jobId based file
        const jobId = f.split('.')[0];
        if (activeJobs.has(jobId)) activeJobs.delete(jobId);
      }
    });
    // Also clean activeJobs for entries without files (error states, etc)
    for (const [id, job] of activeJobs.entries()) {
      if (job.status === 'error' || !job.filePath) {
        // simple heuristic or just leave for next hour
      }
    }
    if (deletedCount > 0) {
      console.log(`[Cleanup] Deleted ${deletedCount} orphaned files/jobs.`);
    }
  } catch (err) {
    console.error('[Cleanup Error]', err.message);
  }
}, 30 * 60 * 1000); // Check every 30 minutes

const app = express();
const PORT = process.env.PORT || 3169;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
// ─── Data Helpers ────────────────────────────────────────────────────────
const configPath = path.join(__dirname, 'config.json');
const statsPath = path.join(__dirname, 'stats.json');

function getConfig() {
  try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); }
  catch { return { adminPassword: "admin", adsenseScript: "", theme: "dark", languages: ["tr", "en", "es", "ru", "ar"] }; }
}
function saveConfig(data) { fs.writeFileSync(configPath, JSON.stringify(data, null, 2)); }

function getStats() {
  try { return JSON.parse(fs.readFileSync(statsPath, 'utf8')); }
  catch { return { visits: 0, downloads: 0, visitedIPs: {} }; }
}
function saveStats(data) { fs.writeFileSync(statsPath, JSON.stringify(data, null, 2)); }

// ─── Public Config API ───────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  const cfg = getConfig();
  res.json({
    theme: cfg.theme,
    adsenseScript: cfg.adsenseScript,
    languages: cfg.languages
  });
});

app.post('/api/stats/visit', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const today = new Date().toISOString().split('T')[0];
  const stats = getStats();

  if (!stats.visitedIPs) stats.visitedIPs = {};
  if (!stats.visitedIPs[today]) stats.visitedIPs[today] = [];

  if (!stats.visitedIPs[today].includes(ip)) {
    stats.visitedIPs[today].push(ip);
    stats.visits = (stats.visits || 0) + 1;
    saveStats(stats);
  }

  res.json({ success: true });
});

// ─── Admin API ───────────────────────────────────────────────────────────
function adminAuth(req, res, next) {
  const cfg = getConfig();
  const auth = req.headers.authorization;
  if (auth === cfg.adminPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const cfg = getConfig();
  if (password === cfg.adminPassword) {
    res.json({ success: true, token: cfg.adminPassword });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.get('/api/admin/config', adminAuth, (req, res) => {
  res.json(getConfig());
});

app.post('/api/admin/config', adminAuth, (req, res) => {
  const newConfig = req.body;
  saveConfig(newConfig);
  res.json({ success: true });
});

app.get('/api/admin/stats', adminAuth, (req, res) => {
  const stats = getStats();
  res.json({ visits: stats.visits || 0, downloads: stats.downloads || 0 });
});
// ─── Platform Detection ────────────────────────────────────────────────────

const PLATFORMS = {
  youtube: {
    regex: /(?:youtube\.com|youtu\.be)/i,
    name: 'YouTube',
    color: '#FF0000',
    icon: 'youtube'
  },
  instagram: {
    regex: /instagram\.com/i,
    name: 'Instagram',
    color: '#E1306C',
    icon: 'instagram'
  },
  tiktok: {
    regex: /tiktok\.com/i,
    name: 'TikTok',
    color: '#010101',
    icon: 'tiktok'
  },
  twitter: {
    regex: /(?:twitter\.com|x\.com)/i,
    name: 'X (Twitter)',
    color: '#1DA1F2',
    icon: 'twitter'
  },
  vk: {
    regex: /vk\.com/i,
    name: 'VK',
    color: '#0077FF',
    icon: 'vk'
  },
  dailymotion: {
    regex: /dailymotion\.com/i,
    name: 'Dailymotion',
    color: '#0066DC',
    icon: 'dailymotion'
  },
  facebook: {
    regex: /(?:facebook\.com|fb\.watch)/i,
    name: 'Facebook',
    color: '#1877F2',
    icon: 'facebook'
  },
  twitch: {
    regex: /twitch\.tv/i,
    name: 'Twitch',
    color: '#9146FF',
    icon: 'twitch'
  },
  reddit: {
    regex: /reddit\.com/i,
    name: 'Reddit',
    color: '#FF4500',
    icon: 'reddit'
  },
  soundcloud: {
    regex: /soundcloud\.com/i,
    name: 'SoundCloud',
    color: '#FF5500',
    icon: 'soundcloud'
  },
  bilibili: {
    regex: /bilibili\.com/i,
    name: 'Bilibili',
    color: '#00A1D6',
    icon: 'bilibili'
  },
  pinterest: {
    regex: /pinterest\.com/i,
    name: 'Pinterest',
    color: '#E60023',
    icon: 'pinterest'
  },
  vimeo: {
    regex: /vimeo\.com/i,
    name: 'Vimeo',
    color: '#1AB7EA',
    icon: 'vimeo'
  },
  linkedin: {
    regex: /linkedin\.com/i,
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: 'linkedin'
  },
  threads: {
    regex: /threads\.net/i,
    name: 'Threads',
    color: '#000000',
    icon: 'threads'
  }
};

function detectPlatform(url) {
  for (const [key, platform] of Object.entries(PLATFORMS)) {
    if (platform.regex.test(url)) {
      return { key, ...platform };
    }
  }
  return { key: 'generic', name: 'Web', color: '#6C63FF', icon: 'link' };
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Helper: run yt-dlp ────────────────────────────────────────────────────

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    // Try yt-dlp first, fall back to yt-dlp.exe (Windows)
    const binary = process.platform === 'win32' ? 'yt-dlp' : 'yt-dlp';
    execFile(binary, args, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────

// POST /api/info – Get media info
app.post('/api/info', async (req, res) => {
  const { url } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Geçerli bir URL girin.' });
  }

  const platform = detectPlatform(url);

  try {
    const raw = await runYtDlp(['--dump-json', '--no-playlist', url]);
    const info = JSON.parse(raw);

    // Build format list
    const formats = [];

    if (info.formats) {
      // Best combined (video+audio)
      formats.push({ id: 'bv+ba/b', label: 'En İyi Kalite (Otomatik)', type: 'video' });

      // Collect unique video heights
      const seen = new Set();
      const videoFormats = info.formats
        .filter(f => f.vcodec && f.vcodec !== 'none' && f.height)
        .sort((a, b) => b.height - a.height);

      for (const f of videoFormats) {
        if (!seen.has(f.height)) {
          seen.add(f.height);
          formats.push({
            id: `bv*[height<=${f.height}]+ba/b[height<=${f.height}]`,
            label: `${f.height}p`,
            type: 'video',
            height: f.height
          });
        }
      }

      // Audio only
      formats.push({
        id: 'bestaudio',
        label: 'Yalnızca Ses (En İyi)',
        type: 'audio'
      });
    } else {
      formats.push({ id: 'bv+ba/b', label: 'En İyi Kalite', type: 'video' });
    }

    res.json({
      title: info.title || 'Bilinmeyen Başlık',
      thumbnail: info.thumbnail || null,
      duration: info.duration || null,
      uploader: info.uploader || info.channel || null,
      platform,
      formats
    });
  } catch (err) {
    console.error('yt-dlp info error:', err.message);
    if (err.message.includes('yt-dlp')) {
      return res.status(500).json({
        error: 'yt-dlp bulunamadı. Lütfen sunucuya yt-dlp kurun.',
        detail: err.message
      });
    }
    res.status(500).json({ error: 'Medya bilgisi alınamadı.', detail: err.message });
  }
});

// GET /api/download – Start a background job
app.get('/api/download', async (req, res) => {
  const { url, format = 'best', ext = 'mp4' } = req.query;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: 'Geçerli bir URL girin.' });
  }

  const isAudio = format.includes('bestaudio') && !format.includes('bestvideo');
  const outputExt = isAudio ? ext : ext;
  const jobId = uuidv4().split('-')[0];
  const templatePath = path.join(downloadsDir, `${jobId}.%(ext)s`);

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--newline', // Important for progress parsing
    '-f', format,
    '-o', templatePath
  ];

  if (!isAudio) {
    args.push('--merge-output-format', outputExt);
  } else if (['mp3', 'm4a', 'opus'].includes(outputExt)) {
    args.push('--extract-audio', '--audio-format', outputExt);
    if (req.query.bitrate) {
      args.push('--audio-quality', req.query.bitrate.replace('k', '') + 'K');
    }
  }

  if (req.query.embedSubs === 'true') args.push('--embed-subs', '--write-auto-subs');
  if (req.query.sponsorBlock === 'true') args.push('--sponsorblock-remove', 'all');
  if (req.query.freeFormats === 'true') args.push('--prefer-free-formats');
  if (req.query.codec && req.query.codec !== 'auto') {
    const codecMap = { 'h264': 'avc', 'h265': 'hev', 'av1': 'av01' };
    args.push('--format-sort', `vcodec:${codecMap[req.query.codec] || req.query.codec},res,br`);
  }

  args.push(url);

  // Initialize job
  activeJobs.set(jobId, { status: 'downloading', progress: 0, title: req.query.title || 'aselens_download' });

  // Track Download
  const stats = getStats();
  stats.downloads = (stats.downloads || 0) + 1;
  saveStats(stats);

  res.json({ jobId });

  // Background process
  const child = require('child_process').spawn('yt-dlp', args);
  let ytError = '';

  child.stdout.on('data', (data) => {
    const line = data.toString();
    // Parse progress e.g. [download]  15.5% of 10.00MiB
    const match = line.match(/\[download\]\s+(\d+\.\d+)%/);
    if (match) {
      const job = activeJobs.get(jobId);
      if (job) job.progress = parseFloat(match[1]);
    }
  });

  child.stderr.on('data', (data) => {
    ytError += data.toString();
  });

  child.on('close', async (code) => {
    const job = activeJobs.get(jobId);
    if (!job) return;

    if (code !== 0) {
      job.status = 'error';
      job.error = ytError || 'İndirme hatası.';
      return;
    }

    try {
      const files = fs.readdirSync(downloadsDir);
      const downloadedFile = files.find(f => f.startsWith(jobId));
      if (!downloadedFile) throw new Error('Dosya bulunamadı.');

      job.status = 'ready';
      job.filePath = path.join(downloadsDir, downloadedFile);

      const sanitized = job.title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 80);
      const actualExt = path.extname(downloadedFile);
      job.downloadName = `${sanitized || 'aselens'}${actualExt}`;
    } catch (err) {
      job.status = 'error';
      job.error = err.message;
    }
  });
});

// GET /api/progress – Poll for status
app.get('/api/progress', (req, res) => {
  const { jobId } = req.query;
  const job = activeJobs.get(jobId);
  if (!job) return res.status(404).json({ error: 'İş bulunamadı.' });
  res.json(job);
});

// GET /api/get-file – Final delivery
app.get('/api/get-file', (req, res) => {
  const { jobId } = req.query;
  const job = activeJobs.get(jobId);
  if (!job || job.status !== 'ready') return res.status(404).json({ error: 'Dosya hazır değil.' });

  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(job.downloadName)}`);
  res.setHeader('Content-Type', 'application/octet-stream');

  const stream = fs.createReadStream(job.filePath);
  stream.pipe(res);

  stream.on('close', () => {
    fs.unlink(job.filePath, () => { });
    activeJobs.delete(jobId);
  });
});

// ─── Start (graceful port retry) ─────────────────────────────────────────
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n  🎬  Aselens çalışıyor → http://localhost:${port}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`  ⚠️  Port ${port} kullanımda, ${port + 1} deneniyor...`);
      startServer(port + 1);
    } else {
      console.error('Sunucu hatası:', err);
      process.exit(1);
    }
  });
}

startServer(parseInt(process.env.PORT || '3169', 10));
