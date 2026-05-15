import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ReadDoctorDto } from '../../dtos/doctor/read-doctor.dto';


import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-doctors',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './view-doctors.html',
  styleUrl: './view-doctors.css',
})
export class ViewDoctors implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  doctors: ReadDoctorDto[] = [];
  filteredDoctors: ReadDoctorDto[] = [];
  loading = false;
  message = '';
  searchTerm = '';

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.message = '';

    this.api.getDoctors()
      .subscribe({
        next: res => {
          this.doctors = res;
          this.applyFilter();
          this.loading = false;
        },
        error: err => {
          this.message = err?.error?.error || err?.message || 'Unable to load doctors';
          this.loading = false;
        }
      });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredDoctors = [...this.doctors];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDoctors = this.doctors.filter(d => 
        d.name.toLowerCase().includes(term) || 
        d.specialization.toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term)
      );
    }
  }

  editDoctor(id: number): void {
    this.router.navigate(['/Doctor/update-doctor'], { queryParams: { id } });
  }

  deleteDoctor(id: number): void {
    if (!confirm('Delete this doctor record?')) return;
    this.api.deleteDoctor(id).subscribe({
      next: () => {
        this.message = '✅ Staff record removed.';
        this.loadDoctors();
      },
      error: err => this.message = err?.error?.error || 'Failed to delete doctor'
    });
  }

}