import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ReadPatientDto } from '../../dtos/patient/read-patient.dto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-patients',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './view-patients.html',
  styleUrl: './view-patients.css',
})
export class ViewPatients implements OnInit {
  patients: ReadPatientDto[] = [];
  filteredPatients: ReadPatientDto[] = [];
  loading = false;
  message = '';
  searchTerm = '';

  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.api.getPatients(true).subscribe({
      next: res => {
        this.patients = res;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.message = 'Error loading patients list.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredPatients = [...this.patients];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredPatients = this.patients.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.email.toLowerCase().includes(term) ||
        p.phoneNumber.includes(term)
      );
    }
    this.cdr.detectChanges();
  }

  deletePatient(id: number): void {
    if (!confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) return;

    this.api.deletePatient(id).subscribe({
      next: () => {
        this.message = '✅ Patient deleted successfully.';
        this.loadPatients();
      },
      error: err => {
        this.message = err?.error?.error || 'Delete failed.';
        this.cdr.detectChanges();
      }
    });
  }
}
