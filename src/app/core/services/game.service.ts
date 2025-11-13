import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Character, Position } from '../models/character.model';
import { PathNode, Building } from '../models/path-node.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private characterSubject = new BehaviorSubject<Character>({
    id: 'player-1',
    name: 'Hero',
    position: { x: 120, y: 180 },
    sprite: '🧍',
    isMoving: false,
    direction: 'down'
  });

  public character$: Observable<Character> = this.characterSubject.asObservable();

  private currentPath: Position[] = [];
  private currentPathIndex = 0;
  private animationFrameId: number | null = null;

  private pathNodes: PathNode[] = [
    { x: 120, y: 180, connections: [1] }, // 0: Gate (start)
    { x: 180, y: 220, connections: [0, 2] }, // 1
    { x: 240, y: 280, connections: [1, 3] }, // 2
    { x: 340, y: 340, connections: [2, 4, 5] }, // 3: Left church
    { x: 450, y: 380, connections: [3, 6] }, // 4
    { x: 500, y: 250, connections: [3, 7] }, // 5
    { x: 600, y: 400, connections: [4, 8] }, // 6
    { x: 650, y: 180, connections: [5, 9] }, // 7
    { x: 800, y: 450, connections: [6, 10] }, // 8
    { x: 850, y: 220, connections: [7, 11] }, // 9
    { x: 1000, y: 520, connections: [8, 12] }, // 10
    { x: 1050, y: 300, connections: [9, 13] }, // 11: Cathedral
    { x: 1200, y: 600, connections: [10] }, // 12: Chapel
    { x: 1250, y: 420, connections: [11] } // 13: Small church
  ];

  private buildings: Building[] = [
    { id: 'gate', name: 'Starting Gate', nodeIndex: 0, type: 'gate' },
    { id: 'left-church', name: 'Holy Cross Church', nodeIndex: 3, type: 'church' },
    { id: 'cathedral', name: 'Grand Cathedral', nodeIndex: 11, type: 'cathedral' },
    { id: 'chapel', name: 'Sacred Chapel', nodeIndex: 12, type: 'chapel' },
    { id: 'small-church', name: 'Village Church', nodeIndex: 13, type: 'church' }
  ];

  constructor() {}

  getCharacter(): Character {
    return this.characterSubject.value;
  }

  getPathNodes(): PathNode[] {
    return this.pathNodes;
  }

  getBuildings(): Building[] {
    return this.buildings;
  }

  moveToPosition(targetPos: Position): void {
    const character = this.characterSubject.value;
    const nearestStart = this.findNearestNode(character.position);
    const nearestEnd = this.findNearestNode(targetPos);
    
    if (nearestStart === -1 || nearestEnd === -1) return;
    
    const path = this.findPath(nearestStart, nearestEnd);
    if (path.length > 0) {
      this.currentPath = path.map(nodeIndex => ({
        x: this.pathNodes[nodeIndex].x,
        y: this.pathNodes[nodeIndex].y
      }));
      this.currentPathIndex = 0;
      this.startMovement();
    }
  }

  private findNearestNode(pos: Position): number {
    let minDist = Infinity;
    let nearestIndex = -1;

    this.pathNodes.forEach((node, index) => {
      const dist = Math.hypot(node.x - pos.x, node.y - pos.y);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  private findPath(start: number, end: number): number[] {
    const queue: number[][] = [[start]];
    const visited = new Set<number>([start]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];

      if (node === end) return path;

      for (const next of this.pathNodes[node].connections) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push([...path, next]);
        }
      }
    }

    return [];
  }

  private startMovement(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const character = this.characterSubject.value;
    this.characterSubject.next({ ...character, isMoving: true });

    const animate = () => {
      if (this.currentPathIndex >= this.currentPath.length) {
        this.stopMovement();
        this.checkBuildingCollision();
        return;
      }

      const character = this.characterSubject.value;
      const target = this.currentPath[this.currentPathIndex];
      const dx = target.x - character.position.x;
      const dy = target.y - character.position.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 3) {
        this.currentPathIndex++;
        this.animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const speed = 2;
      const ratio = speed / distance;
      const newX = character.position.x + dx * ratio;
      const newY = character.position.y + dy * ratio;

      let direction: 'up' | 'down' | 'left' | 'right' = character.direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        direction = dx > 0 ? 'right' : 'left';
      } else {
        direction = dy > 0 ? 'down' : 'up';
      }

      this.characterSubject.next({
        ...character,
        position: { x: newX, y: newY },
        direction,
        isMoving: true
      });

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  private stopMovement(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const character = this.characterSubject.value;
    this.characterSubject.next({ ...character, isMoving: false });
    this.currentPath = [];
    this.currentPathIndex = 0;
  }

  private checkBuildingCollision(): void {
    const character = this.characterSubject.value;
    
    for (const building of this.buildings) {
      const node = this.pathNodes[building.nodeIndex];
      const dist = Math.hypot(node.x - character.position.x, node.y - character.position.y);
      
      if (dist < 50) {
        this.triggerMiniGame(building);
        break;
      }
    }
  }

  private triggerMiniGame(building: Building): void {
    setTimeout(() => {
      alert(`Welcome to ${building.name}!\n\nMini-game placeholder.\n\nType: ${building.type.toUpperCase()}`);
    }, 100);
  }
}