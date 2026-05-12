import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LucideAngularModule, Edit, Search, Paperclip, Send, Phone, Info, MoreVertical, Plus, ArrowLeft, Check, CheckCheck, Menu, LogOut, Users, X, UserPlus, MessageCircle, UserMinus, User, Inbox, CornerUpLeft, Smile } from 'lucide-angular';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // cung cap httpClient va gan Interceptor 
    provideHttpClient(withInterceptors([authInterceptor])),
    // Đăng ký các icons Lucide sẽ sử dụng trong app
    importProvidersFrom(
      LucideAngularModule.pick({
        Edit,
        Search,
        Paperclip,
        Send,
        Phone,
        Info,
        MoreVertical,
        Plus,
        ArrowLeft,
        Check,
        CheckCheck,
        Menu,
        LogOut,
        Users,
        X,
        UserPlus,
        MessageCircle,
        UserMinus,
        User,
        Inbox,
        CornerUpLeft,
        Smile
      })
    )
  ]
};

