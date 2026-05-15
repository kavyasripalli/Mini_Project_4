import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-add-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,],
  templateUrl: './add-doctor.html',
  styleUrl: './add-doctor.css',
})
export class AddDoctor implements OnInit {
  public loading = false;
  public message = '';

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  public auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  

  public form = this.fb.group({
    name: ['', Validators.required],
    specialization: ['', Validators.required],
    availableFrom: ['', Validators.required],
    availableTo: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const user: any = this.auth.currentUser;
    const name = (user?.userName || user?.username || user?.name || '').trim();
    if (name && this.auth.role === 'Doctor') {
      this.form.patchValue({ name: name });
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.message = '';

    const payload = this.form.getRawValue();
    this.api.createDoctor(payload as any).subscribe({
      next: () => {
        this.message = '✅ Professional Profile Created successfully!';
        this.loading = false;
        this.form.reset();
        this.cdr.detectChanges();
        // Redirect after delay
        setTimeout(() => this.router.navigate(['/Doctor/doctor-dashboard']), 2000);
        this.router.navigate(['/Doctor/view-profile']);
      },
      error: (err) => {
        this.message = err?.error?.error || 'Creation failed.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
