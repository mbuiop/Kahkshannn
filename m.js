// m.js - فایل اصلی بازی
function initGame() {
    // تغییر پس‌زمینه صفحه
    document.body.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
    document.body.style.transition = 'background 1s ease';
    
    // ایجاد عناصر بازی
    const gameContainer = document.createElement('div');
    gameContainer.style.cssText = `
        background: white; 
        padding: 40px; 
        border-radius: 15px; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
        text-align: center;
        margin: 20px;
        animation: fadeIn 0.5s ease;
    `;
    
    gameContainer.innerHTML = `
        <h2 style="color: #333; margin-bottom: 20px;">🎯 بازی شروع شد!</h2>
        <p style="color: #666; margin-bottom: 25px; font-size: 16px;">این بخش اصلی بازی شماست</p>
        <button onclick="alert('بازی با موفقیت اجرا می‌شود!')" 
                style="background: #4CAF50; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-size: 16px;">
            کلیک برای تست
        </button>
    `;
    
    document.body.appendChild(gameContainer);
}

// اضافه کردن استایل برای انیمیشن
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

console.log('فایل m.js بارگیری شد و آماده اجراست');
