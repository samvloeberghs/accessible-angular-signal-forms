import { customError, CustomValidationError, WithoutField } from '@angular/forms/signals';

export const minimalPasswordLength = 12;

// See https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-policies.html
// ^ $ * . [ ] { } ( ) ? - " ! @ # % & / \ , > < ' : ; | _ ~ ` + =
// eslint-disable-next-line
export const specialCharsRegex = /.*[\^$*.\[\]{}\(\)?\-\"!@#%&\/,><\':;|_~\-+\\=`]/;

export function passwordStrengthValidator(password: string): WithoutField<CustomValidationError>[] | null {
  const minLength = password.length < minimalPasswordLength;
  const oneSpecialChar = containsAtLeastOneSpecialChar(password);
  const oneLowerCase = containsAtLeastOneLowerCaseLetter(password);
  const oneUpperCase = containsAtLeastOneCapitalLetter(password);
  const oneNumber = containsAtLeastOneNumber(password);
  const noSpaces = !password.includes(' ');

  if (
    minLength ||
    !oneSpecialChar ||
    !oneLowerCase ||
    !oneUpperCase ||
    !oneNumber ||
    !noSpaces
  ) {

    const errors: WithoutField<CustomValidationError>[] = [];

    if (minLength) {
      errors.push(customError({
        kind: 'minLength',
        message: `${ minimalPasswordLength } characters minimum required`
      }));
    }
    if (!oneLowerCase) {
      errors.push(customError({ kind: 'oneLowerCase', message: 'At least one lowercase letter required' }));
    }
    if (!oneUpperCase) {
      errors.push(customError({ kind: 'oneUpperCase', message: 'At least one uppercase letter required' }));
    }
    if (!oneNumber) {
      errors.push(customError({ kind: 'oneNumber', message: 'At least one number required' }));
    }
    if (!oneSpecialChar) {
      errors.push(customError({ kind: 'oneSpecialChar', message: 'At least one special character required' }));
    }
    if (!noSpaces) {
      errors.push(customError({ kind: 'noSpaces', message: 'No spaces allowed' }));
    }

    if (errors.length) {
      return errors;
    }
  }

  return null;
}

// check uppercase letter and take special chars into account
const isCapitalLetter = (password: string): boolean =>
  !isNumber(password) && password === password.toUpperCase() && password.toLowerCase() !== password.toUpperCase();

// check lowercase letter and take special chars into account
const isLowerCaseLetter = (password: string): boolean =>
  !isNumber(password) && password === password.toLowerCase() && password.toLowerCase() !== password.toUpperCase();
const isNumber = (c: string): boolean => !Number.isNaN(Number(c));

const containsAtLeastOneCapitalLetter = (password: string): boolean => {
  let capitalFound = false;
  let charPosition = 0;
  while (!capitalFound && charPosition !== password.length) {
    capitalFound = isCapitalLetter(password.substring(charPosition, charPosition + 1));
    ++charPosition;
  }
  return capitalFound;
};

const containsAtLeastOneLowerCaseLetter = (password: string): boolean => {
  let capitalFound = false;
  let charPosition = 0;
  while (!capitalFound && charPosition !== password.length) {
    capitalFound = isLowerCaseLetter(password.substring(charPosition, charPosition + 1));
    ++charPosition;
  }
  return capitalFound;
};

const containsAtLeastOneNumber = (password: string): boolean => {
  let capitalFound = false;
  let charPosition = 0;
  while (!capitalFound && charPosition !== password.length) {
    capitalFound = isNumber(password.substring(charPosition, charPosition + 1));
    ++charPosition;
  }
  return capitalFound;
};

const containsAtLeastOneSpecialChar = (password: string): boolean => {
  return specialCharsRegex.test(password);
};
