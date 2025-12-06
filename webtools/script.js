/**
 * TJ SOSMED TOOLS - MASTER SCRIPT (CAROUSEL FIXED)
 * Developed by Ghaza Algifari (2025)
 * Fixes: Carousel Templates, Mobile Touch Conflict, Memory Crash
 */

// ==========================================
// 1. KONFIGURASI GLOBAL
// ==========================================
const loadingDiv = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const videoTitle = document.getElementById('videoTitle');

// API Key RapidAPI
const apiKey = '804ff958ecmshe6d23ba4fd2be6bp154905jsn9d83ded4d839'; 
const apiHost = 'social-media-video-downloader.p.rapidapi.com';

// Batas resolusi aman untuk HP (4K) agar tidak crash
const MAX_MOBILE_DIMENSION = 4096; 

// ==========================================
// 2. FUNGSI BANTUAN (HELPER)
// ==========================================

// Helper: Memastikan Input File bisa diklik di Mobile
function fixMobileInput(inputId) {
    const el = document.getElementById(inputId);
    if (el) {
        el.removeAttribute('hidden');
        el.style.display = 'block';
        el.style.height = '0';
        el.style.width = '0';
        el.style.opacity = '0';
        el.style.position = 'absolute';
        el.style.overflow = 'hidden';
        el.style.padding = '0';
        el.style.margin = '0';
    }
}

// Helper: Resize Gambar Anti-Crash
function calculateSafeSize(w, h) {
    if (w > MAX_MOBILE_DIMENSION || h > MAX_MOBILE_DIMENSION) {
        if (w > h) {
            h = Math.round(h * (MAX_MOBILE_DIMENSION / w));
            w = MAX_MOBILE_DIMENSION;
        } else {
            w = Math.round(w * (MAX_MOBILE_DIMENSION / h));
            h = MAX_MOBILE_DIMENSION;
        }
    }
    return { w, h };
}

// Fungsi Download Paksa
async function forceDownload(url, filename, btn) {
    const originalText = btn.innerText;
    btn.innerText = "Memproses...";
    btn.style.backgroundColor = "#ffa500"; 

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network error");
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        btn.innerText = "Selesai!";
        btn.style.backgroundColor = "#4CAF50"; 
        setTimeout(() => { 
            btn.innerText = originalText; 
            btn.style.backgroundColor = ""; 
        }, 3000);

    } catch (e) {
        console.warn("Auto-download blocked.");
        alert("Silakan Save Manual (Tekan tahan gambar).");
        window.open(url, '_blank');
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
    }
}

// ==========================================
// 3. FITUR: LIVE TICKER
// ==========================================
(async function initTicker() {
    const tickerContent = document.getElementById('tickerContent');
    if (!tickerContent) return;

    const backupTrends = ["Banjir Bandang Sumut", "Menteri Viral", "Gempa Terkini", "Pajak Naik", "Timnas Indonesia"];
    
    function renderTicker(items) {
        let html = "";
        items.forEach(topic => {
            const link = `https://www.google.com/search?q=${encodeURIComponent(topic)}`;
            html += `<span class="ticker-item"><a href="${link}" target="_blank">${topic}</a></span>`;
        });
        tickerContent.innerHTML = html;
    }
    renderTicker(backupTrends);

    try {
        const rssUrl = 'https://trends.google.co.id/trends/trendingsearches/daily/rss?geo=ID';
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(proxyUrl);
        if(response.ok) {
            const str = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(str, "text/xml");
            const items = xmlDoc.getElementsByTagName("item");
            if (items.length > 0) {
                const googleTrends = [];
                for (let i = 0; i < 15 && i < items.length; i++) {
                    googleTrends.push(items[i].getElementsByTagName("title")[0].textContent);
                }
                renderTicker(googleTrends);
            }
        }
    } catch (error) { console.warn("Gagal load Google Trends"); }
})();


// ==========================================
// 4. FITUR: MEDIA DOWNLOADER
// ==========================================
if (document.getElementById('urlInput')) {
    window.downloadVideo = async function() {
        let urlInput = document.getElementById('urlInput').value.trim();
        let downloadLink = document.getElementById('downloadLink');

        if (!urlInput) { alert("Harap masukkan URL media!"); return; }
        if (urlInput.includes('?')) urlInput = urlInput.split('?')[0];

        loadingDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
        const oldImg = document.getElementById('previewImg');
        if(oldImg) oldImg.remove();

        try {
            let apiUrl = '';
            let platform = '';

            if (urlInput.includes('instagram.com')) {
    platform = 'Instagram';

    // 1. Ekstrak Shortcode (ID unik) dari URL Instagram
    // Regex ini mencari teks setelah /p/, /reel/, atau /tv/
    const shortcodeRegex = /(?:p|reel|tv|reels)\/([a-zA-Z0-9_-]+)/;
    const match = urlInput.match(shortcodeRegex);
    const shortcode = match ? match[1] : null;

    if (shortcode) {
        // 2. Masukkan shortcode ke dalam struktur API baru Anda
        // Menambahkan renderableFormats=720p%2Chighres seperti permintaan
        apiUrl = `https://${apiHost}/instagram/v3/media/post/details?shortcode=${shortcode}&renderableFormats=720p%2Chighres`;
    } else {
        console.error("Gagal mengambil Shortcode dari URL Instagram.");
        // Opsional: Handle error jika URL tidak valid
    }
} else if (urlInput.includes('tiktok.com')) {
                platform = 'TikTok';
                apiUrl = `https://${apiHost}/tiktok/v3/post/details?url=${encodeURIComponent(urlInput)}`;
            } else if (urlInput.includes('facebook.com') || urlInput.includes('fb.watch')) {
                platform = 'Facebook';
                apiUrl = `https://${apiHost}/facebook/v3/post/details?url=${encodeURIComponent(urlInput)}`;
            } else {
                throw new Error("Link tidak dikenali.");
            }

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': apiHost }
            });

            if (!response.ok) throw new Error("Gagal mengambil data.");
            const data = await response.json();
            
            let contentList = data.contents || (data.data ? [data.data] : []);
            if(data.media_url) contentList = [{ videos: [{url: data.media_url}], images: [{url: data.thumbnail}] }];

            if (!contentList || contentList.length === 0) throw new Error("Media tidak ditemukan.");

            const content = contentList[0];
            let mediaData = null, fileType = 'mp4';

            if (content.videos && content.videos.length > 0) mediaData = content.videos[0];
            else if (content.images && content.images.length > 0) { fileType = 'jpg'; mediaData = content.images[0]; }

            if (mediaData && mediaData.url) {
                loadingDiv.classList.add('hidden');
                resultDiv.classList.remove('hidden');
                
                let title = data.metadata?.title || `${platform} Media`;
                if(videoTitle) videoTitle.innerText = title.substring(0, 50) + "...";
                
                const newBtn = downloadLink.cloneNode(true);
                downloadLink.parentNode.replaceChild(newBtn, downloadLink);
                
                newBtn.innerText = "DOWNLOAD";
                newBtn.href = "#";
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    forceDownload(mediaData.url, `${platform}_${Date.now()}.${fileType}`, newBtn);
                });

                let previewUrl = (fileType === 'jpg') ? mediaData.url : (data.metadata?.thumbnailUrl || content.cover);
                if (previewUrl) {
                    const img = document.createElement('img');
                    img.id = 'previewImg'; img.src = previewUrl;
                    img.style.cssText = "width:100%; border-radius:10px; margin:10px 0;";
                    document.querySelector('.video-preview').insertBefore(img, videoTitle);
                }
            } else { throw new Error("Link download kosong."); }

        } catch (error) {
            loadingDiv.classList.add('hidden');
            alert(`Gagal: ${error.message}`);
        }
    };
}


// ==========================================
// 5. FITUR: METADATA REMOVER
// ==========================================
if (document.getElementById('dropZone') && !document.getElementById('dropZoneViewer')) {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    const previewImage = document.getElementById('previewImage');
    const cleanBtn = document.getElementById('downloadCleanBtn');

    fixMobileInput('fileInput');

    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('input')) return;
        fileInput.click();
    });

    fileInput.addEventListener('change', () => { if (fileInput.files.length) processFile(fileInput.files[0]); });

    function processFile(file) {
        if (!file.type.match('image.*')) { alert("Harap upload file gambar!"); return; }
        
        loadingDiv.classList.remove('hidden'); 
        resultDiv.classList.add('hidden');
        document.querySelector('.upload-area').classList.add('hidden');

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const size = calculateSafeSize(img.width, img.height);
                canvas.width = size.w;
                canvas.height = size.h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, size.w, size.h);
                canvas.toBlob((blob) => {
                    const cleanUrl = URL.createObjectURL(blob);
                    loadingDiv.classList.add('hidden'); 
                    resultDiv.classList.remove('hidden');
                    previewImage.src = cleanUrl; 
                    fileNameDisplay.innerText = "Clean_" + file.name;
                    cleanBtn.href = cleanUrl; 
                    cleanBtn.download = "Clean_" + file.name;
                }, 'image/jpeg', 0.95); 
            };
            img.onerror = function() { alert("File gambar rusak."); loadingDiv.classList.add('hidden'); };
            img.src = e.target.result;
        }; 
        reader.readAsDataURL(file);
    }
}


// ==========================================
// 6. FITUR: METADATA VIEWER
// ==========================================
if (document.getElementById('viewerPage')) {
    const dropZone = document.getElementById('dropZoneViewer');
    const fileInput = document.getElementById('fileInputViewer');
    const tableBody = document.getElementById('exifTableBody');
    const imgPreview = document.getElementById('imgPreview');
    const basicInfo = document.getElementById('basicInfo');
    const gpsContainer = document.getElementById('gpsContainer');
    const mapsLink = document.getElementById('mapsLink');

    fixMobileInput('fileInputViewer');

    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('input')) return;
        fileInput.click();
    });

    fileInput.addEventListener('change', () => { if(fileInput.files.length) processExif(fileInput.files[0]); });

    window.filterTable = function() {
        const filter = document.getElementById("searchInput").value.toUpperCase();
        document.querySelectorAll(".exif-table tbody tr").forEach(row => {
            row.style.display = row.innerText.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        });
    };

    function processExif(file) {
        if (!file.type.match('image.*')) { alert("Harap upload file gambar!"); return; }
        
        loadingDiv.classList.remove('hidden'); 
        resultDiv.classList.add('hidden'); 
        document.querySelector('.upload-area').classList.add('hidden');
        
        const reader = new FileReader();
        reader.onload = function(e) { imgPreview.src = e.target.result; };
        reader.readAsDataURL(file);

        const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.name.toLowerCase().endsWith('.jpg');

        if (!isJpeg) {
            setTimeout(() => {
                loadingDiv.classList.add('hidden'); 
                resultDiv.classList.remove('hidden');
                basicInfo.innerHTML = `<strong>${file.name}</strong><br>Tipe: ${file.type}<br><span style="color:#ff4757;">(Format ini tidak menyimpan EXIF)</span>`;
                tableBody.innerHTML = `<tr><td colspan="2" align="center">EXIF hanya tersedia di file JPG asli kamera.</td></tr>`;
                gpsContainer.classList.add('hidden');
            }, 500);
            return;
        }

        EXIF.getData(file, function() {
            loadingDiv.classList.add('hidden'); 
            resultDiv.classList.remove('hidden');
            const allTags = EXIF.getAllTags(this);
            let tableHTML = "";
            let hasData = false;
            const keyMap = [
                { key: 'Make', label: 'Merk Kamera' }, { key: 'Model', label: 'Model' }, { key: 'LensModel', label: 'Lensa' },
                { key: 'ExposureTime', label: 'Shutter', fmt: 's' }, { key: 'FNumber', label: 'Aperture', fmt: 'f' },
                { key: 'ISOSpeedRatings', label: 'ISO' }, { key: 'DateTimeOriginal', label: 'Waktu' }
            ];
            keyMap.forEach(k => {
                if(allTags[k.key]) {
                    hasData = true;
                    let v = allTags[k.key];
                    if(k.fmt=='s' && v.numerator) v = `1/${Math.round(v.denominator/v.numerator)}s`;
                    if(k.fmt=='f') v = `f/${Number(v).toFixed(1)}`;
                    tableHTML += `<tr><td style="color:#00ff88;font-weight:bold">${k.label}</td><td>${v}</td></tr>`;
                }
            });
            for(let t in allTags) {
                if(keyMap.some(k=>k.key==t) || t.includes('GPS') || t=='MakerNote' || t=='thumbnail' || t=='UserComment') continue;
                tableHTML += `<tr><td style="color:#aaa">${t}</td><td>${allTags[t]}</td></tr>`;
            }
            if(!hasData) tableHTML = `<tr><td colspan="2" align="center">Data EXIF Kosong.</td></tr>`;
            
            tableBody.innerHTML = tableHTML;
            basicInfo.innerHTML = `<strong>${file.name}</strong> (${(file.size/1024/1024).toFixed(2)} MB)`;

            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            if(lat && lon) {
                const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
                const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";
                const decLat = (lat[0] + lat[1]/60 + lat[2]/3600) * (latRef === "N" ? 1 : -1);
                const decLon = (lon[0] + lon[1]/60 + lon[2]/3600) * (lonRef === "E" ? 1 : -1);
                gpsContainer.classList.remove('hidden');
                mapsLink.href = `https://www.google.com/maps?q=${decLat},${decLon}`;
                mapsLink.innerHTML = `📍 Lihat Lokasi (${decLat.toFixed(5)}, ${decLon.toFixed(5)})`;
            } else { gpsContainer.classList.add('hidden'); }
        });
    }
}


// ==========================================
// 7. FITUR: CAPTION GENERATOR
// ==========================================
if (document.getElementById('captionPage')) {
    const resultBox = document.getElementById('result');
    const captionText = document.getElementById('captionText');
    const templates = {
        santai: ["Nikmati prosesnya. ✨", "Slow down. {topic}. ☕", "Definisi bahagia: {topic}. 🍃"],
        lucu: ["Niatnya diet, eh ketemu {topic}. 🤪", "Dibalik foto ini ada perjuangan {topic}. 🤣"],
        motivasi: ["Jangan menyerah pada {topic}. 🔥", "Mulailah {topic} sekarang. 💪"],
        promosi: ["Promo spesial {topic}! 🔥", "Solusi terbaik: {topic}. 🛍️"],
        aesthetic: ["Lost in {topic}. 🌙", "Collecting moments with {topic}. 🎞️"]
    };
    const hashtags = { santai: "#chill", lucu: "#ngakak", motivasi: "#sukses", promosi: "#promo", aesthetic: "#aesthetic" };

    window.generateCaption = function() {
        const topic = document.getElementById('topicInput').value.trim() || "moment ini";
        const tone = document.getElementById('toneInput').value;
        const list = templates[tone];
        const random = list[Math.floor(Math.random() * list.length)];
        let final = random.replace(/{topic}/g, topic) + `\n.\n.\n${hashtags[tone]} #${topic.replace(/\s/g, '')}`;
        resultBox.classList.remove('hidden');
        captionText.innerText = final; 
    };
    window.copyCaption = function() {
        navigator.clipboard.writeText(captionText.innerText).then(() => alert("Tersalin!"));
    };
}


// ==========================================
// 8. FITUR: HASHTAG RISET
// ==========================================
if (document.getElementById('hashtagPage')) {
    const keywordInput = document.getElementById('keywordInput');
    const resultBox = document.getElementById('result');
    const searchLabel = document.getElementById('searchLabel');
    const tagsHard = document.getElementById('tagsHard');
    const tagsMedium = document.getElementById('tagsMedium');
    const tagsNiche = document.getElementById('tagsNiche');

    const hashtagDB = {
        "kopi": { hard: "#coffee", medium: "#ngopi", niche: "#manualbrew" },
        "bola": { hard: "#football", medium: "#timnas", niche: "#ligaindonesia" }
    };

    window.generateHashtags = function() {
        const input = keywordInput.value.toLowerCase().trim();
        if (!input) { alert("Masukkan kata kunci!"); return; }
        resultBox.classList.remove('hidden'); searchLabel.innerText = input;
        
        let foundKey = Object.keys(hashtagDB).find(key => input.includes(key));
        if (foundKey) {
            tagsHard.value = hashtagDB[foundKey].hard;
            tagsMedium.value = hashtagDB[foundKey].medium;
            tagsNiche.value = hashtagDB[foundKey].niche;
        } else {
            tagsHard.value = "#viral #fyp";
            tagsMedium.value = "#indonesia #daily";
            tagsNiche.value = `#${input.replace(/\s/g,'')}`;
        }
    };
    window.copyTags = function(id) { navigator.clipboard.writeText(document.getElementById(id).value).then(()=>alert("Disalin!")); };
    window.copyAllTags = function() { navigator.clipboard.writeText(`${tagsHard.value} ${tagsMedium.value} ${tagsNiche.value}`).then(()=>alert("Semua disalin!")); };
    keywordInput.addEventListener("keypress", function(event) { if (event.key === "Enter") window.generateHashtags(); });
}


// ==========================================
// 9. FITUR: AUTO WATERMARK
// ==========================================
if (document.getElementById('watermarkPage')) {
    const mainInput = document.getElementById('mainPhotoInput');
    const logoInput = document.getElementById('logoInput');
    const canvas = document.getElementById('wmCanvas');
    const ctx = canvas.getContext('2d');
    const processBtn = document.getElementById('processWmBtn');
    const placeholder = document.getElementById('placeholderText');
    const sizeVal = document.getElementById('sizeVal');
    const alphaVal = document.getElementById('alphaVal');
    const fileCountText = document.getElementById('wmFileCount');
    const resultArea = document.getElementById('wmResultArea');
    const resultGrid = document.getElementById('wmResultsGrid');

    let wmSelectedFiles = [];
    let previewImg = new Image();
    let logoImg = new Image();
    let isPreviewLoaded = false, isLogoLoaded = false;
    let currentPos = 'mc', currentSize = 20, currentAlpha = 1, currentRatio = 'original';

    document.querySelectorAll('input[name="wmRatio"]').forEach(radio => {
        radio.addEventListener('change', function() { currentRatio = this.value; updatePreview(); });
    });
    document.querySelectorAll('.pos-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.pos-box').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPos = this.dataset.pos;
            updatePreview();
        });
    });
    document.getElementById('sizeSlider').addEventListener('input', function() { currentSize = this.value; sizeVal.innerText = this.value + "%"; updatePreview(); });
    document.getElementById('opacitySlider').addEventListener('input', function() { currentAlpha = this.value / 100; alphaVal.innerText = this.value + "%"; updatePreview(); });

    mainInput.addEventListener('change', function(e) {
        let files = Array.from(e.target.files);
        if (files.length > 10) { alert("Maks 10 foto!"); files = files.slice(0, 10); }
        wmSelectedFiles = files;
        fileCountText.innerText = `${wmSelectedFiles.length} foto terpilih.`;
        if (wmSelectedFiles.length > 0) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                previewImg.src = evt.target.result;
                previewImg.onload = () => { isPreviewLoaded = true; updatePreview(); };
            };
            reader.readAsDataURL(wmSelectedFiles[0]);
        }
    });

    logoInput.addEventListener('change', function(e) {
        if(!e.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            logoImg.src = evt.target.result;
            logoImg.onload = () => { isLogoLoaded = true; updatePreview(); };
        };
        reader.readAsDataURL(e.target.files[0]);
    });

    function applyWatermarkToCanvas(context, image, w, h) {
        // Draw image directly (assume pre-calculated dims)
        context.drawImage(image, 0, 0, w, h);

        if (isLogoLoaded) {
            const logoWidth = (w * currentSize) / 100;
            const logoHeight = logoWidth * (logoImg.height / logoImg.width);
            let x = 0, y = 0, padding = w * 0.03;

            if (currentPos.includes('l')) x = padding;
            else if (currentPos.includes('c')) x = (w - logoWidth) / 2;
            else if (currentPos.includes('r')) x = w - logoWidth - padding;

            if (currentPos.includes('t')) y = padding;
            else if (currentPos.includes('m')) y = (h - logoHeight) / 2;
            else if (currentPos.includes('b')) y = h - logoHeight - padding;

            context.globalAlpha = currentAlpha;
            context.drawImage(logoImg, x, y, logoWidth, logoHeight);
            context.globalAlpha = 1.0; 
        }
    }

    function updatePreview() {
        if (!isPreviewLoaded) return;
        canvas.style.display = 'block'; placeholder.style.display = 'none';
        if (isLogoLoaded) processBtn.disabled = false;

        let w = previewImg.width;
        let h = previewImg.height;

        // Resize preview agar tidak berat
        if (currentRatio === 'original') {
            const previewMax = 1080; 
            if(w>previewMax || h>previewMax) {
                if(w>h){ h=Math.round(h*(previewMax/w)); w=previewMax;}
                else { w=Math.round(w*(previewMax/h)); h=previewMax;}
            }
        } else {
            w = 1080;
            if (currentRatio === 'square') h = 1080;
            else if (currentRatio === 'portrait') h = 1350;
            else if (currentRatio === 'story') h = 1920;
        }

        canvas.width = w;
        canvas.height = h;
        applyWatermarkToCanvas(ctx, previewImg, w, h);
    }

    processBtn.addEventListener('click', async function() {
        if (wmSelectedFiles.length === 0 || !isLogoLoaded) return;
        loadingDiv.classList.remove('hidden'); resultArea.classList.add('hidden'); resultGrid.innerHTML = '';

        try {
            const promises = wmSelectedFiles.map((file, index) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = new Image();
                        img.onload = function() {
                            const tCanvas = document.createElement('canvas');
                            let w = img.width;
                            let h = img.height;

                            if (currentRatio === 'original') {
                                const size = calculateSafeSize(w, h);
                                w = size.w; h = size.h;
                            } else {
                                w = 1080;
                                if (currentRatio === 'square') h = 1080;
                                else if (currentRatio === 'portrait') h = 1350;
                                else if (currentRatio === 'story') h = 1920;
                            }

                            tCanvas.width = w;
                            tCanvas.height = h;
                            const tCtx = tCanvas.getContext('2d');
                            applyWatermarkToCanvas(tCtx, img, w, h);
                            resolve({ src: tCanvas.toDataURL('image/jpeg', 0.9), num: index + 1 });
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            });

            const results = await Promise.all(promises);

            results.forEach(item => {
                const div = document.createElement('div'); div.className = 'slide-item';
                const img = new Image(); img.src = item.src;
                const btn = document.createElement('a');
                btn.href = item.src; btn.download = `WM_${currentRatio}_${item.num}.jpg`;
                btn.className = 'btn-dl-slide'; btn.innerHTML = `<i class="fas fa-download"></i> Save #${item.num}`;
                div.appendChild(img); div.appendChild(btn);
                resultGrid.appendChild(div);
            });

            loadingDiv.classList.add('hidden'); resultArea.classList.remove('hidden');
            resultArea.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            loadingDiv.classList.add('hidden'); alert("Gagal memproses gambar."); console.error(error);
        }
    });
}


// ==========================================
// 10. FITUR: AUTO CAROUSEL (TEMPLATES RESTORED)
// ==========================================
if (document.getElementById('carouselPage')) {
    const fileInput = document.getElementById('carouselInput');
    const fileCountDisplay = document.getElementById('fileCount');
    const step2 = document.getElementById('step2');
    const generateBtn = document.getElementById('generateBtn');
    const resultsGrid = document.getElementById('carouselResultsGrid');
    let selectedFiles = [];

    fileInput.addEventListener('change', function(e) {
        let files = Array.from(e.target.files);
        if (files.length > 10) { alert("Maks 10 foto!"); files = files.slice(0, 10); }
        selectedFiles = files;
        fileCountDisplay.innerText = `${selectedFiles.length} foto terpilih.`;
        if (selectedFiles.length > 0) step2.classList.remove('hidden'); else step2.classList.add('hidden');
    });

    generateBtn.addEventListener('click', async function() {
        if (selectedFiles.length === 0) return;
        loadingDiv.classList.remove('hidden'); resultDiv.classList.add('hidden'); resultsGrid.innerHTML = '';

        const templateType = document.querySelector('input[name="template"]:checked').value;
        const ratioType = document.querySelector('input[name="ratio"]:checked').value;
        const mainTitle = document.getElementById('carouselTitle').value.trim();
        
        let cWidth = 1080;
        let cHeight = 1080; 
        if (ratioType === 'portrait') cHeight = 1350; 
        else if (ratioType === 'story') cHeight = 1920; 

        try {
            const loadedImages = [];
            for (let file of selectedFiles) {
                await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => { loadedImages.push(img); resolve(); };
                    img.onerror = () => { resolve(); }; 
                    img.src = URL.createObjectURL(file);
                });
            }

            loadedImages.forEach((img, index) => {
                const canvas = document.createElement('canvas');
                canvas.width = cWidth; canvas.height = cHeight;
                const ctx = canvas.getContext('2d');
                const slideNum = index + 1;
                const total = loadedImages.length;
                
                // LOGIC TEMPLATE ASLI (RESTORED)
                if (templateType === 'minimal') drawMinimalTemplate(ctx, img, cWidth, cHeight, slideNum, total);
                else if (templateType === 'split') drawSplitTemplate(ctx, img, cWidth, cHeight, slideNum, total, mainTitle);
                else if (templateType === 'cinematic') drawCinematicTemplate(ctx, img, cWidth, cHeight, slideNum, total, mainTitle);
                else if (templateType === 'journal') drawJournalTemplate(ctx, img, cWidth, cHeight, slideNum, total, mainTitle);

                const resultItem = document.createElement('div');
                resultItem.className = 'slide-item';
                const imgResult = new Image(); imgResult.src = canvas.toDataURL('image/jpeg', 0.9);
                const dlBtn = document.createElement('a');
                dlBtn.href = imgResult.src; dlBtn.download = `Slide_${slideNum}.jpg`;
                dlBtn.className = 'btn-dl-slide'; dlBtn.innerHTML = `Save Slide ${slideNum}`;
                resultItem.appendChild(imgResult); resultItem.appendChild(dlBtn);
                resultsGrid.appendChild(resultItem);
            });

            loadingDiv.classList.add('hidden'); resultDiv.classList.remove('hidden');
            resultDiv.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            loadingDiv.classList.add('hidden'); alert("Gagal memproses carousel."); console.error(error);
        }
    });

    // FUNGSI TEMPLATE
    function drawImageCover(ctx, img, x, y, w, h) {
        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let drawW, drawH, drawX, drawY;
        if (imgRatio > targetRatio) { 
            drawH = h; drawW = h * imgRatio; drawY = y; drawX = x - (drawW - w) / 2; 
        } else { 
            drawW = w; drawH = w / imgRatio; drawX = x; drawY = y - (drawH - h) / 2; 
        }
        ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.closePath(); ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawW, drawH); ctx.restore();
    }

    function drawMinimalTemplate(ctx, img, w, h, num, total) {
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
        const pad = w * 0.08; 
        const imgH = h - (pad * 2.5);
        drawImageCover(ctx, img, pad, pad, w - (pad*2), imgH);
        ctx.fillStyle = '#000'; ctx.font = `bold ${w*0.04}px Arial`; ctx.textAlign = 'center';
        ctx.fillText(`${num} / ${total}`, w/2, h - (pad * 0.5));
    }

    function drawSplitTemplate(ctx, img, w, h, num, total, title) {
        ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h);
        const imgHeight = h * 0.8; const barHeight = h * 0.2;
        drawImageCover(ctx, img, 0, 0, w, imgHeight);
        ctx.fillStyle = '#00ff88'; ctx.fillRect(0, imgHeight, w, barHeight);
        ctx.fillStyle = '#000'; ctx.textAlign = 'left';
        if(num === 1 && title) {
            ctx.font = `bold ${w*0.05}px Arial`; ctx.fillText(title, w*0.05, imgHeight + (barHeight*0.4));
            ctx.font = `${w*0.03}px Arial`; ctx.fillText(`Slide ${num} of ${total}`, w*0.05, imgHeight + (barHeight*0.7));
        } else {
             ctx.font = `bold ${w*0.04}px Arial`; ctx.fillText(`Slide ${num} / ${total}`, w*0.05, imgHeight + (barHeight*0.55));
        }
    }

    function drawCinematicTemplate(ctx, img, w, h, num, total, title) {
        drawImageCover(ctx, img, 0, 0, w, h);
        const grad = ctx.createLinearGradient(0, h*0.5, 0, h);
        grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,0.9)');
        ctx.fillStyle = grad; ctx.fillRect(0, h*0.5, w, h*0.5);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        if(title) { ctx.font = `bold ${w*0.06}px serif`; ctx.fillText(title, w/2, h - (h*0.15)); }
        ctx.font = `${w*0.03}px Arial`; ctx.fillText(`${num} — ${total}`, w/2, h - (h*0.08));
    }

    function drawJournalTemplate(ctx, img, w, h, num, total, title) {
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#222'; ctx.font = `bold ${w*0.03}px Arial`; ctx.textAlign = 'center';
        ctx.letterSpacing = '4px'; 
        const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
        ctx.fillText(dateStr, w/2, h*0.08); ctx.letterSpacing = '0px';
        const padX = w * 0.12; const padY = h * 0.15;
        const photoW = w - (padX*2); const photoH = h * 0.6;
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 20; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 8;
        ctx.fillStyle = '#fff'; ctx.fillRect(padX, padY, photoW, photoH); ctx.restore();
        drawImageCover(ctx, img, padX, padY, photoW, photoH);
        ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.strokeRect(padX, padY, photoW, photoH);
        ctx.fillStyle = '#222'; ctx.textAlign = 'center';
        const cap = title ? title.toLowerCase() : "moments in frame.";
        ctx.font = `italic ${w*0.05}px serif`; ctx.fillText(cap, w/2, padY+photoH + (h*0.1));
        ctx.font = `bold ${w*0.025}px Arial`; ctx.textAlign = 'right'; 
        ctx.fillText(`${num}/${total}`, w - (w*0.05), h - (h*0.05));
    }
}

// ==========================================
// 11. FITUR BARU: IG ROASTING BY GEMINI AI (FIXED MODEL)
// ==========================================
if (document.getElementById('roastPage')) {

    // ⚠️ WAJIB DIISI: Masukkan API Key Gemini Anda di sini
    const GEMINI_API_KEY = "AIzaSyBAV4DrQl9Y0mEQScvlfA_9ymi5RFR8Els"; 

    window.generateRoast = async function() {
        const username = document.getElementById('roastUsername').value.trim();
        const context = document.getElementById('roastContext').value.trim();
        const type = document.getElementById('roastPersona').value; 
        const level = document.getElementById('roastLevel').value;   
        
        if (!username) { alert("Username Instagram wajib diisi!"); return; }
        if (!context) { alert("Isi fakta/aib target agar AI bisa meroasting!"); return; }
        
        const loading = document.getElementById('loading');
        const result = document.getElementById('result');
        const output = document.getElementById('roastOutput');
        const loadText = document.getElementById('loadingText');

        result.classList.add('hidden');
        loading.classList.remove('hidden');
        if(loadText) loadText.innerText = "Sedang menyusun kata-kata pedas...";

        try {
            let style = (level === 'burnt') 
                ? "Sangat kejam, toxic, sarkas, frontall, bahasa gaul tongkrongan (lo-gue), menusuk hati." 
                : "Lucu, menyindir (julid), bahasa santai, seperti teman akrab yang lagi meledek.";

            const requestBody = {
                contents: [{
                    parts: [{
                        text: `Peran: Kamu adalah komika roasting profesional.
                        
                        Tugas: Roasting akun Instagram @${username}.
                        
                        Data Fakta Target (Gunakan ini sebagai bahan utama):
                        "${context}"
                        
                        Tipe Orang: ${type}
                        Gaya Bahasa: ${style}
                        
                        Instruksi Tambahan:
                        - Buat 1 paragraf pendek saja (3-5 kalimat).
                        - Gunakan bahasa Indonesia gaul/slang.
                        - Harus lucu tapi menyakitkan.
                        - Buatkan dengan trend terkini.
                        - Kalau perlu bahasa yang sangat menyakitkan`
                    }]
                }]
            };

            // --- PERBAIKAN DI SINI: GANTI NAMA MODEL ---
            // Ganti 'gemini-1.5-flash' atau 'gemini-pro' menjadi 'gemini-2.0-flash'
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errData = await response.json().catch(()=>({}));
                // Jika gemini-2.0-flash juga belum aktif di region Anda, coba 'gemini-1.5-flash-002'
                throw new Error(errData.error?.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                const aiText = data.candidates[0].content.parts[0].text;
                output.innerText = aiText; 
                loading.classList.add('hidden');
                result.classList.remove('hidden');
            } else {
                throw new Error("AI tidak memberikan jawaban.");
            }

        } catch (error) {
            console.error("Gemini Error:", error);
            loading.classList.add('hidden');
            
            // Fallback saran jika model masih error
            let msg = error.message;
            if(msg.includes("not found")) {
                msg += "\n\nSaran: Coba ganti model di script.js menjadi 'gemini-1.5-flash-002' atau 'gemini-1.5-pro-002'.";
            }
            alert(`Gagal: ${msg}`);
        }
    };

    window.copyRoast = function() {
        const text = document.getElementById('roastOutput').innerText;
        navigator.clipboard.writeText(text).then(() => alert("Hujatan tersalin!"));
    };
}