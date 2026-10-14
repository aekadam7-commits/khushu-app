const QRShare = {
  getAppUrl(){
    return 'https://github.com/aekadam7-commits/khushu-app/releases/latest/download/khushu.apk';
  },
  
  async shareApp(){
    const url = this.getAppUrl();
    
    const shareData = {
      title: 'خُشوع',
      text: 'تحميل تطبيق خُشوع',
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
    
    try{
      if(navigator.clipboard){
        await navigator.clipboard.writeText(url);
        toast('✅ تم نسخ الرابط');
        return;
      }
    } catch(e){}
    
    toast('❌ تعذر المشاركة');
  },
  
  showQR(){
    const url = this.getAppUrl();
    
    const html = 
      '<h3>📱 تحميل تطبيق خُشوع</h3>' +
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
    
    setTimeout(() => this.generateQR(url), 100);
    
    if(Focus.enabled) setTimeout(() => Focus.reset(), 200);
  },
  
  generateQR(url){
    const wrap = document.getElementById('qrWrap');
    if(!wrap) return;
    
    const qrSize = 240;
    const apiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=' + 
                   qrSize + 'x' + qrSize + 
                   '&data=' + encodeURIComponent(url) +
                   '&color=0b2e2a&bgcolor=ffffff';
    
    wrap.innerHTML = 
      '<a href="' + url + '" target="_blank" rel="noopener" ' +
        'style="display:inline-block;padding:14px;background:#fff;border-radius:16px;' +
        'box-shadow:0 4px 20px rgba(0,0,0,.15)">' +
        '<img src="' + apiUrl + '" alt="QR" ' +
          'style="width:' + qrSize + 'px;height:' + qrSize + 'px;border-radius:8px;display:block">' +
      '</a>';
  },
  
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
