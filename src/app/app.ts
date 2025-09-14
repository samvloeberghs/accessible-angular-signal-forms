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
import { ErrorHandling } from './directives/error-handling';
import { FormErrors } from './components/form-errors';
import { JsonPipe } from '@angular/common';

const defaultFilledIn: Registration = {
  name: 'Sam',
  email: 'sam@sam.sam',
  setupPublicProfile: true,
  biography: 'This is my biography',
  password: 'Sam@123456789',
  confirmPassword: 'Sam@123456789',
}

const defaultEmpty: Registration = {
  name: '',
  email: '',
  setupPublicProfile: false,
  biography: '',
  password: '',
  confirmPassword: '',
}

@Component({
  selector: 'app-root',
  imports: [Control, ErrorHandling, ErrorHandling, FormErrors, JsonPipe],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly minimalPasswordLength = minimalPasswordLength;
  protected readonly submitAttempted = signal(false);
  protected readonly submitted = signal(false);
  protected readonly registration = signal<Registration>(defaultFilledIn);
  protected readonly registrationForm = form(this.registration, (path) => {
    // top level form validation and handling
    disabled(path, () => {
      return this.registrationForm().submitting();
    });

    // name
    required(path.name, { message: 'Name is required' });

    // email
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Valid email is required' });

    // biography
    required(path.biography, {
      message: 'Biography is required',
      when: ({ valueOf }) => {
        return valueOf(path.setupPublicProfile);
      },
    });
    minLength(path.biography, 5, {
      message: 'Biography needs a minimum of 5 characters',
    });

    // password and confirmPassword
    validate(path.password, ({ valueOf }) => {
      return passwordStrengthValidator(valueOf(path.password));
    });

    required(path.confirmPassword, { message: 'Please confirm your password' });
    validate(path.confirmPassword, ({ valueOf }) => {
      if (valueOf(path.confirmPassword).length === 0) {
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

    submit(this.registrationForm, async (registrationForm) => {
      const result = await fakeSubmitToBackend(registrationForm);
      debugger;
      if (!result) {
        // submission failed due to server side error
        this.submitted.set(true);
      }
    });
  }

  protected handleReset($event: Event): void {
    this.submitAttempted.set(false);
    $event.preventDefault();
    this.registrationForm().reset();
  }
}
