/* ============================================================
   خُشوع — calendar.js
   التقويم الهجري / الميلادي (نسخة محسّنة)
   ============================================================ */

const HMONTHS = [
  "محرم","صفر","ربيع الأول","ربيع الثاني",
  "جمادى الأولى","جمادى الآخرة","رجب","شعبان",
  "رمضان","شوال","ذو القعدة","ذو الحجة"
];

const GMONTHS = [
  "جانفي","فيفري","مارس","أفريل","ماي","جوان",
  "جويلية","أوت","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
];

const Hijri = {
  // تحويل ميلادي إلى هجري (طريقة حسابية)
  toHijri(date){
    try {
      const g_y = date.getFullYear();
      const g_m = date.getMonth() + 1;
      const g_d = date.getDate();
      
      let jd;
      
      if ((g_y > 1582) || (g_y === 1582 && g_m > 10) || (g_y === 1582 && g_m === 10 && g_d > 14)) {
        jd = Math.floor((1461 * (g_y + 4800 + Math.floor((g_m - 14) / 12))) / 4)
           + Math.floor((367 * (g_m - 2 - 12 * Math.floor((g_m - 14) / 12))) / 12)
           - Math.floor((3 * Math.floor((g_y + 4900 + Math.floor((g_m - 14) / 12)) / 100)) / 4)
           + g_d - 32075;
      } else {
        jd = 367 * g_y - Math.floor((7 * (g_y + 5001 + Math.floor((g_m - 9) / 7))) / 4)
           + Math.floor((275 * g_m) / 9) + g_d + 1729777;
      }
      
      const l = jd - 1948440 + 10632;
      const n = Math.floor((l - 1) / 10631);
      const l2 = l - 10631 * n + 354;
      const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719)
              + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
      const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
               - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
      const h_m = Math.floor((24 * l3) / 709);
      const h_d = l3 - Math.floor((709 * h_m) / 24);
      const h_y = 30 * n + j - 30;
      
      return { day: h_d, month: h_m, year: h_y };
    } catch(e) {
      // في حالة الفشل، نستخدم التاريخ الميلادي كبديل
      return { 
        day: date.getDate(), 
        month: date.getMonth() + 1, 
        year: date.getFullYear() - 579 
      };
    }
  },
  
  format(d){
    const h = this.toHijri(d);
    return h.day + ' ' + HMONTHS[h.month - 1] + ' ' + h.year + ' هـ';
  }
};

const Calendar = {
  current: new Date(),
  
  init(){
    this.render();
  },
  
  prev(){
    this.current = new Date(
      this.current.getFullYear(),
      this.current.getMonth() - 1,
      1
    );
    this.render();
  },
  
  next(){
    this.current = new Date(
      this.current.getFullYear(),
      this.current.getMonth() + 1,
      1
    );
    this.render();
  },
  
  render(){
    try {
      const d = this.current;
      let h;
      try{ h = Hijri.toHijri(d); } catch(e){ h = { month:1, year:1447 }; }
      
      const titleEl = document.getElementById('calTitle');
      if(titleEl) titleEl.textContent = HMONTHS[h.month - 1] + ' ' + h.year;
      
      const grid = document.getElementById('calGrid');
      if(!grid) return;
      grid.innerHTML = '';
      
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      const startWeek = first.getDay();
      const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const today = new Date();
      
      // أيام فارغة
      for(let i = 0; i < startWeek; i++){
        const e = document.createElement('div');
        e.className = 'cal-day empty';
        grid.appendChild(e);
      }
      
      // أيام الشهر
      for(let day = 1; day <= daysInMonth; day++){
        const gd = new Date(d.getFullYear(), d.getMonth(), day);
        let hij;
        try{ hij = Hijri.toHijri(gd); } catch(e){ hij = { day:day }; }
        
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        cell.setAttribute('data-focus', '');
        
        const isToday = 
          today.getDate() === day &&
          today.getMonth() === d.getMonth() &&
          today.getFullYear() === d.getFullYear();
        
        if(isToday) cell.classList.add('today');
        
        cell.innerHTML = 
          '<div class="h-day">' + (hij.day || day) + '</div>' +
          '<div class="g-day">' + day + '</div>';
        
        grid.appendChild(cell);
      }
      
      // قائمة المناسبات
      const events = [
        ['1 محرم','رأس السنة الهجرية'],
        ['10 محرم','يوم عاشوراء'],
        ['12 ربيع الأول','المولد النبوي'],
        ['27 رجب','الإسراء والمعراج'],
        ['15 شعبان','ليلة النصف من شعبان'],
        ['1 رمضان','أول رمضان'],
        ['27 رمضان','ليلة القدر (مرجحة)'],
        ['1 شوال','عيد الفطر'],
        ['9 ذو الحجة','يوم عرفة'],
        ['10 ذو الحجة','عيد الأضحى']
      ];
      
      const el = document.getElementById('eventsList');
      if(!el) return;
      el.innerHTML = '';
      
      events.forEach(e => {
        const r = document.createElement('div');
        r.className = 'event-row';
        r.setAttribute('data-focus', '');
        r.innerHTML = '<strong>' + e[0] + '</strong><span>' + e[1] + '</span>';
        el.appendChild(r);
      });
      
    } catch(e) {
      console.error('Calendar.render error:', e);
    }
  }
};
