import { Routes } from '@angular/router';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchComponent } from './pages/search/search.component';
import { HistoryComponent } from './pages/history/history.component';
import { ReserveComponent } from './pages/reserve/reserve.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ContactComponent } from './pages/contact/contact.component';
import { InfoComponent } from './pages/info/info.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ReviewComponent } from './pages/info/review/review.component';
import { SettingComponent } from './pages/info/setting/setting.component';
import { ContentComponent } from './pages/info/content/content.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: UserLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
      { path: 'search', component: SearchComponent },
      // ✅ các trang yêu cầu đăng nhập
      { path: 'reserve', component: ReserveComponent, canActivate: [AuthGuard] },
      { path: 'history', component: HistoryComponent, canActivate: [AuthGuard] },
      { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
      // { path: 'login', component: LoginComponent },
      // { path: 'register', component: RegisterComponent },

      { path: 'contact', component: ContactComponent },

      // ✅ load lazy cho register & login
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'info',
        component: InfoComponent, canActivate: [AuthGuard],
        children: [
          { path: '', component: ContentComponent },
          { path: 'review', component: ReviewComponent },
          { path: 'setting', component: SettingComponent }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }

 
  // {
  //   path: 'admin',
  //   component: AdminLayoutComponent,
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () =>
  //         import('./pages/admin/dashboard/dashboard.component').then(
  //           (m) => m.DashboardComponent
  //         ),
  //     },
  //     {
  //       path: 'users',
  //       loadComponent: () =>
  //         import('./pages/admin/users/users.component').then(
  //           (m) => m.UsersComponent
  //         ),
  //     },
  //   ],
  // },
];
