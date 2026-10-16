/* ============================================================
   خُشوع — scripts/prepare-offline.js
   يجهّز مجلد www بكل ما يلزم للعمل دون إنترنت:
   - نسخ index.html و css و js و sounds
   - مكتبة adhan، ومكتبة QR، والخطوط (من node_modules)
   - نص القرآن الكامل مع أرقام الصفحات (يُجلب مرة واحدة وقت البناء)
   التشغيل:  npm install && node scripts/prepare-offline.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');
const NM = path.join(ROOT, 'node_modules');

// ---------- أدوات النص (مُصدَّرة للاختبار) ----------
const MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u08D3-\u08FF]/g;

function plain(s){
  return s.replace(MARKS, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي');
}

function stripBasmala(text){
  const clean = text.replace(/^\uFEFF/, '').trim();
  const toks = clean.split(/\s+/);
  if(toks.length > 4 && plain(toks.slice(0, 4).join(' ')) === 'بسم الله الرحمن الرحيم'){
    return toks.slice(4).join(' ');
  }
  return clean;
}

// يحوّل نتيجة alquran.cloud إلى مصفوفات مضغوطة، ويتحقق من سلامتها
function buildData(surahs, withPage){
  if(!Array.isArray(surahs) || surahs.length !== 114){
    throw new Error('عدد السور غير صحيح: ' + (surahs && surahs.length));
  }
  let total = 0;
  const out = surahs.map((s, si) => {
    const n = si + 1;
    return s.ayahs.map((a, ai) => {
      total++;
      let t = (n !== 1 && n !== 9 && ai === 0) ? stripBasmala(a.text) : a.text.replace(/^\uFEFF/, '').trim();
      if(!withPage) return t;
      if(!(a.page >= 1 && a.page <= 604)){
        throw new Error('رقم صفحة غير صالح في سورة ' + n + ' آية ' + (ai + 1));
      }
      return [t, a.page];
    });
  });
  if(total !== 6236) throw new Error('عدد الآيات ' + total + ' بدل 6236');
  return out;
}

// ---------- أدوات الملفات ----------
function mkdir(p){ fs.mkdirSync(p, { recursive:true }); }

function copyFile(src, dst, required){
  if(!fs.existsSync(src)){
    const msg = 'غير موجود: ' + path.relative(ROOT, src);
    if(required) throw new Error(msg);
    console.warn('⚠️  ' + msg);
    return false;
  }
  mkdir(path.dirname(dst));
  fs.copyFileSync(src, dst);
  console.log('✅ ' + path.relative(ROOT, dst));
  return true;
}

function copyDir(src, dst){
  if(!fs.existsSync(src)) return;
  fs.cpSync(src, dst, { recursive:true });
  console.log('✅ ' + path.relative(ROOT, dst) + '/');
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchEdition(edition){
  const url = 'https://api.alquran.cloud/v1/quran/' + edition;
  for(let attempt = 1; attempt <= 4; attempt++){
    try{
      const r = await fetch(url);
      if(!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      if(!j.data || !j.data.surahs) throw new Error('شكل الاستجابة غير متوقع');
      return j.data.surahs;
    } catch(e){
      console.warn('⚠️  ' + edition + ' محاولة ' + attempt + ': ' + e.message);
      await sleep(2000 * attempt);
    }
  }
  return null;
}

// ---------- الخطوط ----------
const FONTS = [
  { pkg:'cairo',       name:'Cairo',       weights:[400, 600, 700] },
  { pkg:'reem-kufi',   name:'Reem Kufi',   weights:[400, 600, 700] },
  { pkg:'amiri-quran', name:'Amiri Quran', weights:[400] }
];

const RANGES = {
  arabic: 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC',
  latin:  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
};

function prepareFonts(){
  let css = '/* مُولَّد تلقائياً — scripts/prepare-offline.js */\n';
  let count = 0;
  FONTS.forEach(f => {
    ['arabic', 'latin'].forEach(subset => {
      f.weights.forEach(w => {
        const file = f.pkg + '-' + subset + '-' + w + '-normal.woff2';
        const src = path.join(NM, '@fontsource', f.pkg, 'files', file);
        if(!copyFile(src, path.join(WWW, 'fonts', file), false)) return;
        css += '@font-face{font-family:"' + f.name + '";font-style:normal;font-weight:' + w +
               ';font-display:swap;src:url(../fonts/' + file + ') format("woff2");unicode-range:' +
               RANGES[subset] + ';}\n';
        count++;
      });
    });
  });
  mkdir(path.join(WWW, 'css'));
  fs.writeFileSync(path.join(WWW, 'css', 'fonts.css'), css);
  console.log('✅ css/fonts.css (' + count + ' خط)');
}

// ---------- التشغيل ----------
async function main(){
  // 1) ملفات التطبيق
  fs.rmSync(WWW, { recursive:true, force:true });
  mkdir(WWW);
  copyFile(path.join(ROOT, 'index.html'), path.join(WWW, 'index.html'), true);
  copyDir(path.join(ROOT, 'css'), path.join(WWW, 'css'));
  copyDir(path.join(ROOT, 'js'), path.join(WWW, 'js'));
  copyDir(path.join(ROOT, 'sounds'), path.join(WWW, 'sounds'));

  // 2) المكتبات
  copyFile(path.join(NM, 'adhan', 'lib', 'bundles', 'adhan.umd.min.js'),
           path.join(WWW, 'vendor', 'adhan.umd.min.js'), true);
  copyFile(path.join(NM, 'qrcode-generator', 'qrcode.js'),
           path.join(WWW, 'vendor', 'qrcode.js'), false);

  // 3) الخطوط
  prepareFonts();

  // 4) نص القرآن
  console.log('⏬ جلب نص القرآن (العثماني)...');
  const uth = await fetchEdition('quran-uthmani');
  if(!uth) throw new Error('تعذر جلب نص القرآن — تحقق من اتصال الشبكة ثم أعد المحاولة');
  const main = buildData(uth, true);
  mkdir(path.join(WWW, 'data'));
  fs.writeFileSync(path.join(WWW, 'data', 'quran-data.js'),
                   'window.QURAN_OFFLINE=' + JSON.stringify(main) + ';');
  console.log('✅ data/quran-data.js');

  console.log('⏬ جلب النص الإملائي للبحث...');
  const simple = await fetchEdition('quran-simple');
  if(simple){
    try{
      const s = buildData(simple, false);
      fs.writeFileSync(path.join(WWW, 'data', 'quran-search.js'),
                       'window.QURAN_SIMPLE=' + JSON.stringify(s) + ';');
      console.log('✅ data/quran-search.js');
    } catch(e){
      console.warn('⚠️  تخطي ملف البحث الإملائي: ' + e.message + ' (سيُستعمل النص العثماني)');
    }
  } else {
    console.warn('⚠️  تخطي ملف البحث الإملائي (سيُستعمل النص العثماني)');
  }

  console.log('🎉 اكتمل تجهيز www');
}

module.exports = { plain, stripBasmala, buildData };

if(require.main === module){
  main().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
}
