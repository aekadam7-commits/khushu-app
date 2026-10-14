/* ============================================================
   خُشوع — calendar.js
   التقويم الهجري / الميلادي
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
  toHijri(date){
    try{
      const fmt = new Intl.DateTimeFormat(
        'en-u-ca-islamic-umalqura',
        { day:'numeric', month:'numeric', year:'numeric' }
      );
      const parts = fmt.formatToParts(date);
      const g = t => parseInt(parts.find(p => p.type === t).value, 10);
      return { day:g('day'), month:g('month'), year:g('year') };
    } catch(e){
      return { day:1, month:1, year:1447 };
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
        '<div class="h-day">' + hij.day + '</div>' +
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
  }
};
