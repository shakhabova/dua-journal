import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkTheme = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkTheme.set(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkTheme.set(prefersDark);
    }
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkTheme.update(val => !val);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkTheme() ? 'dark' : 'light');
    }
    this.applyTheme();
  }

  private applyTheme() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.isDarkTheme()) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
