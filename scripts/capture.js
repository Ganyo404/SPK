import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = "C:\\SPK\\screenshoot";
const ARTIFACT_DIR = "C:\\Users\\Ganyo\\.gemini\\antigravity\\brain\\ee343996-7820-47f6-97c7-5f6f644a432f";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching headless Chrome for screenshots...');
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1440,1100',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    'about:blank'
  ]);

  chromeProc.on('error', (err) => console.error('Chrome process error:', err));

  let versionData = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      versionData = await res.json();
      if (versionData.webSocketDebuggerUrl) break;
    } catch {
      await sleep(500);
    }
  }

  if (!versionData || !versionData.webSocketDebuggerUrl) {
    chromeProc.kill();
    throw new Error('Failed to connect to Chrome remote debugging port.');
  }

  console.log('Connected to Chrome. Creating target page...');
  const browserCdp = new CDPClient(versionData.webSocketDebuggerUrl);
  await browserCdp.connect();

  const { targetId } = await browserCdp.send('Target.createTarget', { url: 'about:blank' });
  const pageWsUrl = `ws://127.0.0.1:9222/devtools/page/${targetId}`;

  const pageCdp = new CDPClient(pageWsUrl);
  await pageCdp.connect();

  await pageCdp.send('Page.enable');
  await pageCdp.send('DOM.enable');
  await pageCdp.send('Runtime.enable');
  await pageCdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1050,
    deviceScaleFactor: 1.5,
    mobile: false
  });

  const baseUrl = 'http://localhost:5174';

  console.log('Setting active admin user session in localStorage...');
  await pageCdp.send('Page.navigate', { url: `${baseUrl}/login` });
  await sleep(1500);

  const adminUser = {
    id: 'u-admin-1',
    email: 'admin@gmail.com',
    full_name: 'Ahmad Fauzi, S.Kom (Administrator)',
    nik: '3201011203880003',
    role: 'admin'
  };

  await pageCdp.send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('spk_active_user', JSON.stringify(${JSON.stringify(adminUser)}));
      localStorage.setItem('spk_theme', 'light');
    `
  });

  async function takeScreenshot(fileName, options = {}) {
    console.log(`Capturing: ${fileName}...`);
    const screenshotResult = await pageCdp.send('Page.captureScreenshot', {
      format: 'png',
      quality: 100,
      ...options
    });
    const buffer = Buffer.from(screenshotResult.data, 'base64');
    const filePath = path.join(OUTPUT_DIR, fileName);
    fs.writeFileSync(filePath, buffer);
    
    // Also mirror to artifact dir for preview
    if (fs.existsSync(ARTIFACT_DIR)) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, fileName), buffer);
    }
    console.log(`Saved: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  // -------------------------------------------------------------
  // 1. Gambar 3. Antarmuka pencatatan indikator pemeriksaan balita
  // -------------------------------------------------------------
  console.log('1. Setting up Gambar 3: Formulir Pemeriksaan Balita (Kevin, 10 bln)...');
  await pageCdp.send('Page.navigate', { url: `${baseUrl}/staff/examination/new?childId=child-a3` });
  await sleep(2500);

  // Set measurements through native value setters so React state updates
  await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      function setVal(input, val) {
        if (!input) return;
        const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        descriptor.set.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Find inputs by placeholder or type
      const bbInput = document.querySelector('input[placeholder*="8.5"]');
      const tbInput = document.querySelector('input[placeholder*="72.0"]');
      const lkInput = document.querySelector('input[placeholder*="45.0"]');
      const imunInput = document.querySelector('input[placeholder*="17"]');
      const solidInput = document.querySelector('input[placeholder*="3"]');

      setVal(bbInput, '9.2');
      setVal(tbInput, '74.5');
      setVal(lkInput, '45.5');
      setVal(imunInput, '17');
      setVal(solidInput, '3');

      // Check 5 food groups for MDD
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      for (let i = 0; i < Math.min(5, checkboxes.length); i++) {
        if (!checkboxes[i].checked) {
          checkboxes[i].click();
        }
      }
    })()`
  });
  await sleep(1500);

  // Expand viewport height so the entire form (Antropometri, MDD/MMF, and Hasil Standarisasi) is fully visible
  await pageCdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1420,
    deviceScaleFactor: 1.5,
    mobile: false
  });
  await sleep(500);
  await takeScreenshot('Gambar 3. Antarmuka pencatatan indikator pemeriksaan balita.png');

  // Reset viewport height for standard pages
  await pageCdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1050,
    deviceScaleFactor: 1.5,
    mobile: false
  });

  // -------------------------------------------------------------
  // 2. Gambar 4. Antarmuka pembobotan kriteria menggunakan metode AHP
  // -------------------------------------------------------------
  console.log('2. Capturing Gambar 4: Konfigurasi Pembobotan AHP...');
  await pageCdp.send('Page.navigate', { url: `${baseUrl}/admin/ahp-config` });
  await sleep(2000);
  await takeScreenshot('Gambar 4. Antarmuka pembobotan kriteria menggunakan metode AHP.png');

  // -------------------------------------------------------------
  // 3. Gambar 5. Hasil pemeringkatan alternatif balita menggunakan SAW
  // -------------------------------------------------------------
  console.log('3. Capturing Gambar 5: Hasil Pemeringkatan SAW...');
  await pageCdp.send('Page.navigate', { url: `${baseUrl}/staff/spk-calculation?ageGroupId=4&period=2026-10&gender=all` });
  await sleep(2500);
  await takeScreenshot('Gambar 5. Hasil pemeringkatan alternatif balita menggunakan SAW.png');

  // -------------------------------------------------------------
  // 4. Gambar 6. Rincian normalisasi dan perhitungan nilai preferensi (Modal Matriks SAW)
  // -------------------------------------------------------------
  console.log('4. Capturing Gambar 6: Rincian Transparansi Normalisasi & Nilai Preferensi...');
  await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes('Matriks SAW'));
      if (btn) btn.click();
    })()`
  });
  await sleep(1500);
  await takeScreenshot('Gambar 6. Rincian normalisasi dan perhitungan nilai preferensi.png');

  // -------------------------------------------------------------
  // 5. Gambar 6b. Rincian kontribusi bobot alternatif SAW (Modal Single Alternative)
  // -------------------------------------------------------------
  console.log('5. Capturing Gambar 6b: Rincian Kontribusi Alternatif SAW...');
  await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      // Close open modal
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const closeBtn = closeButtons.find(b => b.getAttribute('aria-label') === 'Close' || (b.innerHTML && b.innerHTML.includes('lucide-x')));
      if (closeBtn) closeBtn.click();
    })()`
  });
  await sleep(1000);

  // Click on the first "Rincian" button in table row
  await pageCdp.send('Runtime.evaluate', {
    expression: `(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rincianBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'Rincian');
      if (rincianBtn) rincianBtn.click();
    })()`
  });
  await sleep(1500);
  await takeScreenshot('Gambar 6b. Rincian kontribusi bobot alternatif SAW.png');

  // Clean up
  pageCdp.close();
  browserCdp.close();
  chromeProc.kill();
  console.log('All screenshots successfully generated and updated in c:\\SPK\\screenshoot\\ and artifacts!');
}

run().catch(err => {
  console.error('Screenshot script failed:', err);
  process.exit(1);
});
