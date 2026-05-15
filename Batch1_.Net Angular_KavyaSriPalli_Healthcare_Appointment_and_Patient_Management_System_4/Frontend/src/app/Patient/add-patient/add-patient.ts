import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-patient.html',
  styleUrl: './add-patient.css',
})
export class AddPatient implements OnInit {
  public loading = false;
  public message = '';

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  public auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public form = this.fb.group({
    name: ['', Validators.required],
    age: [0, [Validators.required, Validators.min(0), Validators.max(120)]],
    gender: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const user: any = this.auth.currentUser;
    const name = (user?.userName || user?.username || user?.name || '').trim();
    if (name && this.auth.role === 'Patient') {
      this.form.patchValue({ name: name });
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.message = '';

    const payload = this.form.getRawValue();
    this.api.createPatient(payload as any).subscribe({
      next: () => {
        this.message = '✅ Profile Created successfully!';
        this.loading = false;
        this.form.reset();
        this.cdr.detectChanges();
        // Redirect to dashboard or profile after a short delay
        setTimeout(() => this.router.navigate(['/Patient/patient-dashboard']), 2000);
      },
      error: (err) => {
        this.message = err?.error?.error || 'Creation failed.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
