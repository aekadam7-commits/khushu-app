/* ============================================================
   خُشوع — calendar.js (نسخة جديدة كلياً)
   تقويم هجري/ميلادي بسيط لا يعتمد على Intl
   ============================================================ */

// أسماء الأشهر الهجرية
var HMONTHS = [
  "محرم","صفر","ربيع الأول","ربيع الثاني",
  "جمادى الأولى","جمادى الآخرة","رجب","شعبان",
  "رمضان","شوال","ذو القعدة","ذو الحجة"
];

// أسماء الأشهر الميلادية (بالجزائرية)
var GMONTHS = [
  "جانفي","فيفري","مارس","أفريل","ماي","جوان",
  "جويلية","أوت","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
];

// دالة تحويل التاريخ الميلادي إلى هجري (حسابية بسيطة)
function toHijri(date) {
  var g_y = date.getFullYear();
  var g_m = date.getMonth();
  var g_d = date.getDate();
  
  // حساب تقريبي (يعمل على جميع الأجهزة)
  var h_y = Math.floor((g_y - 622) * 33 / 32);
  var h_m = (g_m + 1) % 12;
  if (h_m === 0) h_m = 12;
  var h_d = g_d;
  
  return { day: h_d, month: h_m, year: h_y };
}

// كائن التقويم
var Calendar = {
  current: new Date(),
  
  init: function() {
    this.render();
  },
  
  prev: function() {
    this.current = new Date(
      this.current.getFullYear(),
      this.current.getMonth() - 1,
      1
    );
    this.render();
  },
  
  next: function() {
    this.current = new Date(
      this.current.getFullYear(),
      this.current.getMonth() + 1,
      1
    );
    this.render();
  },
  
  render: function() {
    try {
      var d = this.current;
      var h = toHijri(d);
      
      // تحديث العنوان
      var titleEl = document.getElementById('calTitle');
      if (titleEl) {
        titleEl.textContent = HMONTHS[h.month - 1] + ' ' + h.year + ' هـ';
      }
      
      // الحصول على الشبكة
      var grid = document.getElementById('calGrid');
      if (!grid) {
        console.log('calGrid not found');
        return;
      }
      
      // مسح الشبكة
      grid.innerHTML = '';
      
      // حساب أول يوم في الشهر وعدد الأيام
      var first = new Date(d.getFullYear(), d.getMonth(), 1);
      var startWeek = first.getDay(); // 0 = الأحد
      var daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      var today = new Date();
      
      // إضافة أيام فارغة في البداية
      for (var i = 0; i < startWeek; i++) {
        var emptyCell = document.createElement('div');
        emptyCell.className = 'cal-day empty';
        grid.appendChild(emptyCell);
      }
      
      // إضافة أيام الشهر
      for (var day = 1; day <= daysInMonth; day++) {
        var gd = new Date(d.getFullYear(), d.getMonth(), day);
        var hij = toHijri(gd);
        
        var cell = document.createElement('div');
        cell.className = 'cal-day';
        
        // التحقق من اليوم الحالي
        if (today.getDate() === day &&
            today.getMonth() === d.getMonth() &&
            today.getFullYear() === d.getFullYear()) {
          cell.className += ' today';
        }
        
        // إضافة الأرقام
        var hDay = document.createElement('div');
        hDay.className = 'h-day';
        hDay.textContent = hij.day;
        
        var gDay = document.createElement('div');
        gDay.className = 'g-day';
        gDay.textContent = day;
        
        cell.appendChild(hDay);
        cell.appendChild(gDay);
        grid.appendChild(cell);
      }
      
      // قائمة المناسبات
      var events = [
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
      
      var eventsEl = document.getElementById('eventsList');
      if (eventsEl) {
        eventsEl.innerHTML = '';
        for (var j = 0; j < events.length; j++) {
          var row = document.createElement('div');
          row.className = 'event-row';
          row.innerHTML = '<strong>' + events[j][0] + '</strong><span>' + events[j][1] + '</span>';
          eventsEl.appendChild(row);
        }
      }
      
      console.log('Calendar rendered: ' + daysInMonth + ' days');
      
    } catch(e) {
      console.error('Calendar.render error:', e);
      var grid2 = document.getElementById('calGrid');
      if (grid2) {
        grid2.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:red;padding:20px">خطأ: ' + e.message + '</div>';
      }
    }
  }
};
