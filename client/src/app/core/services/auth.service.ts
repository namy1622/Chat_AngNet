// xu ly api va luu Token
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root' // service nay auto co mat tren toan bo app
})
export class AuthService {
  // inject(): cach moi thay vi constructor (private http: HttpClient)
  private http = inject(HttpClient)
  private router = inject(Router);

  // BehaviorSubject: bien giu gia tri User hien tai.
  // Null = chua login || co gia tri = da login
  // no dac biet o cho: Coponent nao subcribe no se nhan duoc gia tri moi nhat ngay lap tuc
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Observable de cac component lang nghe thay doi User
  // public ra ngoai duoi dang Observable (chi de doc, KO duoc sua truc tiep)
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // khi F5 lai trang -> app chay vao day dau tien.
    // logic: kiem tra localstorage co luu user chua?
    //      neu co -> vao if -> parse json -> next() -> update lai currentUserSubject
    //      neu khong -> bo qua if -> currentUserSubject van la null
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // -- api calls --

  // register
  register(data: any): Observable<AuthResponse> {
    // api post toi BE
    return this.http.post<AuthResponse>('/api/auth/register', data).pipe(tap(response => {
      // neu thanh cong -> xu ly luu token va user
      this.handleAuthSuccess(response);
    })
    );
  }

  // login
  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', data).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      })
    );
  }

  //logout
  logout() {
    // 1. xoa sach data trong localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // 2. bao cho app biet User la null (dang xuat)
    this.currentUserSubject.next(null);

    // 3. chuyen huong ve trang login
    this.router.navigate(['/auth/login']);
  }

  //--- header methods ---

  private handleAuthSuccess(response: AuthResponse) {
    // server tra ve {user, token}
    // 1. luu token (most important) vao localStorage de dung cho request sau
    localStorage.setItem('token', response.token);

    // 2. luu user vao currentUserSubject de hien thi ten, avatar,... trong Component
    localStorage.setItem('user', JSON.stringify(response.user));

    // 3. phat tin hieu cho toan bo app: "Co User moi dang nhap ne :3"
    this.currentUserSubject.next(response.user);
  }

  // lay token hien tai (ham nay dung trong Interceptor - đánh chặn)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // kiem tra xem co dang login ko (true/false)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // meo convert string -> boolean
  }
}
