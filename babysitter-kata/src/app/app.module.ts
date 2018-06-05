import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { TextMaskModule } from 'angular2-text-mask';

import { ToastModule } from 'ng2-toastr';
import { ToastOptions } from 'ng2-toastr';

export class CustomOption extends ToastOptions {
  showCloseButton = true;
  positionClass = "toast-bottom-center";
  messageClass = "toast-message";
  toastLife: 10000;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    TextMaskModule,
    FormsModule,
    ToastModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [
    { provide: ToastOptions, useClass: CustomOption }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
