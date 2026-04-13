import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ListTestComponent} from './test-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ListTestComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('dev-app');
}
