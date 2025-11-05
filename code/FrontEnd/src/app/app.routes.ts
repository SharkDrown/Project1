import { Routes } from '@angular/router';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchComponent } from './pages/search/search.component';
import { HistoryComponent } from './pages/history/history.component';
import { ReserveComponent } from './pages/reserve/reserve.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ContactComponent } from './pages/contact/contact.component';
import { InfoComponent } from './pages/info/info.component';
import { ReviewComponent } from './pages/info/review/review.component';
import { SettingComponent } from './pages/info/setting/setting.component';
import { ContentComponent } from './pages/info/content/content.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import {LoginGuard} from './guards/login.guard'

export const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [

      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'search', component: SearchComponent },
      // ✅ các trang yêu cầu đăng nhập
      { path: 'reserve', component: ReserveComponent, canActivate: [UserGuard] },
      { path: 'history', component: HistoryComponent, canActivate: [UserGuard] },
      { path: 'reports', component: ReportsComponent, canActivate: [UserGuard] },
      { path: 'contact', component: ContactComponent },

      // ✅ load lazy cho register & login
      {
        path: 'register',
        canActivate: [LoginGuard],
        loadComponent: () =>
          import('./pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'login',
        canActivate: [LoginGuard],
        loadComponent: () =>
          import('./pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'info',
        component: InfoComponent, canActivate: [UserGuard],
        children: [
          { path: '', component: ContentComponent },
          { path: 'review', component: ReviewComponent },
          { path: 'setting', component: SettingComponent }
        ]
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin-pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'admin/books',
        loadComponent: () =>
          import('./admin-pages/books/books.component').then(
            (m) => m.BooksComponent
          ),
      },
      {
        path: 'admin/accounts',
        loadComponent: () =>
          import('./admin-pages/accounts/accounts.component').then(
            (m) => m.AccountsComponent
          ),
      },
    ],
  },
];
