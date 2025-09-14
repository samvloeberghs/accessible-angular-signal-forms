import { Field, TreeValidationResult, ValidationError } from '@angular/forms/signals';
import { Registration } from '../models/registration.model';

export async function fakeSubmitToBackend(registrationForm: Field<Registration>): Promise<TreeValidationResult> {
  const usedEmails = ['sam@kwerri.be'];
  const randomFailure = Math.random() < 0.3;

  let error: ValidationError;

  if (usedEmails.includes(registrationForm.email().value())) {
    error = { kind: 'email-already-in-use', field: registrationForm.email, message: 'Email already in use' };
  } else if (randomFailure) {
    error = { kind: 'server-error', field: registrationForm, message: 'Random server error' };
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (error) {
        resolve(error);
      } else {
        resolve(null);
      }
    }, 3000);
  });
}
