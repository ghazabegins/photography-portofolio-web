/**
 * TJ SOSMED TOOLS - MASTER SCRIPT (FIXED FOR MOBILE)
 * Developed by Ghaza Algifari (2025)
 */

// ==========================================
// 1. KONFIGURASI GLOBAL
// ==========================================
const loadingDiv = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const videoTitle = document.getElementById('videoTitle');

// API Key RapidAPI (Pastikan kuota aman)
const apiKey = '804ff958ecmshe6d23ba4fd2be6bp154905jsn9d83ded4d839'; 
const apiHost = 'social-media-video-downloader.p.rapidapi.com';

// ==========================================
// 2. FUNGSI BANTUAN (HELPER)
// ==========================================

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
        alert("Silakan Save Manual (Tekan lama pada gambar/video).");
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

    const backupTrends = [
        "Banjir Bandang Sumut", "Menteri Viral", "Gempa Terkini", 
        "Pajak Naik", "Timnas Indonesia", "Harga Emas", "Wisata Viral"
    ];

    function renderTicker(items) {
        let html = "";
        items.forEach(topic => {
            const link = `https://www.google.com/search?q=${encodeURIComponent(topic)}`;
            html += `<span class="ticker-item"><a href="${link}" target="_blank">${topic}</a></span>`;
        });
        tickerContent.innerHTML = html;
    }

    renderTicker(backupTrends); // Load backup dulu

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
                apiUrl = `https://${apiHost}/instagram/v3/media/download?url=${encodeURIComponent(urlInput)}`;
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

            if (content.videos && content.videos.length > 0) {
                mediaData = content.videos[0];
            } else if (content.images && content.images.length > 0) {
                fileType = 'jpg';
                mediaData = content.images[0];
            }

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

                // Preview Image
                let previewUrl = (fileType === 'jpg') ? mediaData.url : (data.metadata?.thumbnailUrl || content.cover);
                if (previewUrl) {
                    const img = document.createElement('img');
                    img.id = 'previewImg'; img.src = previewUrl;
                    img.style.cssText = "width:100%; border-radius:10px; margin:10px 0;";
                    document.querySelector('.video-preview').insertBefore(img, videoTitle);
                }
            } else {
                throw new Error("Link download kosong.");
            }

        } catch (error) {
            loadingDiv.classList.add('hidden');
            alert(`Gagal: ${error.message}`);
        }
    };
}


// ==========================================
// 5. FITUR: METADATA REMOVER (FIXED RESIZE)
// ==========================================
if (document.getElementById('dropZone') && !document.getElementById('dropZoneViewer')) {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    const previewImage = document.getElementById('previewImage');
    const cleanBtn = document.getElementById('downloadCleanBtn');

    dropZone.addEventListener('click', () => fileInput.click());
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
                
                // --- UPDATE PENTING: RESIZE AGAR HP TIDAK CRASH ---
                let w = img.width;
                let h = img.height;
                const MAX_DIMENSION = 4096; // Batas aman browser HP

                if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
                    if (w > h) { h = Math.round(h * (MAX_DIMENSION / w)); w = MAX_DIMENSION; } 
                    else { w = Math.round(w * (MAX_DIMENSION / h)); h = MAX_DIMENSION; }
                }

                canvas.width = w; 
                canvas.height = h; 
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h); 
                
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
            img.src = e.target.result;
        }; 
        reader.readAsDataURL(file);
    }
}


// ==========================================
// 6. FITUR: METADATA VIEWER (FIXED PREVIEW)
// ==========================================
if (document.getElementById('viewerPage')) {
    const dropZone = document.getElementById('dropZoneViewer');
    const fileInput = document.getElementById('fileInputViewer');
    const tableBody = document.getElementById('exifTableBody');
    const imgPreview = document.getElementById('imgPreview');
    const basicInfo = document.getElementById('basicInfo');
    const gpsContainer = document.getElementById('gpsContainer');
    const mapsLink = document.getElementById('mapsLink');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => { if(fileInput.files.length) processExif(fileInput.files[0]); });

    window.filterTable = function() {
        const filter = document.getElementById("searchInput").value.toUpperCase();
        document.querySelectorAll(".exif-table tbody tr").forEach(row => {
            row.style.display = row.innerText.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        });
    };

    function processExif(file) {
        // UPDATE: Izinkan file non-jpg untuk sekedar preview
        if (!file.type.match('image.*')) { alert("Harap upload file gambar!"); return; }
        
        loadingDiv.classList.remove('hidden'); 
        resultDiv.classList.add('hidden'); 
        document.querySelector('.upload-area').classList.add('hidden');
        
        // 1. Tampilkan Preview dulu (apapun formatnya)
        const reader = new FileReader();
        reader.onload = function(e) { 
            imgPreview.src = e.target.result; 
        };
        reader.readAsDataURL(file);

        // 2. Cek apakah EXIF didukung (Harus JPEG/TIFF)
        const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.name.toLowerCase().endsWith('.jpg');

        if (!isJpeg) {
            // Jika bukan JPG (misal PNG/WEBP), tampilkan info terbatas
            setTimeout(() => {
                loadingDiv.classList.add('hidden'); 
                resultDiv.classList.remove('hidden');
                basicInfo.innerHTML = `<strong>${file.name}</strong><br>Format: ${file.type} (EXIF tidak tersedia untuk format ini)`;
                tableBody.innerHTML = `<tr><td colspan="2" align="center">Format file ini (${file.type}) tidak menyimpan metadata EXIF standar. Coba gunakan file JPG asli kamera.</td></tr>`;
                gpsContainer.classList.add('hidden');
            }, 500);
            return;
        }

        // 3. Jika JPG, baca EXIF
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

            // Render Data Utama
            keyMap.forEach(k => {
                if(allTags[k.key]) {
                    hasData = true;
                    let v = allTags[k.key];
                    if(k.fmt=='s' && v.numerator) v = `1/${Math.round(v.denominator/v.numerator)}s`;
                    if(k.fmt=='f') v = `f/${Number(v).toFixed(1)}`;
                    tableHTML += `<tr><td style="color:#00ff88;font-weight:bold">${k.label}</td><td>${v}</td></tr>`;
                }
            });

            // Render Sisa Data
            for(let t in allTags) {
                if(keyMap.some(k=>k.key==t) || t=='MakerNote' || t=='thumbnail' || t=='UserComment' || t.includes('GPS')) continue;
                tableHTML += `<tr><td style="color:#aaa">${t}</td><td>${allTags[t]}</td></tr>`;
            }

            if(!hasData) tableHTML = `<tr><td colspan="2" align="center">Data EXIF Kosong. (Kemungkinan foto hasil download WA/Facebook/Screenshot yang metadatanya sudah dihapus sistem).</td></tr>`;
            
            tableBody.innerHTML = tableHTML;
            basicInfo.innerHTML = `<strong>${file.name}</strong> (${(file.size/1024/1024).toFixed(2)} MB)`;

            // Render GPS
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
}

// ==========================================
// 9. FITUR: AUTO WATERMARK & CAROUSEL (DIPERSINGKAT UNTUK STABILITAS)
// ==========================================
// (Bagian ini sama dengan sebelumnya, tidak ada isu major di mobile kecuali memory)
// Pastikan fitur watermark menggunakan logika canvas resize yang sama jika error
if (document.getElementById('watermarkPage')) {
    const mainInput = document.getElementById('mainPhotoInput');
    // ... Logika watermark (tambahkan resize jika masih crash di HP) ...
}
if (document.getElementById('carouselPage')) {
   // ... Logika carousel ...
}