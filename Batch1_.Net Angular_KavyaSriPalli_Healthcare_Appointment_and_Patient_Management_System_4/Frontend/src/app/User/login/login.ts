import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loading=false;
  error='';

  private fb=inject(FormBuilder);
  private auth=inject(AuthService);
  private router=inject(Router);

  form=this.fb.group({
    userName:['',Validators.required],
    password:['',Validators.required]
  });

  submit():void{
    if(this.form.invalid) return;

    this.loading=true;
    this.error='';
    
    this.auth.login(this.form.getRawValue() as any).subscribe({
      next:(res)=>{
        const role=res.user.role;
        if(role==='Admin'){
          this.router.navigate(['/Admin']);
        }
        else if(role==='Doctor'){
          this.router.navigate(['/Doctor']);
        }
        else{
          this.router.navigate(['/Patient']);
        }
      },
      error: err=>{
        this.error=err?.error?.error||'Login failed';
        this.loading=false;
      }
    })
  }
  
}
