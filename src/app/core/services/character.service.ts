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

  // Define walkable paths - these are the areas where the character can move
  private walkablePaths = [
    // Horizontal path (top area)
    { x1: 10, y1: 15, x2: 90, y2: 25 },
    // Vertical path (left side)
    { x1: 10, y1: 15, x2: 30, y2: 85 },
    // Horizontal path (bottom area)
    { x1: 10, y1: 65, x2: 90, y2: 85 },
    // Vertical path (right side)
    { x1: 65, y1: 15, x2: 90, y2: 85 },
    // Center crossroad
    { x1: 30, y1: 40, x2: 65, y2: 60 }
  ];

  constructor() {}

  moveCharacter(direction: 'up' | 'down' | 'left' | 'right', speed: number = 0.8): void {
    const character = this.characterSubject.value;
    const newPosition = { ...character.position };

    // Calculate new position
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

    // Check if new position is within walkable paths
    if (this.isPositionWalkable(newPosition)) {
      this.characterSubject.next({
        ...character,
        position: newPosition,
        direction,
        isMoving: true
      });
    } else {
      // Position not walkable, keep current position but update direction
      this.characterSubject.next({
        ...character,
        direction,
        isMoving: false
      });
    }
  }

  private isPositionWalkable(position: Position): boolean {
    // Check if position is within any of the walkable paths
    return this.walkablePaths.some(path => {
      return position.x >= path.x1 && 
             position.x <= path.x2 && 
             position.y >= path.y1 && 
             position.y <= path.y2;
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
    // Only set position if it's walkable
    if (this.isPositionWalkable(position)) {
      this.characterSubject.next({
        ...character,
        position
      });
    }
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

  // Helper method to get walkable paths (useful for debugging or drawing paths)
  getWalkablePaths() {
    return this.walkablePaths;
  }
}