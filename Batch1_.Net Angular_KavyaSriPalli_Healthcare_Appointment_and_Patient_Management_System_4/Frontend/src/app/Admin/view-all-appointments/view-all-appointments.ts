import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ReadAppointmentDto } from '../../dtos/appointment/read-appointment.dto';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-all-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-all-appointments.html',
  styleUrl: './view-all-appointments.css',
})
export class ViewAllAppointments implements OnInit {
  private api = inject(ApiService);

  appointments: ReadAppointmentDto[] = [];
  filteredAppointments: ReadAppointmentDto[] = [];
  doctorsMap = new Map<number, string>();
  patientsMap = new Map<number, string>();
  loading = false;
  message = '';
  searchTerm = '';

  ngOnInit(): void {
    this.api.getDoctors().subscribe(docs => {
      docs?.forEach(d => this.doctorsMap.set(d.id, d.name));
    });
    this.api.getPatients().subscribe(pts => {
      pts?.forEach(p => this.patientsMap.set(p.id, p.name));
    });
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.message = '';

    this.api.getAppointments()
      .subscribe({
        next: (res) => {
          this.appointments = res;
          this.applyFilter();
          this.loading = false;
        },
        error: (err) => {
          this.message = err?.error?.error || err?.message || 'Unable to load appointments';
          this.loading = false;
        }
      });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredAppointments = [...this.appointments];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredAppointments = this.appointments.filter(a => {
        const dName = (this.doctorsMap.get(a.doctorId) || '').toLowerCase();
        const pName = (this.patientsMap.get(a.patientId) || '').toLowerCase();
        return dName.includes(term) || pName.includes(term) || a.id.toString().includes(term) || a.status.toLowerCase().includes(term);
      });
    }
  }

  completeAppointment(id: number): void {
    this.api.completeAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => this.message = err?.error?.error || 'Failed to complete appointment'
    });
  }

  cancelAppointment(id: number): void {
    this.api.cancelAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => this.message = err?.error?.error || 'Failed to cancel appointment'
    });
  }

  deleteAppointment(id: number): void {
    if (!confirm('Delete this appointment?')) return;
    this.api.deleteAppointment(id).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => this.message = err?.error?.error || 'Failed to delete appointment'
    });
  }
}