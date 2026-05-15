import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ReadDoctorDto } from '../../dtos/doctor/read-doctor.dto';

@Component({
  selector: 'app-update-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-doctor.html',
  styleUrl: './update-doctor.css',
})
export class UpdateDoctor implements OnInit, OnDestroy {
  public loading = false;
  public message = '';
  public doctorId: number | null = null;
  public doctorName = '';

  private sub = new Subscription();
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  public auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private router=inject(Router);

  public form = this.fb.group({
    specialization: ['', Validators.required],
    availableFrom: ['', Validators.required],
    availableTo: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      this.doctorId = Number(idParam);
      this.loadDoctor(this.doctorId);
    } else {
      this.identifyAndLoad();
    }
  }

  identifyAndLoad(): void {
    const user: any = this.auth.currentUser;
    const name = (user?.userName || user?.username || user?.name || '').trim();

    if (name) {
      // 1. Synchronous Cache Check
      const cached = this.api.getDoctorFromCache(name);
      if (cached) {
        this.setDoctorData(cached);
        return;
      }

      // 2. Direct Name Lookup (Fast Fallback)
      this.loading = true;
      this.api.getDoctorByName(name).subscribe({
        next: directMatch => {
          if (directMatch) {
            this.setDoctorData(directMatch);
            this.loading = false;
          } else {
            this.fetchFromList(name);
          }
        },
        error: () => this.fetchFromList(name)
      });
    }
  }

  private fetchFromList(name: string): void {
    this.api.getDoctors().subscribe({
      next: docs => {
        const match = docs?.find(d => d.name.trim().toLowerCase() === name.toLowerCase());
        if (match) {
          this.setDoctorData(match);
        } else {
          this.message = 'No professional profile found to update.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private setDoctorData(d: any): void {
    this.doctorId = d.id;
    this.doctorName = d.name;
    this.form.patchValue({
      specialization: d.specialization,
      availableFrom: this.toLocalInput(d.availableFrom),
      availableTo: this.toLocalInput(d.availableTo),
      phoneNumber: d.phoneNumber,
      email: d.email
    });
    this.cdr.detectChanges();
  }

  loadDoctor(id: number): void {
    this.loading = true;
    this.api.getDoctorById(id).subscribe({
      next: d => {
        this.setDoctorData(d);
        this.loading = false;
      },
      error: () => {
        this.message = 'Error loading doctor data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    if (this.form.invalid || !this.doctorId) return;

    this.loading = true;
    this.message = '';

    const payload = this.form.getRawValue();

    this.api.updateDoctor(this.doctorId, payload as any).subscribe({
      next: () => {
        this.message = '✅ Professional details updated successfully!';
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/Doctor/view-profile']);
      },
      error: (err) => {
        this.message = err?.error?.error || 'Update failed.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private toLocalInput(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
