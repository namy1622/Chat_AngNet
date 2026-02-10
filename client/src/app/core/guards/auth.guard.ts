import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

// Chot chan bao ve web
// neu chua Login ma URL van co tinh vao Chat 
// -> Guard se chan lai va chuyen ve trang Login
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // check da Login chua
  if (authService.isLoggedIn()) {
    return true; // cho phep vo
  }
  // neu chua -> chuyen ve Login
  return router.createUrlTree(['auth/login']);
};
