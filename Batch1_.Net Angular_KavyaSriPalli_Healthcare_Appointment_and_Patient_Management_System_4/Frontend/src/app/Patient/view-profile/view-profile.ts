import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, timeout, of, catchError } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ReadPatientDto } from '../../dtos/patient/read-patient.dto';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-patient-view-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './view-profile.html',
  styleUrl: './view-profile.css',
})
export class PatientViewProfile implements OnInit, OnDestroy {
  patient: ReadPatientDto | null = null;
  loading = false;
  searching = false;
  message = '';
  showFallback = false;

  private sub = new Subscription();
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  searchForm = this.fb.group({
    name: ['', Validators.required]
  });

  ngOnInit(): void {
    const user: any = this.auth.currentUser;
    const name = (user?.userName || user?.username || user?.name || '').trim();


    if (name) {
      // 1. Check Synchronous Cache first (Immediate)
      const cached = this.api.getPatientFromCache(name);
      if (cached) {
        this.patient = cached;
        this.cdr.detectChanges();
        return;
      }

      // 2. Reactive Subscription for background updates
      this.sub.add(
        this.api.patients$.subscribe(pts => {
          const match = pts?.find(p => p.name.trim().toLowerCase() === name.toLowerCase());
          if (match) {
            this.patient = match;
            this.loading = false;
            this.showFallback = false;
            this.cdr.detectChanges();
          }
        })
      );

      this.fetchProfileFast(name);
    } else {
      this.message = 'User identity not found. Please log in again.';
      this.cdr.detectChanges();
    }
  }

  fetchProfileFast(name: string): void {
    if (this.loading) return;
    this.loading = true;
    this.message = '';
    this.cdr.detectChanges();

 
    this.api.getPatientByName(name).pipe(
      timeout(2500), 
      catchError(err => {
        return of(null);
      })
    ).subscribe(directMatch => {
      if (directMatch) {
        this.patient = directMatch;
        this.loading = false;
        this.showFallback = false;
        this.cdr.detectChanges();
      } else {
        this.api.getPatients().pipe(
          timeout(5000),
          catchError(err => {
            return of([]);
          })
        ).subscribe(pts => {
          if (!this.patient) {
            const match = pts?.find(p => p.name.trim().toLowerCase() === name.toLowerCase());
            if (match) {
              this.patient = match;
            } else if (!this.searching) {
              this.message = `Could not automatically find a profile for "${name}".`;
              this.showFallback = true;
            }
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });

    // UX Guard
    setTimeout(() => {
      if (!this.patient) {
        this.showFallback = true;
        this.cdr.detectChanges();
      }
    }, 3000);
  }

  manualSearch(): void {
    const name = this.searchForm.value.name?.trim();
    if (!name) return;
    this.searching = true;
    this.fetchProfileFast(name);
    setTimeout(() => {
      this.searching = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
