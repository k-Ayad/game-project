import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../core/services/character.service';
import { GameStateService } from '../../core/services/game-state.service';
import { Character } from '../../core/models/character.model';
import { Place } from '../../core/models/place.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-game-map',
  imports: [CommonModule],
  templateUrl: './game-map.html',
  styleUrl: './game-map.scss',
})
export class GameMap implements OnInit, OnDestroy {
  character: Character | null = null;
  places: Place[] = [];
  private destroy$ = new Subject<void>();
  private movementInterval: any;
  private activeKeys = new Set<string>();
  
  // Touch control properties
  touchStartX: number = 0;
  touchStartY: number = 0;
  isTouching: boolean = false;
  joystickX: number = 0;
  joystickY: number = 0;

  constructor(
    private characterService: CharacterService,
    private gameStateService: GameStateService
  ) {}

  ngOnInit(): void {
    this.initializePlaces();
    this.subscribeToCharacter();
    this.startMovementLoop();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
    }
  }

  private initializePlaces(): void {
    this.places = [
      {
        id: 'place-1',
        name: 'Magic House',
        position: { x: 15, y: 20 },
        width: 15,
        height: 15,
        isCompleted: false,
        miniGameType: 'puzzle',
        description: 'A mysterious house with puzzles',
        iconUrl: '🏠'
      },
      {
        id: 'place-2',
        name: 'Training Grounds',
        position: { x: 70, y: 15 },
        width: 15,
        height: 15,
        isCompleted: false,
        miniGameType: 'action',
        description: 'Test your reflexes',
        iconUrl: '⚔️'
      },
      {
        id: 'place-3',
        name: 'Library',
        position: { x: 20, y: 70 },
        width: 15,
        height: 15,
        isCompleted: false,
        miniGameType: 'trivia',
        description: 'Knowledge awaits',
        iconUrl: '📚'
      },
      {
        id: 'place-4',
        name: 'Market',
        position: { x: 75, y: 75 },
        width: 15,
        height: 15,
        isCompleted: false,
        miniGameType: 'memory',
        description: 'Remember and win',
        iconUrl: '🏪'
      }
    ];

    // Update completion status from game state
    const gameState = this.gameStateService.getCurrentState();
    this.places.forEach(place => {
      place.isCompleted = gameState.completedPlaces.includes(place.id);
    });
  }

  private subscribeToCharacter(): void {
    this.characterService.character$
      .pipe(takeUntil(this.destroy$))
      .subscribe(character => {
        this.character = character;
        this.checkPlaceCollisions();
      });
  }

  private startMovementLoop(): void {
    this.movementInterval = setInterval(() => {
      this.activeKeys.forEach(key => {
        this.handleMovement(key);
      });
    }, 16); // ~60 FPS
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault();
      this.activeKeys.add(key);
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.activeKeys.delete(key);
    if (this.activeKeys.size === 0) {
      this.characterService.stopMoving();
    }
  }

  private handleMovement(key: string): void {
    const speed = 1.5;
    switch (key) {
      case 'w':
      case 'arrowup':
        this.characterService.moveCharacter('up', speed);
        break;
      case 's':
      case 'arrowdown':
        this.characterService.moveCharacter('down', speed);
        break;
      case 'a':
      case 'arrowleft':
        this.characterService.moveCharacter('left', speed);
        break;
      case 'd':
      case 'arrowright':
        this.characterService.moveCharacter('right', speed);
        break;
    }
  }

  // Touch controls for mobile
  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.isTouching = true;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isTouching) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    
    // Calculate joystick position (clamped to circle)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;
    
    if (distance > 5) { // Dead zone
      const angle = Math.atan2(deltaY, deltaX);
      const clampedDistance = Math.min(distance, maxDistance);
      
      this.joystickX = Math.cos(angle) * clampedDistance;
      this.joystickY = Math.sin(angle) * clampedDistance;
      
      // Move character based on joystick
      const speed = 2;
      const normalizedX = this.joystickX / maxDistance;
      const normalizedY = this.joystickY / maxDistance;
      
      if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
        this.characterService.moveCharacter(normalizedX > 0 ? 'right' : 'left', speed * Math.abs(normalizedX));
      } else {
        this.characterService.moveCharacter(normalizedY > 0 ? 'down' : 'up', speed * Math.abs(normalizedY));
      }
    }
  }

  onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.isTouching = false;
    this.joystickX = 0;
    this.joystickY = 0;
    this.characterService.stopMoving();
  }

  private checkPlaceCollisions(): void {
    if (!this.character) return;

    this.places.forEach(place => {
      const isColliding = this.characterService.checkCollision(
        this.character!.position,
        place.position,
        { width: place.width, height: place.height }
      );

      if (isColliding && !place.isCompleted) {
        this.enterPlace(place);
      }
    });
  }

  enterPlace(place: Place): void {
    // For now, just mark as completed and show alert
    // Later, this will launch the mini-game
    const confirmed = confirm(`Enter ${place.name}? ${place.description}`);
    if (confirmed) {
      this.gameStateService.completePlace(place.id);
      place.isCompleted = true;
      alert(`Congratulations! You completed ${place.name}!`);
    }
  }

  getCharacterRotation(): string {
    if (!this.character) return 'rotate(0deg)';
    switch (this.character.direction) {
      case 'up': return 'rotate(0deg) scaleY(-1)';
      case 'down': return 'rotate(0deg)';
      case 'left': return 'rotate(0deg) scaleX(-1)';
      case 'right': return 'rotate(0deg)';
      default: return 'rotate(0deg)';
    }
  }

  getCompletedCount(): number {
    return this.places.filter(place => place.isCompleted).length;
  }
}
