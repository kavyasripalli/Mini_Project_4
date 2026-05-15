import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.warmUp(['appointments', 'doctors', 'patients']);
  }

  navItems = [
    { label: 'Doctors', path: '/Admin/view-doctors' },

    { label: 'Appointments', path: '/Admin/view-all-appointments' },
    { label: 'Patients', path: '/Admin/view-patients' },
  ];

  get user() {
    return this.auth.currentUser;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/User/login']);
  }
}