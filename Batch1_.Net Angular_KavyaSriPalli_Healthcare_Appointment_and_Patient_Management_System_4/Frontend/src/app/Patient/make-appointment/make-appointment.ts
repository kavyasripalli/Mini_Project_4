import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReadDoctorDto } from '../../dtos/doctor/read-doctor.dto';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-make-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './make-appointment.html',
  styleUrl: './make-appointment.css',
})
export class MakeAppointment implements OnInit {
  doctors: ReadDoctorDto[] = [];
  loading = false;
  message = "";
  patientName = "";

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  form = this.fb.group({
    patientId: [0, [Validators.required, Validators.min(1)]],
    doctorId: [0, [Validators.required, Validators.min(1)]],
    appointmentDate: ['', Validators.required]
  });

  ngOnInit(): void {
    this.api.getDoctors().subscribe(res => this.doctors = res);
    this.identifyPatient();
  }

  identifyPatient(): void {
    const user: any = this.auth.currentUser;
    const name = (user?.userName || user?.username || user?.name || '').trim();
    
    if (name) {
      this.patientName = name;
      // Try cache first
      const cached = this.api.getPatientFromCache(name);
      if (cached) {
        this.form.patchValue({ patientId: cached.id });
      } else {
        // Fetch if not in cache
        this.api.getPatientByName(name).subscribe(p => {
          if (p) {
            this.form.patchValue({ patientId: p.id });
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.message = '';

    this.api.createAppointment({
      patientId: Number(this.form.value.patientId),
      doctorId: Number(this.form.value.doctorId),
      appointmentDate: this.form.value.appointmentDate ?? '',
    }).subscribe({
      next: () => {
        this.message = "✅ Appointment booked successfully!";
        this.loading = false;
        const currentPatientId = this.form.value.patientId;
        this.form.reset();
        this.form.patchValue({ patientId: currentPatientId });
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err?.error?.error || 'Booking failed';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
