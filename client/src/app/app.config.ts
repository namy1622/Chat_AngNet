import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LucideAngularModule, Edit, Search, Paperclip, Send, Phone, Info, MoreVertical, Plus, ArrowLeft, Check, CheckCheck } from 'lucide-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
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
        CheckCheck
      })
    )
  ]
};

