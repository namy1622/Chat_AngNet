import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent, // layout bao boc (nen xam)
        children: [

            // ====== Các trang xác thực ======
            {
                path: 'auth', // url bat dau bang /auth/...
                component: AuthLayoutComponent, // dung layout auth (nen xam)
                children:

                    [
                        {
                            path: 'login',
                            // lazy load component (tai sau de nhe web)
                            loadComponent: () => import('./features/auth/login/login.component')
                                .then(m => m.LoginComponent)
                        },
                        {
                            path: 'forgot-password',
                            loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
                                .then(m => m.ForgotPasswordComponent)
                        },
                        {
                            path: 'register',
                            loadComponent: () => import('./features/auth/register/register.component')
                                .then(m => m.RegisterComponent)
                        },
                        // neu vao trang chu '', chuyen huong den auth/login (tam thoi)
                        {
                            path: '',
                            redirectTo: 'login', pathMatch: 'full'
                        },
                    ]
            },
            //===============================

            // ====== Các trang chính - Đã đăng nhập ======
            {
                path: '', // url goc (localhost:...)
                loadComponent: () => import('./layout/main-layout/main-layout.component')
                    .then(m => m.MainLayoutComponent),
                children: [
                    // route cho tung cuc hoi thoai: /c/abc123
                    {
                        path: 'c/:id', // :id la tham so dong (dynamic)
                        loadComponent: () => import('./features/chat/chat-window/chat-window.component')
                            .then(m => m.ChatWindowComponent)
                    },
                    // route trang mac dinh khi chua chon chat nao
                    {
                        path: '',
                        loadComponent: () => import('./features/chat/chat-window/chat-window.component')
                            .then(m => m.ChatWindowComponent)
                    }
                ]
            }

            //===============================
        ]
    }
];

/*
    === ly thuyet ===

1. lazy loading (loadComponent)
    - thay vi tai all code tu dau, thi chi tai component khi user thuc su can
    - giup web nhanh hon, dac biet app lon

2. Router parameter (:id)
    - ky hieu :id la tham so dong (dynamic)
    - ex: 
        - khi user click vao link /c/abc123, thi id = 'abc123'
        - khi user click vao link /c/xyz789, thi id = 'xyz789'

3. children routes:
    - cac route con se hien thi ben trong <router-outlet> cua component cha
    - authLayout chua login/register. mainlayout chua chatWindow 

4. pathMatch: 'full'
    - chi redirect khi URL khop hoan toan voi path rong.
    - tranh redirect nham khi url chi bat dau bang '' (tuc la moi URL)

*/


