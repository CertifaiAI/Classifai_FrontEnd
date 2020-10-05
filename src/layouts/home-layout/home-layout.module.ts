import { CommonModule } from '@angular/common';
import { HomeCardComponent } from './home-card/home-card.component';
import { HomeContentComponent } from 'src/app/home-content/home-content.component';
import { HomeHeaderComponent } from './home-header/home-header.component';
import { HomeLayoutComponent } from './home-layout.component';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule],
    declarations: [HomeLayoutComponent, HomeHeaderComponent, HomeCardComponent, HomeContentComponent],
    // providers: [TranslateService],
})
export class HomeLayoutModule {}
