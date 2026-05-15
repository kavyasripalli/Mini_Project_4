import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ReadAppointmentDto } from '../../dtos/appointment/read-appointment.dto';
import { ApiService } from '../../core/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-view-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-appointments.html',
  styleUrl: './view-appointments.css',
})
export class PatientViewAppointments implements OnInit, OnDestroy {
  filtered: ReadAppointmentDto[] = [];
  loading = false;
  message = '';
  doctorsMap = new Map<number, string>();
  currentPatientId = 0;

  private sub = new Subscription();
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loading = true;
    
    // Load doctors for mapping names
    this.api.getDoctors().subscribe(docs => {
      docs?.forEach(d => this.doctorsMap.set(d.id, d.name));
      this.cdr.detectChanges();
    });

    const user: any = this.auth.currentUser;
    const name = (user?.userName || user?.username || user?.name || '').trim();

    if (name) {
      // Step 1: Reactive Appointment Listener (Instant load if in cache)
      this.sub.add(
        this.api.appointments$.subscribe(all => {
          if (this.currentPatientId) {
            this.filterAndDisplay(all);
          }
        })
      );

      // Step 2: Identify Patient ID
      this.identifyPatient(name);
    } else {
      this.message = '⚠️ User session not found. Please log in again.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private identifyPatient(name: string): void {
    // Check cache first
    const cached = this.api.getPatientFromCache(name);
    if (cached) {
      this.currentPatientId = cached.id;
      this.loadAppointments();
      return;
    }

    // Direct name lookup
    this.api.getPatientByName(name).subscribe({
      next: p => {
        if (p) {
          this.currentPatientId = p.id;
          this.loadAppointments();
        } else {
          this.fetchFromList(name);
        }
      },
      error: () => this.fetchFromList(name)
    });
  }

  private fetchFromList(name: string): void {
    this.api.getPatients().subscribe({
      next: pts => {
        const match = pts?.find(p => p.name.trim().toLowerCase() === name.toLowerCase());
        if (match) {
          this.currentPatientId = match.id;
          this.loadAppointments();
        } else {
          this.message = '⚠️ No patient profile found for this account.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.message = '⚠️ Error connecting to patient service.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAppointments(): void {
    if (!this.currentPatientId) return;

    // Trigger background fetch (updates the appointments$ subject)
    this.api.getAppointments().subscribe({
      next: res => {
        this.filterAndDisplay(res);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = err?.error?.error || 'Unable to load appointments';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private filterAndDisplay(all: ReadAppointmentDto[]): void {
    this.filtered = all.filter(x => x.patientId === this.currentPatientId);
    if (this.filtered.length === 0) {
      this.message = '📅 No appointments scheduled yet.';
    } else {
      this.message = '';
    }
    this.cdr.detectChanges();
  }

  cancel(id: number): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    this.loading = true;
    this.api.cancelAppointment(id).subscribe({
      next: () => {
        this.message = '✅ Appointment cancelled successfully.';
        this.loadAppointments();
      },
      error: err => {
        this.message = err?.error?.error || 'Cancel failed';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackById(_: number, item: ReadAppointmentDto): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
