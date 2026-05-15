import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ReadAppointmentDto } from '../../dtos/appointment/read-appointment.dto';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-doctor-view-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-appointments.html',
  styleUrl: './view-appointments.css',
})
export class DoctorViewAppointments implements OnInit {
  all: ReadAppointmentDto[] = [];
  filtered: ReadAppointmentDto[] = [];
  message = '';
  patientsMap = new Map<number, string>();
  currentDoctorId = 0;
  loading = false;

  private api = inject(ApiService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const user: any = this.auth.currentUser;
    const name = user?.userName || user?.username || user?.name;

    this.api.getPatients().subscribe(pts => {
      pts?.forEach(p => this.patientsMap.set(p.id, p.name));
      this.cdr.detectChanges();
    });

    if (name) {
      this.api.getDoctors().subscribe({
        next: docs => {
          const match = docs?.find(d => d.name.toLowerCase() === name.toLowerCase());
          if (match) {
            this.currentDoctorId = match.id;
            this.load();
          } else {
            this.message = 'Doctor profile not found for user: ' + name;
          }
          this.cdr.detectChanges();
        },
        error: err => {
          this.message = 'Unable to load doctors list';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.message = 'User information not found in session.';
    }
  }

  load(): void {
    if (!this.currentDoctorId) return;
    this.loading = true;

    this.api.getAppointments().subscribe({
      next: res => {
        this.all = res;
        this.filtered = res.filter(x => x.doctorId == this.currentDoctorId);
        this.message = this.filtered.length ? '' : 'No appointment found';
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

  complete(id:number):void{
    this.api.completeAppointment(id).subscribe({
      next:()=>this.load(),
      error:err=>this.message=err?.error?.error||'Complete failed'
    });
  }

  cancel(id:number):void{
    this.api.cancelAppointment(id).subscribe({
      next:()=>this.load(),
      error:err=>this.message=err?.error?.error || 'Cancel failed'
    });
  }

  trackById(_: number, item: ReadAppointmentDto): number {
    return item.id;
  }
}
