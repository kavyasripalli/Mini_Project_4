import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css',
})
export class DoctorDashboard implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.warmUp(['appointments', 'doctors']);
  }

  navItems = [
    {
      label: 'Profile',
      path: '/Doctor/view-profile',
    },
    {
      label: 'Add Doctor',
      path: '/Doctor/add-doctor',
    },
    {
      label: 'Appointments',
      path: '/Doctor/view-appointments',
    },
  ];

  get user() {
    return this.auth.currentUser;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/User/login']);
  }
}