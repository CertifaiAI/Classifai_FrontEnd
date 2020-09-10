import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from 'src/shared/services/theme.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Classifai';
  favIcon: HTMLLinkElement = document.querySelector('#favIcon');
  darkIcon: string = `../assets/Classifai_Favicon_Dark_32px.ico`;
  lightIcon: string = `../assets/Classifai_Favicon_Light_32px.ico`;

  constructor(private _themeService: ThemeService) {
    this._themeService.setThemeState();
    this._themeService.getThemeState() === 'light-theme'
      ? (this.favIcon.href = this.lightIcon)
      : (this.favIcon.href = this.darkIcon);
  }
  ngOnInit(): void {
    window
      .matchMedia('(prefers-color-scheme: light)')
      .addEventListener('change', this.detectBrowserTheme, false);
  }
  detectBrowserTheme = (e: MediaQueryListEvent): void => {
    this._themeService.setThemeState();
    this.favIcon.href = e.matches ? this.darkIcon : this.lightIcon;
  };

  /** @callback method used by Angular to clean up eventListener after comp. is destroyed */
  ngOnDestroy(): void {
    window.removeEventListener(
      '(prefers-color-scheme: light)',
      this.detectBrowserTheme,
      false
    );
  }
}
