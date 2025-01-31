import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {StarWarsComponent} from "./component/star-wars/star-wars.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StarWarsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'StarWars';
}
