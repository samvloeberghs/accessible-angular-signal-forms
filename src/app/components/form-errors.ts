import { Component, input } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-form-errors',
  styles: `
    .form-error {
      color: red;
      margin-top: 0.25rem;

      &::before {
        content: '⚠️ ';
      }
    }
  `,
  template: `
    @for(error of errors(); track $index){
      <div class="form-error" id="{{fieldName()}}-error--{{error.kind}}">
        {{error.message}}
      </div>
    }
  `,
})
export class FormErrors {
  public readonly errors = input.required<ValidationError[]>();
  public readonly fieldName = input.required<string>();
}
