import { Component, signal } from '@angular/core';
import {
  Control, customError, disabled,
  email,
  form,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';

import { Registration } from './models/registration.model';
import { fakeSubmitToBackend } from './helpers/fake-submit-to-backend';
import {
  minimalPasswordLength,
  passwordStrengthValidator,
} from './helpers/password-strength-validator';
import { JsonPipe } from '@angular/common';
import { ErrorHandling } from './directives/error-handling';

@Component({
  selector: 'app-root',
  imports: [Control, ErrorHandling, ErrorHandling],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly minimalPasswordLength = minimalPasswordLength;
  protected readonly submitAttempted = signal(false);
  protected readonly registration = signal<Registration>({
    name: '',
    email: '',
    setupPublicProfile: false,
    biography: '',
    password: '',
    confirmPassword: '',
  });
  protected readonly registrationForm = form(this.registration, (path) => {
    disabled(path, () => {
      return this.registrationForm().submitting()
    }),
    required(path.name, { message: 'Name is required' });

    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Valid email is required' });

    required(path.biography, {
      message: 'Biography is required',
      when: ({ valueOf }) => {
        return valueOf(path.setupPublicProfile);
      },
    });
    minLength(path.biography, 5, {
      message: 'Biography needs a minimum of 5 characters',
    });

    validate(path.password, ({ valueOf }) => {
      return passwordStrengthValidator(valueOf(path.password));
    });

    required(path.confirmPassword, { message: 'Please confirm your password' });
    validate(path.confirmPassword, ({ valueOf }) => {
      if(valueOf(path.confirmPassword).length === 0) {
        return null;
      }

      if (valueOf(path.password) !== valueOf(path.confirmPassword)) {
        return customError({
          kind: 'mismatch',
          message: 'Passwords do not match'
        });
      }

      return null;
    });
  });

  protected handleSubmit($event: Event): void {
    $event.preventDefault();
    this.submitAttempted.set(true);

    if (this.registrationForm().invalid()) {
      return;
    }

    submit(this.registrationForm, (registrationForm) => {
      return fakeSubmitToBackend(registrationForm)
    });
  }

  protected handleReset($event: Event): void {
    this.submitAttempted.set(false);
    $event.preventDefault();
    this.registrationForm().reset();
  }
}
