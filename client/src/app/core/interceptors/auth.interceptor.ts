// goi api tu - thay vi moi lan goi phai viet code nhet Token vao Header
// -> Interceptor tu dong tom lay moi request de dan Token do vao Header
// Request binh thuong -> Interceptor (kep them token) -> Server

import { inject } from "@angular/core"
import { AuthService } from "../services/auth.service"
import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService)
    const token = authService.getToken();

    // neu co token -> clone request cu + gan them header authorization
    if (token) {
        const cloneReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}` // bear token
            }
        });
        // cho phep request (da them token vao header) di tiep
        return next(cloneReq);
    }

    // neu ko co token -> van de request di tiep
    return next(req);
};