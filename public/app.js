/* ═══════════════════════════════════════════════════════════
   Aselens – App Logic
   ═══════════════════════════════════════════════════════════ */

'use strict';

const html = document.documentElement;
const urlInput = document.getElementById('urlInput');
const downloadForm = document.getElementById('downloadForm');
const fetchBtn = document.getElementById('fetchBtn');
const pasteBtn = document.getElementById('pasteBtn');
const platformBadge = document.getElementById('platformBadge');
const platformIcon = document.getElementById('platformIcon');
const platformName = document.getElementById('platformName');
const mediaPreview = document.getElementById('mediaPreview');
const previewThumb = document.getElementById('previewThumb');
const previewTitle = document.getElementById('previewTitle');
const previewMeta = document.getElementById('previewMeta');
const previewDur = document.getElementById('previewDuration');
const formatSelect = document.getElementById('formatSelect');       // hidden native select
const csWrap = document.getElementById('customFormatSelect');  // custom dropdown wrapper
const csTrigger = document.getElementById('customSelectTrigger');
const csText = document.getElementById('customSelectText');
const csDropdown = document.getElementById('customSelectDropdown');
const downloadBtn = document.getElementById('downloadBtn');
const downloadBtnT = document.getElementById('downloadBtnText');
const dlProgressW = document.getElementById('dlProgressWrap');
const dlProgressF = document.getElementById('dlProgressFill');
const dlProgressL = document.getElementById('dlProgressLabel');
const themeBtn = document.getElementById('themeBtn');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettings = document.getElementById('closeSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsTheme = document.getElementById('settingsThemeToggle');
const animToggle = document.getElementById('animationsToggle');
const toastCont = document.getElementById('toastContainer');

// ── Platform Icons (emoji) ──────────────────────────────────
const PLATFORM_ICONS = {
    youtube: '▶️',
    instagram: '📸',
    tiktok: '🎵',
    twitter: '🐦',
    vk: '💬',
    dailymotion: '🎬',
    facebook: 'f',
    twitch: '🎮',
    reddit: '🤖',
    soundcloud: '☁️',
    bilibili: 'B',
    pinterest: '📌',
    vimeo: 'V',
    linkedin: '💼',
    threads: '🧵',
    generic: '🔗'
};

const PLATFORM_REGEX = {
    youtube: /(?:youtube\.com|youtu\.be)/i,
    instagram: /instagram\.com/i,
    tiktok: /tiktok\.com/i,
    twitter: /(?:twitter\.com|x\.com)/i,
    vk: /vk\.com/i,
    dailymotion: /dailymotion\.com/i,
    facebook: /(?:facebook\.com|fb\.watch)/i,
    twitch: /twitch\.tv/i,
    reddit: /reddit\.com/i,
    soundcloud: /soundcloud\.com/i,
    bilibili: /bilibili\.com/i,
    pinterest: /pinterest\.com/i,
    vimeo: /vimeo\.com/i,
    linkedin: /linkedin\.com/i,
    threads: /threads\.net/i
};

const PLATFORM_NAMES = {
    youtube: 'YouTube', instagram: 'Instagram', tiktok: 'TikTok',
    twitter: 'X / Twitter', vk: 'VK', dailymotion: 'Dailymotion',
    facebook: 'Facebook', twitch: 'Twitch', reddit: 'Reddit',
    soundcloud: 'SoundCloud', bilibili: 'Bilibili',
    pinterest: 'Pinterest', vimeo: 'Vimeo', linkedin: 'LinkedIn', threads: 'Threads',
    generic: 'Web'
};

const settings = {
    theme: localStorage.getItem('aselens-theme') || 'dark',
    defaultQuality: localStorage.getItem('aselens-quality') || 'best',
    outputFormat: localStorage.getItem('aselens-format') || 'mp4',
    audioFormat: localStorage.getItem('aselens-audio') || 'mp3',
    animations: localStorage.getItem('aselens-anim') !== 'false',
    audioBitrate: localStorage.getItem('aselens-bitrate') || '256k',
    videoCodec: localStorage.getItem('aselens-codec') || 'auto',
    freeFormats: localStorage.getItem('aselens-free') === 'true',
    sponsorBlock: localStorage.getItem('aselens-sponsor') === 'true',
    embedSubs: localStorage.getItem('aselens-subs') === 'true',
    lang: localStorage.getItem('aselens-lang') || 'tr'
};

// ── i18n Dictionary ─────────────────────────────────────────
const i18n = {
    tr: {
        heroBadge: "1000+ Platform Destekleniyor",
        heroTitle1: "Medyayı", heroTitle2: "Özgürce", heroTitle3: "İndir",
        heroSub: "Tüm sosyal medya hesaplarından yüksek kaliteli içerikleri tek bir tıkla cihazınıza kaydedin. Tamamen ücretsiz ve sınırsız.",
        urlPlaceholder: "Buraya link yapıştır...",
        pasteBtn: "Panodan yapıştır",
        fetchBtn: "Ara",
        downloading: "İndiriliyor...",
        settingsTitle: "Ayarlar",
        advancedSettings: "Gelişmiş Ayarlar",
        audioBitrate: "Ses Bitrate",
        videoCodec: "Video Codec",
        freeFormats: "Öncelikli Özgür Formatlar (VP9/WebM)",
        sponsorBlock: "SponsorBlock (Reklam Bölümlerini Atla)",
        embedSubs: "Altyazıları Göm (Destekleniyorsa)",
        appearance: "Görünüm",
        toastPasteSuccess: "Link yapıştırıldı",
        toastPasteError: "Panodan yapıştırılamadı. Ctrl+V kullanın.",
        toastOptUrl: "Lütfen bir URL girin.",
        toastOptUrlErr: "Geçersiz URL formatı."
    },
    en: {
        heroBadge: "1000+ Platforms Supported",
        heroTitle1: "Download Media", heroTitle2: "Freely", heroTitle3: "",
        heroSub: "Save high-quality content from all social media accounts to your device in seconds. Ad-free and unlimited.",
        urlPlaceholder: "Paste link here...",
        pasteBtn: "Paste from clipboard",
        fetchBtn: "Search",
        downloading: "Downloading...",
        settingsTitle: "Settings",
        advancedSettings: "Advanced Settings",
        audioBitrate: "Audio Bitrate",
        videoCodec: "Video Codec",
        freeFormats: "Prefer Free Formats (VP9/WebM)",
        sponsorBlock: "SponsorBlock (Skip Ads/Sponsors)",
        embedSubs: "Embed Subtitles (if available)",
        appearance: "Appearance",
        toastPasteSuccess: "Link pasted",
        toastPasteError: "Could not paste from clipboard. Use Ctrl+V.",
        toastOptUrl: "Please enter a URL.",
        toastOptUrlErr: "Invalid URL format."
    },
    es: {
        heroBadge: "Más de 1000 plataformas compatibles",
        heroTitle1: "Descarga Medios", heroTitle2: "Libremente", heroTitle3: "",
        heroSub: "Guarde contenido de alta calidad de todas las redes sociales en su dispositivo. Sin publicidad y sin límites.",
        urlPlaceholder: "Pega el enlace aquí...",
        pasteBtn: "Pegar desde el portapapeles",
        fetchBtn: "Buscar",
        downloading: "Descargando...",
        settingsTitle: "Configuración",
        advancedSettings: "Configuración Avanzada",
        audioBitrate: "Bitrate de Audio",
        embedSubs: "Incrustar Subtítulos",
        appearance: "Apariencia",
        toastPasteSuccess: "Enlace pegado",
        toastPasteError: "No se pudo pegar. Usa Ctrl+V.",
        toastOptUrl: "Por favor, introduce una URL.",
        toastOptUrlErr: "Formato de URL no válido."
    },
    ru: {
        heroBadge: "Поддержка 1000+ платформ",
        heroTitle1: "Скачивайте медиа", heroTitle2: "Свободно", heroTitle3: "",
        heroSub: "Сохраняйте высококачественный контент из всех социальных сетей на свое устройство. Без рекламы и без ограничений.",
        urlPlaceholder: "Вставьте ссылку сюда...",
        pasteBtn: "Вставить из буфера обмена",
        fetchBtn: "Поиск",
        downloading: "Загрузка...",
        settingsTitle: "Настройки",
        advancedSettings: "Расширенные Настройки",
        audioBitrate: "Битрейт аудио",
        embedSubs: "Встроить субтитры",
        appearance: "Внешний вид",
        toastPasteSuccess: "Ссылка вставлена",
        toastPasteError: "Не удалось вставить. Используйте Ctrl+V.",
        toastOptUrl: "Пожалуйста, введите URL.",
        toastOptUrlErr: "Неверный формат URL."
    },
    ar: {
        heroBadge: "أكثر من 1000 منصة مدعومة",
        heroTitle1: "تحميل الوسائط", heroTitle2: "بحرية", heroTitle3: "",
        heroSub: "احفظ المحتوى عالي الجودة من جميع وسائل التواصل إلى جهازك. بلا إعلانات وبلا حدود.",
        urlPlaceholder: "ضع الرابط هنا...",
        pasteBtn: "لصق من الحافظة",
        fetchBtn: "بحث",
        downloading: "جارٍ التنزيل...",
        settingsTitle: "الإعدادات",
        advancedSettings: "إعدادات متقدمة",
        audioBitrate: "معدل البت الصوتي",
        embedSubs: "تضمين الترجمة",
        appearance: "المظهر",
        toastPasteSuccess: "تم لصق الرابط",
        toastPasteError: "تعذر اللصق. استخدم Ctrl+V.",
        toastOptUrl: "الرجاء إدخال رابط.",
        toastOptUrlErr: "تنسيق الرابط غير صالح."
    }
};

function t(key) {
    return i18n[settings.lang][key] || i18n['tr'][key] || key;
}

function applyLanguage(lang, save = true) {
    if (!i18n[lang]) lang = 'tr';
    settings.lang = lang;
    if (save) localStorage.setItem('aselens-lang', lang);

    // Update texts
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-ph'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        el.title = t(el.getAttribute('data-i18n-title'));
    });

    // Update Dropdown UI
    const triggerText = document.getElementById('langSelectText');
    if (triggerText) triggerText.textContent = lang.toUpperCase();

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

// ── Init ────────────────────────────────────────────────────
async function init() {
    // Track visit
    fetch('/api/stats/visit', { method: 'POST' }).catch(() => { });

    // Load config
    try {
        const res = await fetch('/api/config');
        const cfg = await res.json();

        if (cfg.theme && !localStorage.getItem('aselens-theme')) {
            settings.theme = cfg.theme;
        }

        if (cfg.adsenseScript) {
            const adsContainers = document.querySelectorAll('.ads-container');
            adsContainers.forEach(container => {
                container.innerHTML = cfg.adsenseScript;
                const scripts = container.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; i++) {
                    const newScript = document.createElement('script');
                    if (scripts[i].src) newScript.src = scripts[i].src;
                    newScript.innerHTML = scripts[i].innerHTML;
                    document.head.appendChild(newScript);
                }
            });
        }

        if (cfg.languages && cfg.languages.length > 0) {
            buildLanguageDropdown(cfg.languages);
        }
    } catch (e) { }

    applyLanguage(settings.lang, false);
    applyTheme(settings.theme, false);
    applyAnimations(settings.animations, false);
    loadSettingsUI();
    createParticles();
    bindEvents();

    if (settings.animations && window.gsap) {
        const tl = gsap.timeline();
        tl.to('.hero-badge', { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.5)" })
            .to('.hero-title', { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
            .to('.hero-sub', { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
            .to('#mainCard', { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" }, "-=0.5")
            .fromTo('.platform-chip',
                { opacity: 0, scale: 0.8, y: 15 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "back.out(1.5)" },
                "-=0.5"
            );
    } else if (window.gsap) {
        gsap.set('.hero-badge, .hero-title, .hero-sub, #mainCard, .platform-chip', { opacity: 1, y: 0 });
    } else {
        const els = document.querySelectorAll('.hero-badge, .hero-title, .hero-sub, #mainCard, .platform-chip');
        els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    }
}

function buildLanguageDropdown(langs) {
    const dropdown = document.getElementById('langSelectDropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';

    const flags = { tr: '🇹🇷', en: '🇬🇧', es: '🇪🇸', ru: '🇷🇺', ar: '🇸🇦' };
    const names = { tr: 'Türkçe', en: 'English', es: 'Español', ru: 'Русский', ar: 'العربية' };

    langs.forEach(lang => {
        const div = document.createElement('div');
        div.className = `custom-option ${settings.lang === lang ? 'selected' : ''}`;
        div.dataset.lang = lang;
        div.innerHTML = `<span style="margin-right:8px; font-size:1.2em;">${flags[lang] || '🌐'}</span> ${lang.toUpperCase()} - ${names[lang] || lang}`;
        dropdown.appendChild(div);
    });
}

// ── Theme ───────────────────────────────────────────────────
function applyTheme(theme, save = true) {
    settings.theme = theme;
    html.setAttribute('data-theme', theme);
    if (save) localStorage.setItem('aselens-theme', theme);

    // Sync toggles
    const isDark = theme === 'dark';
    settingsTheme.setAttribute('aria-checked', isDark ? 'true' : 'false');
    settingsTheme.classList.toggle('active', isDark);
}

function toggleTheme() {
    applyTheme(settings.theme === 'dark' ? 'light' : 'dark');
}

// ── Animations ──────────────────────────────────────────────
function applyAnimations(enabled, save = true) {
    settings.animations = enabled;
    if (save) localStorage.setItem('aselens-anim', enabled);
    document.getElementById('particles').style.display = enabled ? 'block' : 'none';
    animToggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
    animToggle.classList.toggle('active', enabled);
}

// ── Load settings radio UI ──────────────────────────────────
function loadSettingsUI() {
    // quality
    const qRadios = document.querySelectorAll('input[name="defaultQuality"]');
    qRadios.forEach(r => {
        if (r.value === settings.defaultQuality) { r.checked = true; r.closest('.radio-label').classList.add('checked'); }
    });
    // video format
    const fRadios = document.querySelectorAll('input[name="outputFormat"]');
    fRadios.forEach(r => {
        if (r.value === settings.outputFormat) { r.checked = true; r.closest('.radio-label').classList.add('checked'); }
    });
    // audio format
    const aRadios = document.querySelectorAll('input[name="audioFormat"]');
    aRadios.forEach(r => {
        if (r.value === settings.audioFormat) { r.checked = true; r.closest('.radio-label').classList.add('checked'); }
    });

    // advanced settings
    const subToggle = document.getElementById('embedSubsToggle');
    if (subToggle) {
        subToggle.setAttribute('aria-checked', settings.embedSubs ? 'true' : 'false');
        subToggle.classList.toggle('active', settings.embedSubs);
    }

    const freeToggle = document.getElementById('freeFormatsToggle');
    if (freeToggle) {
        freeToggle.setAttribute('aria-checked', settings.freeFormats ? 'true' : 'false');
        freeToggle.classList.toggle('active', settings.freeFormats);
    }

    const sponsorToggle = document.getElementById('sponsorBlockToggle');
    if (sponsorToggle) {
        sponsorToggle.setAttribute('aria-checked', settings.sponsorBlock ? 'true' : 'false');
        sponsorToggle.classList.toggle('active', settings.sponsorBlock);
    }

    // Custom select initialization
    updateCustomSelectUI('bitrateSelectWrap', settings.audioBitrate);
    updateCustomSelectUI('codecSelectWrap', settings.videoCodec);
}

function updateCustomSelectUI(wrapId, value) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;
    const triggerText = wrap.querySelector('.custom-select-trigger-text');
    const options = wrap.querySelectorAll('.custom-option');
    options.forEach(opt => {
        if (opt.dataset.value === value) {
            opt.classList.add('selected');
            if (triggerText) triggerText.textContent = opt.textContent;
        } else {
            opt.classList.remove('selected');
        }
    });
}

// ── Particles ────────────────────────────────────────────────
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const count = window.innerWidth < 600 ? 12 : 24;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 3 + 1.5;
        p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 14 + 10}s;
      animation-delay: ${Math.random() * -20}s;
      opacity: ${Math.random() * 0.3 + 0.1};
    `;
        container.appendChild(p);
    }
}

// ── Platform detection (client-side, for UI only) ────────────
function detectPlatformFromUrl(url) {
    for (const [key, regex] of Object.entries(PLATFORM_REGEX)) {
        if (regex.test(url)) return key;
    }
    return null;
}

function updatePlatformBadge(url) {
    try {
        new URL(url); // validate
    } catch {
        platformBadge.classList.remove('visible');
        return;
    }

    const setBadge = (icon, name) => {
        platformIcon.textContent = icon;
        platformName.textContent = name;
        platformBadge.classList.add('visible');

        if (settings.animations && window.gsap) {
            gsap.fromTo(platformBadge,
                { scale: 0.8, y: -10, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
            );
        }
    };

    const key = detectPlatformFromUrl(url);
    if (key) {
        setBadge(PLATFORM_ICONS[key] || '🔗', PLATFORM_NAMES[key]);
    } else if (url.startsWith('http')) {
        setBadge('🔗', 'Web');
    } else {
        platformBadge.classList.remove('visible');
    }
}

// ── Custom Dropdown ──────────────────────────────────────────
let csFormats = [];

function buildCustomDropdown(formats, defaultIdx) {
    csFormats = formats;
    csDropdown.innerHTML = '';
    formatSelect.innerHTML = '';

    formats.forEach((f, i) => {
        // Native option (hidden, used for value)
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.label;
        formatSelect.appendChild(opt);

        // Custom option
        const item = document.createElement('div');
        item.className = 'custom-option' + (f.type === 'audio' ? ' audio-opt' : '') + (i === defaultIdx ? ' selected' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', i === defaultIdx ? 'true' : 'false');
        item.dataset.idx = i;

        const badge = f.type === 'audio' ? 'SES' : (f.height ? `${f.height}p` : 'AUTO');
        item.innerHTML = `
      <span class="custom-option-badge">${badge}</span>
      <span class="custom-option-label">${f.label}</span>
      <svg class="custom-option-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    `;

        item.addEventListener('click', () => selectCustomOption(i));
        csDropdown.appendChild(item);
    });

    formatSelect.selectedIndex = defaultIdx;
    if (formats[defaultIdx]) csText.textContent = formats[defaultIdx].label;
}

function selectCustomOption(idx) {
    const opts = csDropdown.querySelectorAll('.custom-option');
    opts.forEach((o, i) => {
        o.classList.toggle('selected', i === idx);
        o.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    formatSelect.selectedIndex = idx;
    if (csFormats[idx]) csText.textContent = csFormats[idx].label;
    closeCustomSelect();
}

function openCustomSelect() {
    csWrap.classList.add('open');
    csWrap.setAttribute('aria-expanded', 'true');
}

function closeCustomSelect() {
    csWrap.classList.remove('open');
    csWrap.setAttribute('aria-expanded', 'false');
}

function toggleCustomSelect() {
    if (csWrap.classList.contains('open')) closeCustomSelect();
    else openCustomSelect();
}

function formatDuration(sec) {
    if (!sec) return '';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function setBtnLoading(btn, loading) {
    btn.classList.toggle('loading', loading);
    btn.disabled = loading;
}

// ── Toast ────────────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;
    toastCont.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, duration);
}

// ── Helpers ──────────────────────────────────────────────────
async function fetchMediaInfo(url) {
    setBtnLoading(fetchBtn, true);
    mediaPreview.hidden = true;

    try {
        const res = await fetch('/api/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            let msg = err.error || 'Medya bilgisi alınamadı.';
            if (err.detail) msg += ` (${err.detail.split('\n')[0]})`;
            showToast(msg, 'error');
            return;
        }
        const data = await res.json();


        // Populate preview
        previewTitle.textContent = data.title || 'Bilinmeyen';
        previewMeta.textContent = [
            data.uploader ? `@${data.uploader}` : null,
            data.platform?.name || null
        ].filter(Boolean).join(' · ');

        if (data.thumbnail) {
            previewThumb.src = data.thumbnail;
            previewThumb.parentElement.style.display = 'block';
        } else {
            previewThumb.parentElement.style.display = 'none';
        }

        previewDur.textContent = formatDuration(data.duration);

        // Build format select
        let defaultIdx = 0;
        const dq = settings.defaultQuality;
        const builtFormats = data.formats || [];
        builtFormats.forEach((f, i) => {
            if (dq !== 'best' && f.height && String(f.height) === dq) defaultIdx = i;
            if (dq === 'audio' && f.type === 'audio') defaultIdx = i;
        });
        buildCustomDropdown(builtFormats, defaultIdx);

        mediaPreview.hidden = false;

        // Update platform badge from API data
        if (data.platform?.key) {
            platformIcon.textContent = PLATFORM_ICONS[data.platform.key] || '🔗';
            platformName.textContent = data.platform.name;
            platformBadge.classList.add('visible');
        }

    } catch (err) {
        showToast('Sunucuya bağlanılamadı.', 'error');
        console.error(err);
    } finally {
        setBtnLoading(fetchBtn, false);
    }
}

// ── Download ─────────────────────────────────────────────────
async function startDownload() {
    const url = urlInput.value.trim();
    const format = formatSelect.value;
    const isAudio = format === 'bestaudio';
    const ext = isAudio ? settings.audioFormat : settings.outputFormat;

    downloadBtn.disabled = true;
    downloadBtnT.textContent = 'Hazırlanıyor...';

    dlProgressW.hidden = false;
    dlProgressF.style.width = '0%';
    dlProgressL.textContent = 'İstek gönderiliyor...';

    try {
        const params = new URLSearchParams({
            url, format, ext,
            title: previewTitle.textContent || '',
            bitrate: settings.audioBitrate || '256k',
            codec: settings.videoCodec || 'auto',
            freeFormats: settings.freeFormats ? 'true' : 'false',
            sponsorBlock: settings.sponsorBlock ? 'true' : 'false',
            embedSubs: settings.embedSubs ? 'true' : 'false'
        });

        const startRes = await fetch(`/api/download?${params}`);
        if (!startRes.ok) {
            const err = await startRes.json().catch(() => ({}));
            throw new Error(err.error || 'İndirme başlatılamadı.');
        }

        const { jobId } = await startRes.json();

        // Polling loop
        const poll = async () => {
            try {
                const progRes = await fetch(`/api/progress?jobId=${jobId}`);
                if (!progRes.ok) return;
                const job = await progRes.json();

                if (job.status === 'downloading') {
                    dlProgressF.style.width = job.progress + '%';
                    dlProgressL.textContent = `İndiriliyor... %${Math.round(job.progress)}`;
                    setTimeout(poll, 1000);
                } else if (job.status === 'ready') {
                    dlProgressF.style.width = '100%';
                    dlProgressL.textContent = 'Hazır! İndiriliyor...';
                    window.location.href = `/api/get-file?jobId=${jobId}`;

                    setTimeout(() => {
                        showToast('İndirme başlatıldı!', 'success');
                        dlProgressW.hidden = true;
                        downloadBtn.disabled = false;
                        downloadBtnT.textContent = 'İndir';
                    }, 2000);
                } else if (job.status === 'error') {
                    throw new Error(job.error || 'İndirme hatası.');
                }
            } catch (e) {
                showToast(e.message, 'error');
                dlProgressW.hidden = true;
                downloadBtn.disabled = false;
                downloadBtnT.textContent = 'İndir';
            }
        };

        poll();

    } catch (err) {
        showToast(err.message, 'error');
        dlProgressW.hidden = true;
        downloadBtn.disabled = false;
        downloadBtnT.textContent = 'İndir';
    }
}

// ── Settings persistence ─────────────────────────────────────
function syncRadioChecked(group) {
    document.querySelectorAll(`input[name="${group}"]`).forEach(r => {
        r.closest('.radio-label').classList.toggle('checked', r.checked);
    });
}

function bindSettingsInputs() {
    document.querySelectorAll('input[name="defaultQuality"]').forEach(r => {
        r.addEventListener('change', () => {
            settings.defaultQuality = r.value;
            localStorage.setItem('aselens-quality', r.value);
            syncRadioChecked('defaultQuality');
        });
    });
    document.querySelectorAll('input[name="outputFormat"]').forEach(r => {
        r.addEventListener('change', () => {
            settings.outputFormat = r.value;
            localStorage.setItem('aselens-format', r.value);
            syncRadioChecked('outputFormat');
        });
    });
    document.querySelectorAll('input[name="audioFormat"]').forEach(r => {
        r.addEventListener('change', () => {
            settings.audioFormat = r.value;
            localStorage.setItem('aselens-audio', r.value);
            syncRadioChecked('audioFormat');
        });
    });
}

// ── Settings panel ───────────────────────────────────────────
function openSettings() {
    settingsPanel.classList.add('open');
    settingsPanel.setAttribute('aria-hidden', 'false');
    settingsOverlay.classList.add('visible');
    settingsOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeSettingsPanel() {
    settingsPanel.classList.remove('open');
    settingsPanel.setAttribute('aria-hidden', 'true');
    settingsOverlay.classList.remove('visible');
    settingsOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ── Bind Events ──────────────────────────────────────────────
function bindEvents() {
    // URL input – live platform detection
    urlInput.addEventListener('input', () => {
        updatePlatformBadge(urlInput.value.trim());
    });

    // Paste from clipboard
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                // Clear out visual button "title" if needed
                pasteBtn.removeAttribute('title');
                urlInput.value = text;
                updatePlatformBadge(text);
                showToast(t('toastPasteSuccess'), 'info', 2000);
            }
        } catch {
            // gracefully fallback
            urlInput.focus();
            showToast(t('toastPasteError'), 'error');
        }
    });

    // Form submit → fetch info
    downloadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        if (!url) { showToast(t('toastOptUrl'), 'error'); return; }
        try { new URL(url); } catch { showToast(t('toastOptUrlErr'), 'error'); return; }
        fetchMediaInfo(url);
    });

    // Download
    downloadBtn.addEventListener('click', startDownload);

    // Theme
    themeBtn.addEventListener('click', toggleTheme);
    settingsTheme.addEventListener('click', toggleTheme);

    // Animations toggle
    animToggle.addEventListener('click', () => {
        applyAnimations(!settings.animations);
    });

    // Custom dropdown
    csTrigger.addEventListener('click', toggleCustomSelect);
    csTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCustomSelect(); }
        if (e.key === 'Escape') closeCustomSelect();
    });
    document.addEventListener('click', (e) => {
        if (csWrap && !csWrap.contains(e.target)) closeCustomSelect();
    });

    // Settings open/close
    settingsBtn.addEventListener('click', openSettings);
    closeSettings.addEventListener('click', closeSettingsPanel);
    settingsOverlay.addEventListener('click', closeSettingsPanel);

    // Keyboard: Escape closes settings
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSettingsPanel();
    });

    // Settings inputs
    bindSettingsInputs();

    // Generic Custom Select Setup
    function setupSelect(wrapId, settingKey, storageKey) {
        const wrap = document.getElementById(wrapId);
        if (!wrap) return;
        const trigger = wrap.querySelector('.custom-select-trigger');
        const dropdown = wrap.querySelector('.custom-select-dropdown');

        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.custom-select').forEach(s => {
                    if (s !== wrap && s.id !== 'customSelectWrap') s.classList.remove('open');
                });
                wrap.classList.toggle('open');
            });
        }

        if (dropdown) {
            dropdown.addEventListener('click', (e) => {
                const opt = e.target.closest('.custom-option');
                if (opt) {
                    const val = opt.dataset.value;
                    settings[settingKey] = val;
                    localStorage.setItem(storageKey, val);
                    updateCustomSelectUI(wrapId, val);
                    wrap.classList.remove('open');
                }
            });
        }
    }

    setupSelect('bitrateSelectWrap', 'audioBitrate', 'aselens-bitrate');
    setupSelect('codecSelectWrap', 'videoCodec', 'aselens-codec');

    const freeToggleEl = document.getElementById('freeFormatsToggle');
    if (freeToggleEl) {
        freeToggleEl.addEventListener('click', () => {
            settings.freeFormats = !settings.freeFormats;
            localStorage.setItem('aselens-free', settings.freeFormats);
            freeToggleEl.setAttribute('aria-checked', settings.freeFormats ? 'true' : 'false');
            freeToggleEl.classList.toggle('active', settings.freeFormats);
        });
    }

    const sponsorToggleEl = document.getElementById('sponsorBlockToggle');
    if (sponsorToggleEl) {
        sponsorToggleEl.addEventListener('click', () => {
            settings.sponsorBlock = !settings.sponsorBlock;
            localStorage.setItem('aselens-sponsor', settings.sponsorBlock);
            sponsorToggleEl.setAttribute('aria-checked', settings.sponsorBlock ? 'true' : 'false');
            sponsorToggleEl.classList.toggle('active', settings.sponsorBlock);
        });
    }

    const subToggleEl = document.getElementById('embedSubsToggle');
    if (subToggleEl) {
        subToggleEl.addEventListener('click', () => {
            settings.embedSubs = !settings.embedSubs;
            localStorage.setItem('aselens-subs', settings.embedSubs);
            subToggleEl.setAttribute('aria-checked', settings.embedSubs ? 'true' : 'false');
            subToggleEl.classList.toggle('active', settings.embedSubs);
        });
    }

    // Language Dropdown
    const langTrigger = document.getElementById('langSelectTrigger');
    const langWrap = document.getElementById('langSelectWrap');
    const langDropdown = document.getElementById('langSelectDropdown');

    if (langTrigger) {
        langTrigger.addEventListener('click', () => {
            langWrap.classList.toggle('open');
        });

        langDropdown.addEventListener('click', (e) => {
            const opt = e.target.closest('.custom-option');
            if (opt) {
                const lang = opt.dataset.lang;
                applyLanguage(lang);

                langDropdown.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                langWrap.classList.remove('open');
            }
        });

        document.addEventListener('click', (e) => {
            if (langWrap && !langWrap.contains(e.target)) langWrap.classList.remove('open');
        });
    }

    // Handle URL drag & drop
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        const text = e.dataTransfer.getData('text');
        if (text) {
            urlInput.value = text;
            updatePlatformBadge(text);
        }
    });
}

// ── Start ────────────────────────────────────────────────────
init();
