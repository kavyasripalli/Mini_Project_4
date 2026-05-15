import { CommonModule } from '@angular/common';

import {
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {

  loading = false;
  error = '';

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Signup Form

  form = this.fb.group({

    userName: [
      '',
      [
        Validators.required,
        Validators.minLength(3)
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ],

    role: [
      '',
      Validators.required
    ]
  });

  // Submit

  submit(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.loading = true;
    this.error = '';

    const payload = {
      userName: this.form.value.userName?.trim(),
      password: this.form.value.password,
      role: this.form.value.role
    };

    this.auth.register(payload as any).subscribe({

      next: () => {

        this.loading = false;

        // Redirect to Login

        this.router.navigate(
          ['/User/login'],
          {
            queryParams: {
              registered: true
            }
          }
        );
      },

      error: (err) => {

        console.log(err);

        this.loading = false;

        this.error =
          err?.error?.error ||
          err?.error?.message ||
          'Registration failed';
      }
    });
  }
}