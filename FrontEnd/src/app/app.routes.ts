import { Routes } from '@angular/router';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchComponent } from './pages/search/search.component';
import { ReserveComponent } from './pages/reserve/reserve.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { InfoComponent } from './pages/info/info.component';
import { ReviewComponent } from './pages/info/review/review.component';
import { SettingComponent } from './pages/info/setting/setting.component';
import { HistoryComponent } from './pages/history/history.component';
import { ContentComponent } from './pages/info/content/content.component';

export const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'search', component: SearchComponent },
      { path: 'reserve', component: ReserveComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'info',
        component: InfoComponent,
        children: [
          { path: '', component: ContentComponent },
          { path: 'review', component: ReviewComponent },
          { path: 'setting', component: SettingComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
