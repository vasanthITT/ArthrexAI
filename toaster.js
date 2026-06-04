// ===== TOASTER — Global notification system =====
// Usage: showToast('Message', 'success' | 'error' | 'warning' | 'info')
// Replaces all alert() / confirm() across the app

(function () {
  // Inject toaster container + styles once
  const style = document.createElement('style');
  style.textContent = `
    #toaster-container {
      position: fixed;
      top: 76px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toaster {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      min-width: 300px;
      max-width: 380px;
      background: #1e1e32;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 14px 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: all;
      animation: toastIn 0.35s cubic-bezier(.22,.68,0,1.2) both;
      position: relative;
      overflow: hidden;
    }
    .toaster.removing {
      animation: toastOut 0.3s ease forwards;
    }
    .toaster::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      border-radius: 14px 0 0 14px;
    }
    .toaster.success { border-color: rgba(16,185,129,0.35); }
    .toaster.success::before { background: #10b981; }
    .toaster.error   { border-color: rgba(239,68,68,0.35); }
    .toaster.error::before   { background: #ef4444; }
    .toaster.warning { border-color: rgba(245,158,11,0.35); }
    .toaster.warning::before { background: #f59e0b; }
    .toaster.info    { border-color: rgba(124,58,237,0.35); }
    .toaster.info::before    { background: #7c3aed; }
    .toaster-icon { font-size: 1.3rem; flex-shrink: 0; margin-top: 1px; }
    .toaster-body { flex: 1; }
    .toaster-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 2px;
      font-family: 'Inter', sans-serif;
    }
    .toaster-msg {
      font-size: 0.78rem;
      color: #94a3b8;
      line-height: 1.5;
      font-family: 'Inter', sans-serif;
    }
    .toaster-close {
      background: none;
      border: none;
      color: #475569;
      font-size: 1rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.15s;
    }
    .toaster-close:hover { color: #e2e8f0; }
    .toaster-progress {
      position: absolute;
      bottom: 0; left: 0;
      height: 3px;
      border-radius: 0 0 14px 14px;
      animation: toastProgress linear forwards;
    }
    .toaster.success .toaster-progress { background: #10b981; }
    .toaster.error   .toaster-progress { background: #ef4444; }
    .toaster.warning .toaster-progress { background: #f59e0b; }
    .toaster.info    .toaster-progress { background: #7c3aed; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(60px) scale(0.92); }
      to   { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes toastOut {
      from { opacity: 1; transform: translateX(0) scale(1); max-height: 120px; margin-bottom: 0; }
      to   { opacity: 0; transform: translateX(60px) scale(0.88); max-height: 0; margin-bottom: -10px; }
    }
    @keyframes toastProgress {
      from { width: 100%; }
      to   { width: 0%; }
    }
    @media (max-width: 480px) {
      #toaster-container { top: auto; bottom: 80px; right: 12px; left: 12px; }
      .toaster { min-width: unset; max-width: 100%; }
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = 'toaster-container';
  document.body.appendChild(container);

  const ICONS = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const TITLES = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

  window.showToast = function (message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toaster ${type}`;

    // Split message into title + body if it contains a newline
    const parts = message.split('\n');
    const title = parts.length > 1 ? parts[0] : TITLES[type];
    const body  = parts.length > 1 ? parts.slice(1).join('\n') : message;

    toast.innerHTML = `
      <span class="toaster-icon">${ICONS[type]}</span>
      <div class="toaster-body">
        <div class="toaster-title">${title}</div>
        <div class="toaster-msg">${body}</div>
      </div>
      <button class="toaster-close" onclick="this.closest('.toaster').remove()">✕</button>
      <div class="toaster-progress" style="animation-duration:${duration}ms"></div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Confirm replacement — returns a Promise<boolean>
  window.showConfirm = function (message, type = 'warning') {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);
        z-index:99998;display:flex;align-items:center;justify-content:center;
        animation:toastIn 0.2s ease both;
      `;
      const CONFIRM_ICONS = { warning: '🗑️', error: '⚠️', info: '❓', success: '✅' };
      overlay.innerHTML = `
        <div style="background:#1e1e32;border:1px solid rgba(255,255,255,0.1);border-radius:18px;
          padding:28px 28px 24px;max-width:360px;width:calc(100% - 40px);
          box-shadow:0 20px 60px rgba(0,0,0,0.6);text-align:center;
          animation:toastIn 0.3s cubic-bezier(.22,.68,0,1.2) both;">
          <div style="font-size:2.2rem;margin-bottom:12px">${CONFIRM_ICONS[type]}</div>
          <p style="font-size:0.92rem;color:#e2e8f0;font-family:'Inter',sans-serif;
            line-height:1.6;margin-bottom:22px;font-weight:500">${message}</p>
          <div style="display:flex;gap:10px;justify-content:center">
            <button id="confirmNo" style="flex:1;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);
              color:#94a3b8;padding:10px 20px;border-radius:10px;font-size:0.88rem;font-weight:600;
              cursor:pointer;font-family:'Inter',sans-serif;transition:background 0.2s">Cancel</button>
            <button id="confirmYes" style="flex:1;background:${type==='error'||type==='warning'?'linear-gradient(135deg,#ef4444,#f97316)':'linear-gradient(135deg,#7c3aed,#2563eb)'};
              border:none;color:white;padding:10px 20px;border-radius:10px;font-size:0.88rem;
              font-weight:700;cursor:pointer;font-family:'Inter',sans-serif">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector('#confirmYes').onclick = () => { overlay.remove(); resolve(true); };
      overlay.querySelector('#confirmNo').onclick  = () => { overlay.remove(); resolve(false); };
      overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
    });
  };
})();
