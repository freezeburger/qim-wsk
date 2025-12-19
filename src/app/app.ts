import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuiModule } from './bridges/qui-module';
import { Navigation } from './components/navigation/navigation';
import { ReactiveTheory } from "./components/reactive/reactive.theory";

console.log('Defining App component...');

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, QuiModule, ReactiveTheory],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
