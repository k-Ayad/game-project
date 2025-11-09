import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Character, Position } from '../models/character.model';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterSubject = new BehaviorSubject<Character>({
    id: 'player-1',
    name: 'Hero',
    position: { x: 50, y: 50 }, // Start at center (percentage)
    sprite: '🧍',
    isMoving: false,
    direction: 'down'
  });

  public character$: Observable<Character> = this.characterSubject.asObservable();

  constructor() {}

  moveCharacter(direction: 'up' | 'down' | 'left' | 'right', speed: number = 2): void {
    const character = this.characterSubject.value;
    const newPosition = { ...character.position };

    switch (direction) {
      case 'up':
        newPosition.y = Math.max(0, newPosition.y - speed);
        break;
      case 'down':
        newPosition.y = Math.min(100, newPosition.y + speed);
        break;
      case 'left':
        newPosition.x = Math.max(0, newPosition.x - speed);
        break;
      case 'right':
        newPosition.x = Math.min(100, newPosition.x + speed);
        break;
    }

    this.characterSubject.next({
      ...character,
      position: newPosition,
      direction,
      isMoving: true
    });
  }

  stopMoving(): void {
    const character = this.characterSubject.value;
    this.characterSubject.next({
      ...character,
      isMoving: false
    });
  }

  setPosition(position: Position): void {
    const character = this.characterSubject.value;
    this.characterSubject.next({
      ...character,
      position
    });
  }

  getCharacter(): Character {
    return this.characterSubject.value;
  }

  checkCollision(position: Position, targetPosition: Position, targetSize: { width: number, height: number }): boolean {
    // Simple AABB collision detection
    const characterRadius = 2; // Character size in percentage
    return (
      position.x + characterRadius > targetPosition.x &&
      position.x - characterRadius < targetPosition.x + targetSize.width &&
      position.y + characterRadius > targetPosition.y &&
      position.y - characterRadius < targetPosition.y + targetSize.height
    );
  }
}
