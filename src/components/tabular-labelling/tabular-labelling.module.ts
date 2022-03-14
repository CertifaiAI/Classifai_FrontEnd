import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { TabularLabellingLeftSidebarComponent } from './tabular-labelling-left-sidebar/tabular-labelling-left-sidebar.component';
import { TabularLabellingFooterComponent } from './tabular-labelling-footer/tabular-labelling-footer.component';
import { TabularLabellingRightSidebarComponent } from './tabular-labelling-right-sidebar/tabular-labelling-right-sidebar.component';
import { TabularLabellingProjectComponent } from './tabular-labelling-project/tabular-labelling-project.component';
import { TabularLabellingInfoComponent } from './tabular-labelling-info/tabular-labelling-info.component';
import { TabularLabellingSideMenuComponent } from './tabular-labelling-sidemenu/tabular-labelling-side-menu.component';

@NgModule({
    imports: [CommonModule, SharedModule, TranslateModule],
    declarations: [
        TabularLabellingLeftSidebarComponent,
        TabularLabellingRightSidebarComponent,
        TabularLabellingFooterComponent,
        TabularLabellingProjectComponent,
        TabularLabellingInfoComponent,
        TabularLabellingSideMenuComponent,
    ],
    exports: [
        TabularLabellingLeftSidebarComponent,
        TabularLabellingRightSidebarComponent,
        TabularLabellingFooterComponent,
        TabularLabellingProjectComponent,
        TabularLabellingInfoComponent,
        TabularLabellingSideMenuComponent,
    ],
})
export class TabularLabellingModule {}
