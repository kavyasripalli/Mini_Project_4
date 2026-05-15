import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, timeout, of, catchError } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { ReadDoctorDto } from '../../dtos/doctor/read-doctor.dto';

@Component({
  selector: 'app-doctor-view-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './view-profile.html',
  styleUrl: './view-profile.css',
})
export class DoctorViewProfile implements OnInit, OnDestroy {
  doctor: ReadDoctorDto | null = null;
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

    console.log('[ProfileDebug] Logged in user identity:', user);
    console.log('[ProfileDebug] Normalized name for lookup:', `"${name}"`);

    if (name) {
      // 1. Synchronous Cache Check
      const cached = this.api.getDoctorFromCache(name);
      if (cached) {
        console.log('[ProfileDebug] Found doctor in synchronous cache:', cached);
        this.doctor = cached;
        this.cdr.detectChanges();
        return;
      }

      // 2. Reactive Listener
      console.log('[ProfileDebug] Starting reactive listener for doctors$ subject...');
      this.sub.add(
        this.api.doctors$.subscribe(docs => {
          console.log('[ProfileDebug] Received update from doctors$ subject. Total records:', docs?.length);
          const match = docs?.find(d => d.name.trim().toLowerCase() === name.toLowerCase());
          if (match) {
            console.log('[ProfileDebug] Updating view with latest reactive data:', match);
            this.doctor = match;
            this.loading = false;
            this.showFallback = false;
            this.cdr.detectChanges();
          }
        })
      );

      this.fetchProfileFast(name);
    } else {
      console.error('[ProfileDebug] No name found in user session.');
      this.message = 'User identity not found. Please log in again.';
      this.cdr.detectChanges();
    }
  }

  fetchProfileFast(name: string): void {
    if (this.loading) return;
    this.loading = true;
    this.message = '';
    this.cdr.detectChanges();
    
    console.log('[ProfileDebug] Phase 1: Attempting direct name lookup (FAST)...');
    this.api.getDoctorByName(name).pipe(
      timeout(2500),
      catchError(err => {
        console.warn('[ProfileDebug] Phase 1 direct fetch failed or timed out:', err.message);
        return of(null);
      })
    ).subscribe(directMatch => {
      if (directMatch) {
        console.log('[ProfileDebug] Phase 1 direct fetch SUCCESS:', directMatch);
        this.doctor = directMatch;
        this.loading = false;
        this.showFallback = false;
        this.cdr.detectChanges();
        console.log('[ProfileDebug] State updated & CD triggered: doctor set, loading=false');
      } else {
        console.log('[ProfileDebug] Phase 2: Starting secondary list lookup...');
        this.api.getDoctors().pipe(
          timeout(5000),
          catchError(err => {
            console.error('[ProfileDebug] Phase 2 list fetch failed or timed out:', err.message);
            return of([]);
          })
        ).subscribe(docs => {
          if (!this.doctor) {
            console.log('[ProfileDebug] List fetch returned. Records found:', docs?.length);
            const match = docs?.find(d => d.name.trim().toLowerCase() === name.toLowerCase());
            if (match) {
              console.log('[ProfileDebug] Phase 2 match SUCCESS:', match);
              this.doctor = match;
            } else if (!this.searching) {
              console.warn('[ProfileDebug] No profile match found in system for:', name);
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
      if (!this.doctor) {
        console.log('[ProfileDebug] Auto-match still pending after 3s. Activating fallback UI.');
        this.showFallback = true;
        this.cdr.detectChanges();
      }
    }, 3000);
  }

  manualSearch(): void {
    const name = this.searchForm.value.name?.trim();
    if (!name) return;
    console.log('[ProfileDebug] Performing manual search for:', name);
    this.searching = true;
    this.fetchProfileFast(name);
    setTimeout(() => {
      this.searching = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    console.log('[ProfileDebug] Destroying ViewProfile component. Unsubscribing listeners.');
    this.sub.unsubscribe();
  }
}
