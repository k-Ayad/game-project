import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('gameContainer', { read: ElementRef, static: false }) gameContainer!: ElementRef;
  
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
  
  // Store container dimensions for proper coordinate conversion
  private containerRect: DOMRect | null = null;

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
    const speed = 0.8; // Reduced speed for more accuracy
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

  // Touch controls for mobile - FIXED VERSION
  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    // Get container bounds for accurate positioning
    if (this.gameContainer) {
      this.containerRect = this.gameContainer.nativeElement.getBoundingClientRect();
    }
    
    const touch = event.touches[0];
    // Store the touch position relative to viewport (for joystick display)
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.isTouching = true;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isTouching) return;
    event.preventDefault();
    
    const touch = event.touches[0];
    // Calculate delta from initial touch position
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    
    // Calculate joystick position (clamped to circle)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50;
    
    if (distance > 5) { // Dead zone
      const angle = Math.atan2(deltaY, deltaX);
      const clampedDistance = Math.min(distance, maxDistance);
      
      // Update joystick visual position
      this.joystickX = Math.cos(angle) * clampedDistance;
      this.joystickY = Math.sin(angle) * clampedDistance;
      
      // Move character based on joystick direction
      const speed = 1.2;
      const normalizedX = this.joystickX / maxDistance;
      const normalizedY = this.joystickY / maxDistance;
      
      // Move in the dominant direction for better control
      if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
        this.characterService.moveCharacter(normalizedX > 0 ? 'right' : 'left', speed * Math.abs(normalizedX));
      } else {
        this.characterService.moveCharacter(normalizedY > 0 ? 'down' : 'up', speed * Math.abs(normalizedY));
      }
    } else {
      // Within dead zone - stop movement
      this.characterService.stopMoving();
    }
  }

  onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.isTouching = false;
    this.joystickX = 0;
    this.joystickY = 0;
    this.containerRect = null;
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
    if (!this.character) return 'scaleX(1)';
    // Fixed rotation - character always faces forward (head up)
    // Only flip horizontally for left/right movement
    switch (this.character.direction) {
      case 'left': 
        return 'scaleX(-1)'; // Flip horizontally for left
      case 'right':
      case 'up':
      case 'down':
      default: 
        return 'scaleX(1)'; // Normal for all other directions
    }
  }

  getCompletedCount(): number {
    return this.places.filter(place => place.isCompleted).length;
  }
}