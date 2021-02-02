import { CommonModule } from '@angular/common';
import { HomeCardComponent } from 'src/components/home/home-card/home-card.component';
import { HomeContentComponent } from 'src/components/home/home-content/home-content.component';
import { HomeHeaderComponent } from 'src/components/home/home-header/home-header.component';
import { HomeLayoutComponent } from './home-layout.component';
import { ModalModule } from 'src/components/modal/modal.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule, ModalModule, RouterModule],
    declarations: [HomeLayoutComponent, HomeHeaderComponent, HomeCardComponent, HomeContentComponent],
    // providers: [TranslateService],
})
export class HomeLayoutModule {}
