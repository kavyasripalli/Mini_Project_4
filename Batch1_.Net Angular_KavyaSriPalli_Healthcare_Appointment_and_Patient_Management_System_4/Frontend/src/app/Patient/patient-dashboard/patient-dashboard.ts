import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink,RouterLinkActive, RouterOutlet],
  templateUrl: './patient-dashboard.html',
  styleUrl: './patient-dashboard.css',
})
export class PatientDashboard implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.warmUp(['appointments', 'doctors', 'patients']);
  }

  navItems = [
    { label: 'Profile', path: '/Patient/view-profile' },
    { label: 'Add Patient', path: '/Patient/add-patient' },
    { label: 'Book Appointment', path: '/Patient/make-appointment' },
    { label: 'My Appointments', path: '/Patient/view-appointments' },
  ];

  get user() {
    return this.auth.currentUser;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/User/login']);
  }
}