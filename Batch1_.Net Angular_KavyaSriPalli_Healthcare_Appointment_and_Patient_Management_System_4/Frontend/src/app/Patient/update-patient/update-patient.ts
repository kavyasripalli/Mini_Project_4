import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { UpdatePatientDto } from '../../dtos/patient/update-patient.dto';

@Component({
  selector: 'app-update-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-patient.html',
  styleUrl: './update-patient.css',
})
export class UpdatePatient implements OnInit, OnDestroy {
  public loading = false;
  public message = '';
  public patientId: number | null = null;
  public patientName = '';
  public patientGender = '';
  public patientEmail = '';

  private sub = new Subscription();
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  public auth = inject(AuthService);
  public route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  // Form ONLY contains fields from UpdatePatientDto
  public form = this.fb.group({
    age: [0, [Validators.required, Validators.min(0), Validators.max(120)]],
    phoneNumber: ['', Validators.required]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('id');
    console.log('[UpdateDebug] Init. idParam from URL:', idParam);

    if (idParam) {
      this.patientId = Number(idParam);
      console.log('[UpdateDebug] Loading via explicit ID:', this.patientId);
      this.loadPatient(this.patientId);
    } else {
      console.log('[UpdateDebug] No ID in URL. Attempting identity auto-match...');
      this.identifyAndLoad();
    }
  }

  identifyAndLoad(): void {
    const user: any = this.auth.currentUser;
    const name = (user?.userName || user?.username || user?.name || '').trim();
    console.log('[UpdateDebug] Session identity name:', `"${name}"`);

    if (name) {
      // 1. Synchronous Cache Check
      const cached = this.api.getPatientFromCache(name);
      if (cached) {
        console.log('[UpdateDebug] Found in synchronous cache:', cached);
        this.setPatientData(cached);
        return;
      }

      // 2. Direct Name Lookup (Fast Fallback)
      this.loading = true;
      console.log('[UpdateDebug] Not in sync cache. Trying direct name lookup...');
      this.api.getPatientByName(name).subscribe({
        next: directMatch => {
          if (directMatch) {
            console.log('[UpdateDebug] Direct name lookup SUCCESS:', directMatch);
            this.setPatientData(directMatch);
            this.loading = false;
          } else {
            this.fetchFromList(name);
          }
        },
        error: () => this.fetchFromList(name)
      });
    } else {
      console.error('[UpdateDebug] No name found in session.');
    }
  }

  private fetchFromList(name: string): void {
    console.log('[UpdateDebug] Direct lookup failed. Fetching full list...');
    this.loading = true;
    this.api.getPatients().subscribe({
      next: pts => {
        console.log('[UpdateDebug] List fetch returned. Records:', pts?.length);
        const match = pts?.find(p => p.name.trim().toLowerCase() === name.toLowerCase());
        if (match) {
          console.log('[UpdateDebug] Match found in list fetch:', match);
          this.setPatientData(match);
        } else {
          console.warn('[UpdateDebug] No match found in system for name:', name);
          this.message = 'No profile found to update. Please create one first.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('[UpdateDebug] List fetch failed:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private setPatientData(p: any): void {
    console.log('[UpdateDebug] Setting form data for:', p.name);
    this.patientId = p.id;
    this.patientName = p.name;
    this.patientGender = p.gender;
    this.patientEmail = p.email;
    this.form.patchValue({
      age: p.age,
      phoneNumber: p.phoneNumber
    });
    this.loading = false;
    this.cdr.detectChanges();
  }

  loadPatient(id: number): void {
    this.loading = true;
    console.log('[UpdateDebug] Fetching by ID:', id);
    this.api.getPatientById(id).subscribe({
      next: p => {
        console.log('[UpdateDebug] GetById SUCCESS:', p);
        this.setPatientData(p);
        this.loading = false;
      },
      error: err => {
        console.error('[UpdateDebug] GetById FAILED:', err);
        this.message = 'Error loading patient data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    if (this.form.invalid || !this.patientId) return;

    this.loading = true;
    this.message = '';

    const payload: UpdatePatientDto = {
      age: Number(this.form.value.age),
      phoneNumber: this.form.value.phoneNumber ?? ''
    };

    this.api.updatePatient(this.patientId, payload).subscribe({
      next: () => {
        this.message = '✅ Profile updated successfully!';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message = err?.error?.error || 'Update failed.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
