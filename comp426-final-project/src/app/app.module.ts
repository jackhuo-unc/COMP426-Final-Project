import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import the Angular Material modules after Angular's BrowserModule
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { MovieDisplay } from './movie-display-widget/movie-display.widget';

@NgModule({
  declarations: [
    MainComponent,
    LoginComponent,
    MovieDisplay
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [MainComponent]
})
export class AppModule { }

