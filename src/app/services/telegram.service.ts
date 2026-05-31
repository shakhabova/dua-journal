import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TelegramService {
    public isTelegramMiniApp(): boolean {
        if (typeof window === 'undefined') return false;
        const tg = (window as any).Telegram?.WebApp;
        return !!(tg?.initData && tg.initData.length > 0);
    }
}
