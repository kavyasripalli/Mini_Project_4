import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap, timeout, catchError, of, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

import { ReadUserDto } from '../dtos/auth/login-response.dto';
import { CreatePatientDto } from '../dtos/patient/create-patient.dto';
import { ReadPatientDto } from '../dtos/patient/read-patient.dto';
import { UpdatePatientDto } from '../dtos/patient/update-patient.dto';
import { CreateDoctorDto } from '../dtos/doctor/create-doctor.dto';
import { ReadDoctorDto } from '../dtos/doctor/read-doctor.dto';
import { UpdateDoctorDto } from '../dtos/doctor/update-doctor.dto';
import { CreateAppointmentDto } from '../dtos/appointment/create-appointment.dto';
import { ReadAppointmentDto } from '../dtos/appointment/read-appointment.dto';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private doctorsCache$?: Observable<ReadDoctorDto[]>;
  private appointmentsCache$?: Observable<ReadAppointmentDto[]>;
  private patientsCache$?: Observable<ReadPatientDto[]>;
  private usersCache$?: Observable<ReadUserDto[]>;

  // Per-ID caches
  private doctorByIdCache = new Map<number, Observable<ReadDoctorDto>>();
  private patientByIdCache = new Map<number, Observable<ReadPatientDto>>();

  // Latest lists for synchronous and reactive lookup
  private doctorsSubject = new BehaviorSubject<ReadDoctorDto[]>([]);
  private patientsSubject = new BehaviorSubject<ReadPatientDto[]>([]);
  private appointmentsSubject = new BehaviorSubject<ReadAppointmentDto[]>([]);

  doctors$ = this.doctorsSubject.asObservable();
  patients$ = this.patientsSubject.asObservable();
  appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // -------------------- WARM-UP (call from dashboards) --------------------
  /** Pre-fetch commonly needed lists in parallel so sub-pages load instantly. */
  warmUp(lists: ('doctors' | 'appointments' | 'patients')[]): void {
    if (lists.includes('doctors'))      this.getDoctors().subscribe();
    if (lists.includes('appointments')) this.getAppointments().subscribe();
    if (lists.includes('patients'))     this.getPatients().subscribe();
  }

  // -------------------- USER API --------------------
  getUsers(forceRefresh = false): Observable<ReadUserDto[]> {
    if (forceRefresh || !this.usersCache$) {
      this.usersCache$ = this.http
        .get<ReadUserDto[]>(`${environment.apiUrl}/user/Users`)
        .pipe(shareReplay(1));
    }
    return this.usersCache$;
  }

  getUserById(id: number): Observable<ReadUserDto> {
    return this.http.get<ReadUserDto>(`${environment.apiUrl}/user/User/${id}`);
  }

  deleteUser(id: number): Observable<void> {
    this.usersCache$ = undefined;
    return this.http.delete<void>(`${environment.apiUrl}/user/Delete/${id}`);
  }

  // -------------------- PATIENT API --------------------
  getPatients(forceRefresh = false): Observable<ReadPatientDto[]> {
    if (forceRefresh || !this.patientsCache$) {
      this.patientsCache$ = this.http
        .get<ReadPatientDto[]>(`${environment.apiUrl}/patient/Patients`)
        .pipe(
          timeout(10000),
          tap(patients => {
            this.patientsSubject.next(patients || []);
            // Populate per-ID cache
            patients?.forEach(p => {
              if (!this.patientByIdCache.has(p.id)) {
                this.patientByIdCache.set(
                  p.id,
                  of(p).pipe(shareReplay(1))
                );
              }
            });
          }),
          shareReplay(1),
          tap({ error: () => this.patientsCache$ = undefined })
        );
    }
    return this.patientsCache$;
  }

  getPatientById(id: number, forceRefresh = false): Observable<ReadPatientDto> {
    if (!forceRefresh && this.patientByIdCache.has(id)) {
      return this.patientByIdCache.get(id)!;
    }
    const req$ = this.http
      .get<ReadPatientDto>(`${environment.apiUrl}/patient/Patient/${id}`)
      .pipe(shareReplay(1));
    this.patientByIdCache.set(id, req$);
    return req$;
  }

  getPatientByName(name: string): Observable<ReadPatientDto> {
    return this.http.get<ReadPatientDto>(`${environment.apiUrl}/patient/Patientbyname/${encodeURIComponent(name)}`);
  }

  createPatient(patient: any): Observable<ReadPatientDto> {
    return this.http.post<ReadPatientDto>(`${environment.apiUrl}/patient/Add`, patient).pipe(
      tap(() => this.getPatients(true).subscribe())
    );
  }

  updatePatient(id: number, patient: any): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/patient/Update/${id}`, patient).pipe(
      tap(() => {
        const current = this.patientsSubject.value;
        const index = current.findIndex(p => p.id === id);
        if (index !== -1) {
          current[index] = { ...current[index], ...patient };
          this.patientsSubject.next([...current]);
        }
        this.getPatients(true).subscribe();
      })
    );
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/patient/Delete/${id}`).pipe(
      tap(() => this.getPatients(true).subscribe())
    );
  }

  // -------------------- DOCTOR API --------------------
  getDoctors(forceRefresh = false): Observable<ReadDoctorDto[]> {
    if (forceRefresh || !this.doctorsCache$) {
      this.doctorsCache$ = this.http
        .get<ReadDoctorDto[]>(`${environment.apiUrl}/doctor/Doctors`)
        .pipe(
          timeout(10000),
          tap(doctors => {
            this.doctorsSubject.next(doctors || []);
            // Populate per-ID cache
            doctors?.forEach(d => {
              if (!this.doctorByIdCache.has(d.id)) {
                this.doctorByIdCache.set(
                  d.id,
                  of(d).pipe(shareReplay(1))
                );
              }
            });
          }),
          shareReplay(1),
          tap({ error: () => this.doctorsCache$ = undefined })
        );
    }
    return this.doctorsCache$;
  }

  getDoctorById(id: number, forceRefresh = false): Observable<ReadDoctorDto> {
    if (!forceRefresh && this.doctorByIdCache.has(id)) {
      return this.doctorByIdCache.get(id)!;
    }
    const req$ = this.http
      .get<ReadDoctorDto>(`${environment.apiUrl}/doctor/Doctor/${id}`)
      .pipe(shareReplay(1));
    this.doctorByIdCache.set(id, req$);
    return req$;
  }

  getDoctorByName(name: string): Observable<ReadDoctorDto> {
    return this.http.get<ReadDoctorDto>(`${environment.apiUrl}/doctor/Doctorbyname/${encodeURIComponent(name)}`);
  }

  getDoctorBySpecialization(specialization: string): Observable<ReadDoctorDto> {
    return this.http.get<ReadDoctorDto>(
      `${environment.apiUrl}/doctor/Doctorbyspecialization/${encodeURIComponent(specialization)}`
    );
  }

  createDoctor(doctor: any): Observable<ReadDoctorDto> {
    return this.http.post<ReadDoctorDto>(`${environment.apiUrl}/doctor/Add`, doctor).pipe(
      tap(() => this.getDoctors(true).subscribe())
    );
  }

  updateDoctor(id: number, doctor: any): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/doctor/Update/${id}`, doctor).pipe(
      tap(() => {
        const current = this.doctorsSubject.value;
        const index = current.findIndex(d => d.id === id);
        if (index !== -1) {
          current[index] = { ...current[index], ...doctor };
          this.doctorsSubject.next([...current]);
        }
        this.getDoctors(true).subscribe();
      })
    );
  }

  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/doctor/Delete/${id}`).pipe(
      tap(() => this.getDoctors(true).subscribe())
    );
  }

  // -------------------- APPOINTMENT API --------------------
  getAppointments(forceRefresh = false): Observable<ReadAppointmentDto[]> {
    if (forceRefresh || !this.appointmentsCache$) {
      this.appointmentsCache$ = this.http
        .get<ReadAppointmentDto[]>(`${environment.apiUrl}/appointment/Appointments`)
        .pipe(
          tap(res => this.appointmentsSubject.next(res || [])),
          shareReplay(1),
          catchError(err => {
            this.appointmentsCache$ = undefined;
            return throwError(() => err);
          })
        );
    }
    return this.appointmentsCache$;
  }

  getAppointmentById(id: number): Observable<ReadAppointmentDto> {
    return this.http.get<ReadAppointmentDto>(`${environment.apiUrl}/appointment/Appointment/${id}`);
  }

  createAppointment(dto: CreateAppointmentDto): Observable<ReadAppointmentDto> {
    this.appointmentsCache$ = undefined;
    return this.http.post<ReadAppointmentDto>(`${environment.apiUrl}/appointment/Create`, dto);
  }

  cancelAppointment(id: number): Observable<void> {
    this.appointmentsCache$ = undefined;
    return this.http.put<void>(`${environment.apiUrl}/appointment/${id}/cancel`, {});
  }

  completeAppointment(id: number): Observable<void> {
    this.appointmentsCache$ = undefined;
    return this.http.put<void>(`${environment.apiUrl}/appointment/${id}/complete`, {});
  }

  deleteAppointment(id: number): Observable<void> {
    this.appointmentsCache$ = undefined;
    return this.http.delete<void>(`${environment.apiUrl}/appointment/Delete/${id}`);
  }

  // -------------------- SYNC LOOKUP --------------------
  getDoctorFromCache(name: string): ReadDoctorDto | null {
    return this.doctorsSubject.value.find(d => d.name.trim().toLowerCase() === name.toLowerCase()) || null;
  }

  getPatientFromCache(name: string): ReadPatientDto | null {
    return this.patientsSubject.value.find(p => p.name.trim().toLowerCase() === name.toLowerCase()) || null;
  }
}