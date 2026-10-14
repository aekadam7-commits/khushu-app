/* ============================================================
   خُشوع — qr-share.js
   مشاركة التطبيق + QR Code
   ============================================================ */

const QRShare = {
  // رابط التطبيق (يُستخدم في المشاركة + QR)
  getAppUrl(){
    return 'https://github.com/aekadam7-commits/khuchu-app';
  },
  
  // مشاركة التطبيق
  async shareApp(){
    const url = this.getAppUrl();
    
    const shareData = {
      title: 'خُشوع — تطبيق إسلامي شامل',
      text: 'تطبيق خُشوع — قرآن + صلاة + أذكار + قبلة + تقويم',
      url: url
    };
    
    try{
      if(navigator.share){
        await navigator.share(shareData);
        return;
      }
    } catch(e){
      if(e.name === 'AbortError') return;
    }
    
    // بديل: نسخ الرابط
    try{
      if(navigator.clipboard){
        await navigator.clipboard.writeText(url);
        toast('✅ تم نسخ الرابط');
        return;
      }
    } catch(e){}
    
    toast('❌ تعذر المشاركة');
  },
  
  // عرض QR Code
  showQR(){
    const url = this.getAppUrl();
    
    const html = 
      '<h3>📱 شارك التطبيق</h3>' +
      '<p class="text-center text-muted" style="font-size:12px;margin-bottom:16px;line-height:1.8">' +
        'امسح الرمز بكاميرا الهاتف<br>لمشاركة التطبيق مع أصدقائك' +
      '</p>' +
      '<div id="qrWrap" class="qr-wrap"></div>' +
      '<div class="qr-url">' + url + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:14px">' +
        '<button class="btn-secondary" data-focus onclick="QRShare.shareApp();App.closeModal()" ' +
          'style="flex:1">📤 مشاركة</button>' +
        '<button class="btn-secondary" data-focus onclick="QRShare.copyUrl()" ' +
          'style="flex:1">📋 نسخ</button>' +
      '</div>' +
      '<button class="btn-secondary" data-focus onclick="App.closeModal()" ' +
        'style="width:100%;margin-top:8px">إغلاق</button>';
    
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
    
    // توليد QR
    setTimeout(() => this.generateQR(url), 100);
    
    if(Focus.enabled) setTimeout(() => Focus.reset(), 200);
  },
  
  // توليد QR Code
  generateQR(url){
    const wrap = document.getElementById('qrWrap');
    if(!wrap) return;
    
    const qrSize = 220;
    const apiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + 
                   qrSize + 'x' + qrSize + 
                   '&data=' + encodeURIComponent(url) +
                   '&color=0b2e2a&bgcolor=ffffff';
    
    wrap.innerHTML = '<img src="' + apiUrl + '" alt="QR" ' +
      'style="width:' + qrSize + 'px;height:' + qrSize + 'px;border-radius:12px" ' +
      'onerror="this.parentElement.innerHTML=\'<div style=\'padding:20px;color:#ef4444\'>⚠️ تعذر توليد QR</div>\'">';
  },
  
  // نسخ الرابط
  async copyUrl(){
    const url = this.getAppUrl();
    
    try{
      if(navigator.clipboard){
        await navigator.clipboard.writeText(url);
        toast('✅ تم نسخ الرابط');
        return;
      }
    } catch(e){}
    
    toast('❌ تعذر النسخ');
  }
};
