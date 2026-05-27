// goi api tu - thay vi moi lan goi phai viet code nhet Token vao Header
// -> Interceptor tu dong tom lay moi request de dan Token do vao Header
// Request binh thuong -> Interceptor (kep them token) -> Server

import { inject } from "@angular/core"
import { AuthService } from "../services/auth.service"
import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const token = authService.getToken();

    // clone request de gan header authentication
    let authReq = req;
    // neu co token -> clone request cu + gan them header authorization
    if (token) {
        authReq = req.clone({
            withCredentials: true
            // setHeaders: {
            //     Authorization: `Bearer ${token}` // bear token
            // }
        });
        // cho phep request (da them token vao header) di tiep
        // return next(cloneReq);
    }

    // xu ly Request -> Response
    // pipe() la  duong ong xu ly du lieu (or loi) tra ve tu Server
    return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
            // neu server tra ve loi 401 Unauthorized
            // -> token da het han hoac sai
            if (err.status === 401) {
                // goi ham logout de xoa token trong localStorage
                authService.logout();
                // chuyen huong ve trang login
                router.navigate(['/auth/login']);
            }

            // neu loi ra ngoai de Component van biet co loi xay ra
            return throwError(() => err);
        })
    );

    // neu ko co token -> van de request di tiep
    // return next(req);
};