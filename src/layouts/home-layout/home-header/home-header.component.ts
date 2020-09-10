import { Component, OnInit } from '@angular/core';
import { LanguageService } from 'src/shared/services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.css'],
})
export class HomeHeaderComponent implements OnInit {
  languageArr: (string | RegExpMatchArray)[] = [];
  headerImage: string =
    '../../assets/classifai-home-layout/Classifai_PoweredBy_Horizontal_light.png';

  constructor(
    public _translate: TranslateService,
    private _languageService: LanguageService
  ) {
    const langsArr: string[] = ['landing-page-en', 'landing-page-cn'];
    this._languageService.initializeLanguage(`landing-page`, langsArr);

    this.languageArr = this._languageService.filterLanguageList(
      langsArr,
      'landing-page'
    );
  }

  ngOnInit() {}

  setLanguage(language: string) {
    try {
      language
        ? (this._languageService.setLanguageState(language),
          this._translate.use(language))
        : this._languageService.setLanguageState('en');
    } catch (err) {
      console.log(
        'setLanguage(language: string) ----> ',
        err.name + ': ',
        err.message
      );
    }
  }
}
