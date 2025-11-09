import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameMap } from './features/game-map/game-map';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameMap],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('game-project');
}
