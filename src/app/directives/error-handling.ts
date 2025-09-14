import {
  ComponentRef,
  Directive,
  effect,
  ElementRef, EnvironmentInjector,
  inject,
  Injector,
  input,
  OnDestroy,
  Renderer2,
  ViewContainerRef
} from '@angular/core';
import { Control, ValidationError } from '@angular/forms/signals';
import { FormErrors } from '../components/form-errors';

@Directive({
  selector: '[errorHandling]'
})
export class ErrorHandling implements OnDestroy {
  public readonly errorHandling = input(false);
  private readonly control = inject(Control);
  /*
  The following 3 services can be used from the control instance,
  instead of injecting it
   */
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private formErrorsComponentRef?: ComponentRef<FormErrors>;

  constructor() {
    effect(() => {
      const submitAttempted = this.errorHandling();
      const errors = this.control.field()().errors();

      if (!submitAttempted || errors.length == 0) {
        this.removeFormErrorsComponent();
        this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-errormessage');
        this.renderer.removeAttribute(this.elementRef.nativeElement, 'aria-invalid');
      } else {
        // better to use the name instead of key in parent?
        // the name is a full hierarchical path, while key in parent is just the key in the immediate parent
        // const keyToUse = this.control.state().keyInParent();
        const keyToUse = this.control.state().name();
        this.handleErrors(keyToUse, this.control.field()().invalid(), this.control.field()().errors());
      }
    });
  }

  ngOnDestroy() {
    this.removeFormErrorsComponent();
  }

  private handleErrors(fieldName: string, invalid: boolean, errors: ValidationError[]) {
    this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-invalid', invalid ? 'true' : 'false');
    const errorsText = errors.map((error) => `${ fieldName }-error--${ error.kind }`).join(' ');
    this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-errormessage', errorsText);
    this.handleFormErrorsComponent(fieldName, errors);
  }

  private handleFormErrorsComponent(fieldName: string, errors: ValidationError[]) {
    if (!this.formErrorsComponentRef) {
      this.formErrorsComponentRef = this.viewContainerRef.createComponent(FormErrors, {
        injector: this.injector,
        environmentInjector: this.environmentInjector,
      });
      this.formErrorsComponentRef.setInput('fieldName', fieldName);
    }
    this.formErrorsComponentRef.setInput('errors', errors);
    const parent = this.renderer.parentNode(this.elementRef.nativeElement);
    const next = this.renderer.nextSibling(this.elementRef.nativeElement);

    this.renderer.insertBefore(parent, this.formErrorsComponentRef.location.nativeElement, next);
  }

  private removeFormErrorsComponent() {
    if (this.formErrorsComponentRef) {
      this.formErrorsComponentRef.destroy();
      this.formErrorsComponentRef = undefined;
    }
  }

}
