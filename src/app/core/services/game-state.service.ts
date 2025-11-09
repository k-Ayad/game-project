import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly STORAGE_KEY = 'game-progress';
  
  private gameStateSubject = new BehaviorSubject<GameState>(this.loadGameState());
  public gameState$: Observable<GameState> = this.gameStateSubject.asObservable();

  constructor() {}

  private loadGameState(): GameState {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      completedPlaces: [],
      currentPlace: null,
      playerName: 'Player',
      lastSaved: new Date()
    };
  }

  saveGameState(state: GameState): void {
    state.lastSaved = new Date();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    this.gameStateSubject.next(state);
  }

  completePlace(placeId: string): void {
    const currentState = this.gameStateSubject.value;
    if (!currentState.completedPlaces.includes(placeId)) {
      currentState.completedPlaces.push(placeId);
      this.saveGameState(currentState);
    }
  }

  isPlaceCompleted(placeId: string): boolean {
    return this.gameStateSubject.value.completedPlaces.includes(placeId);
  }

  getCurrentState(): GameState {
    return this.gameStateSubject.value;
  }

  resetGame(): void {
    const newState: GameState = {
      completedPlaces: [],
      currentPlace: null,
      playerName: 'Player',
      lastSaved: new Date()
    };
    this.saveGameState(newState);
  }
}
