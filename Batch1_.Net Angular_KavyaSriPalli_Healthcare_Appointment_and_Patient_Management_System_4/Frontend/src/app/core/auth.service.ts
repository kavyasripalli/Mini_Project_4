import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterUserDto } from '../dtos/auth/register-user.dto';
import { Observable, tap } from 'rxjs';
import { LoginResponseDto, ReadUserDto } from '../dtos/auth/login-response.dto';
import { environment } from '../../environments/environment';
import { LoginUserDto } from '../dtos/auth/login-user.dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey='healthcare_token';
  private userKey='healthcare_user';

  constructor(private http:HttpClient){}

  register(dto:RegisterUserDto):Observable<ReadUserDto>{
    return this.http.post<ReadUserDto>(`${environment.apiUrl}/user/register`,dto);
  }

  login(dto:LoginUserDto):Observable<LoginResponseDto>{
    return this.http.post<LoginResponseDto>(`${environment.apiUrl}/user/login`,dto).pipe(
      tap(res=>{
        localStorage.setItem(this.tokenKey,res.token);
        localStorage.setItem(this.userKey,JSON.stringify(res.user));
      })
    );
  }

  logout():void{
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  get token():string | null{
    return localStorage.getItem(this.tokenKey);
  }

  get currentUser(): ReadUserDto | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  get role(): string | null {
    return this.currentUser?.role ?? null;
  }

  isLoggedIn():boolean{
    return !!this.token;
  }

  hasAnyRole(roles:string[]):boolean{
    return !!this.role && roles.includes(this.role);
  }
}
