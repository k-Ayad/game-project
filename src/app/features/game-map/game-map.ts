import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { Character, Position } from '../../core/models/character.model';
import { PathNode, Building } from '../../core/models/path-node.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer', { read: ElementRef }) mapContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('viewport', { read: ElementRef }) viewport!: ElementRef<HTMLDivElement>;

  character: Character | null = null;
  pathNodes: PathNode[] = [];
  buildings: Building[] = [];
  
  private destroy$ = new Subject<void>();
  private isMobile = false;

  cameraX = 0;
  cameraY = 0;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.pathNodes = this.gameService.getPathNodes();
    this.buildings = this.gameService.getBuildings();
    
    this.gameService.character$
      .pipe(takeUntil(this.destroy$))
      .subscribe(character => {
        this.character = character;
        if (this.isMobile) {
          this.updateCamera();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMapClick(event: MouseEvent): void {
    if (!this.mapContainer) return;

    const rect = this.mapContainer.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left + (this.isMobile ? this.cameraX : 0);
    const y = event.clientY - rect.top + (this.isMobile ? this.cameraY : 0);

    this.gameService.moveToPosition({ x, y });
  }

  private updateCamera(): void {
    if (!this.character || !this.viewport) return;

    const viewportEl = this.viewport.nativeElement;
    const viewportWidth = viewportEl.clientWidth;
    const viewportHeight = viewportEl.clientHeight;

    this.cameraX = this.character.position.x - viewportWidth / 2;
    this.cameraY = this.character.position.y - viewportHeight / 2;

    this.cameraX = Math.max(0, Math.min(this.cameraX, 1360 - viewportWidth));
    this.cameraY = Math.max(0, Math.min(this.cameraY, 768 - viewportHeight));
  }

  getCharacterTransform(): string {
    if (!this.character) return 'translate(-50%, -50%)';
    const flip = this.character.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
    return `translate(-50%, -50%) ${flip}`;
  }

  getCameraTransform(): string {
    if (!this.isMobile) return 'translate(0, 0)';
    return `translate(${-this.cameraX}px, ${-this.cameraY}px)`;
  }
}