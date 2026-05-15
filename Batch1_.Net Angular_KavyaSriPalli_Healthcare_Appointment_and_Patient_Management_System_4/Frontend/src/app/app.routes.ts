import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
    {path:'',redirectTo:'User/login',pathMatch:'full'},
    {
        path:'User',
        children:[
            {
                path:'login',
                loadComponent:()=>import('./User/login/login').then(m=>m.Login),
            },
            {
                path:'sign-up',
                loadComponent:()=>import('./User/sign-up/sign-up').then(m=>m.SignUp),
            },
        ],
    },

    {
        path: 'Patient',
        canActivate: [authGuard],
        data: { roles: ['Patient', 'Admin'] },
        loadComponent: () =>
            import('./Patient/patient-dashboard/patient-dashboard').then(m => m.PatientDashboard),
        children: [
            {
            path: '',
            redirectTo: 'view-profile',
            pathMatch: 'full',
            },
            {
            path: 'view-profile',
            loadComponent: () =>
                import('./Patient/view-profile/view-profile').then(m => m.PatientViewProfile),
            },
            {
            path: 'add-patient',
            loadComponent: () =>
                import('./Patient/add-patient/add-patient').then(m => m.AddPatient),
            },
            {
            path: 'make-appointment',
            loadComponent: () =>
                import('./Patient/make-appointment/make-appointment').then(m => m.MakeAppointment),
            },
            {
            path: 'view-appointments',
            loadComponent: () =>
                import('./Patient/view-appointments/view-appointments').then(m => m.PatientViewAppointments),
            },
            {
            path: 'update-patient',
            loadComponent: () =>
                import('./Patient/update-patient/update-patient').then(m => m.UpdatePatient),
            },
        ],
    },

    {
        path: 'Doctor',
        canActivate: [authGuard],
        data: { roles: ['Doctor', 'Admin'] },

        loadComponent: () =>
            import('./Doctor/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboard),

        children: [
            {
            path: '',
            redirectTo: 'view-profile',
            pathMatch: 'full',
            },
            {
            path: 'view-profile',
            loadComponent: () =>
                import('./Doctor/view-profile/view-profile').then(m => m.DoctorViewProfile),
            },
            {
            path: 'add-doctor',
            loadComponent: () =>
                import('./Doctor/add-doctor/add-doctor').then(m => m.AddDoctor),
            },
            {
            path: 'view-appointments',
            loadComponent: () =>
                import('./Doctor/view-appointments/view-appointments').then(m => m.DoctorViewAppointments),
            },
            {
            path: 'update-doctor',
            loadComponent: () =>
                import('./Doctor/update-doctor/update-doctor').then(m => m.UpdateDoctor),
            },
        ],
    },
    {
        path: 'Admin',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
            import('./Admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
        children: [
            {
            path: '',
            redirectTo: 'view-doctors',
            pathMatch: 'full',
            },
            {
            path: 'view-doctors',
            loadComponent: () =>
                import('./Admin/view-doctors/view-doctors').then(m => m.ViewDoctors),
            },
            {
            path: 'view-all-appointments',
            loadComponent: () =>
                import('./Admin/view-all-appointments/view-all-appointments').then(m => m.ViewAllAppointments),
            },
            {
            path: 'view-patients',
            loadComponent: () =>
                import('./Admin/view-patients/view-patients').then(m => m.ViewPatients),
            },
        ],
    }
];
