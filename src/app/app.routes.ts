import { Routes } from '@angular/router';
import { MapComponent } from './features/game-map/game-map';

export const routes: Routes = [
  { path: '', component: MapComponent },
  { path: '**', redirectTo: '' }
];