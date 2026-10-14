import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { First } from './first/first';
import { Second } from './second/second';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, First, Second,  RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('TestApp');
}
