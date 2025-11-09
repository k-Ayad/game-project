# 🏛️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            GameMap Component (View Layer)            │  │
│  │                                                       │  │
│  │  • Renders map, character, and places               │  │
│  │  • Handles touch/keyboard input                      │  │
│  │  • Displays UI (instructions, progress)             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (State)                     │
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │ CharacterService     │    │  GameStateService        │  │
│  │                      │    │                          │  │
│  │ • Movement logic     │    │  • Progress tracking     │  │
│  │ • Position updates   │    │  • LocalStorage I/O      │  │
│  │ • Collision detect   │    │  • Completion status     │  │
│  │                      │    │                          │  │
│  │ Uses: RxJS Subject   │    │  Uses: RxJS Subject      │  │
│  └──────────────────────┘    └──────────────────────────┘  │
└───────────────────────┬──────────────────┬──────────────────┘
                        │                  │
                        ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       MODEL LAYER                            │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐  │
│  │ Character  │  │   Place    │  │    GameState        │  │
│  │            │  │            │  │                     │  │
│  │ • position │  │ • id       │  │ • completedPlaces  │  │
│  │ • direction│  │ • position │  │ • currentPlace     │  │
│  │ • sprite   │  │ • icon     │  │ • playerName       │  │
│  │ • isMoving │  │ • type     │  │ • lastSaved        │  │
│  └────────────┘  └────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Movement Flow (User Input → Character Update)
```
1. User Input (Touch/Keyboard)
        ↓
2. GameMap Component detects event
        ↓
3. Calls CharacterService.moveCharacter()
        ↓
4. Service updates internal BehaviorSubject
        ↓
5. Component subscribes to character$ Observable
        ↓
6. Template re-renders with new position
        ↓
7. CSS transition animates the movement
```

### Place Interaction Flow
```
1. Character moves to Place location
        ↓
2. Collision Detection (every frame)
        ↓
3. CharacterService.checkCollision() returns true
        ↓
4. GameMap.enterPlace() called
        ↓
5. User confirms entry (confirm dialog)
        ↓
6. GameStateService.completePlace() updates state
        ↓
7. State saved to LocalStorage
        ↓
8. Component updates UI (completion badge)
```

## Component Communication Pattern

```
┌─────────────────────────────────────────────────────┐
│                   GameMap Component                  │
│                                                      │
│  constructor(                                        │
│    private characterService: CharacterService,       │
│    private gameStateService: GameStateService        │
│  )                                                   │
│                                                      │
│  ngOnInit() {                                        │
│    // Subscribe to observables                      │
│    this.characterService.character$.subscribe()     │
│    this.gameStateService.gameState$.subscribe()     │
│  }                                                   │
│                                                      │
│  // User interactions call service methods          │
│  onTouchMove() {                                     │
│    this.characterService.moveCharacter(...)         │
│  }                                                   │
└─────────────────────────────────────────────────────┘
                         ▲  │
                         │  │ Observable Pattern
                         │  ▼
┌─────────────────────────────────────────────────────┐
│              CharacterService                        │
│                                                      │
│  private characterSubject = new BehaviorSubject()   │
│  public character$ = Observable                     │
│                                                      │
│  moveCharacter(direction, speed) {                  │
│    // Update position                               │
│    this.characterSubject.next(newState)             │
│  }                                                   │
└─────────────────────────────────────────────────────┘
```

## Mobile Touch System

```
Touch Event Flow:
┌──────────────┐
│  Touch Start │ → Capture initial position (touchStartX, touchStartY)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Touch Move  │ → Calculate delta (current - start)
└──────┬───────┘   → Convert to joystick position
       │           → Determine direction and magnitude
       │           → Call moveCharacter()
       ▼
┌──────────────┐
│  Touch End   │ → Reset joystick
└──────────────┘   → Stop character movement
```

## Responsive Design Strategy

```
Mobile First Approach:
├── Base styles (320px+)
│   ├── Touch controls active
│   ├── Virtual joystick
│   └── Optimized font sizes
│
├── Tablet styles (@media min-width: 768px)
│   ├── Keyboard controls shown
│   ├── Larger UI elements
│   └── Both touch and keyboard work
│
└── Desktop styles (@media min-width: 1024px)
    ├── Keyboard controls primary
    ├── Hover effects enabled
    └── Larger game area
```

## Performance Considerations

```
Optimization Points:
├── Movement Loop (60 FPS)
│   └── setInterval(16ms) for smooth updates
│
├── Collision Detection
│   └── Simple AABB, runs every frame but lightweight
│
├── RxJS Subscriptions
│   └── takeUntil pattern prevents memory leaks
│
├── CSS Animations
│   └── Uses 'transform' for GPU acceleration
│
└── Touch Events
    └── preventDefault() to avoid browser defaults
```

## State Persistence

```
LocalStorage Flow:
┌─────────────────┐
│  Game Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  GameStateService.saveGame  │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  localStorage.setItem()      │
│  Key: 'game-progress'        │
│  Value: JSON.stringify(...)  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  BehaviorSubject.next()      │
│  (Notify all subscribers)    │
└──────────────────────────────┘

On App Load:
┌─────────────────┐
│  App Starts     │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  loadGameState()             │
│  localStorage.getItem()      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  JSON.parse()                │
│  Initialize BehaviorSubject  │
└──────────────────────────────┘
```

## Future Architecture Extensions

```
Planned Additions:
├── Mini-Game Engine
│   ├── Base MiniGame interface
│   ├── Game-specific implementations
│   └── Routing to different mini-games
│
├── Asset Management
│   ├── Sprite loader service
│   ├── Sound effects manager
│   └── Animation controller
│
└── Multiplayer Support
    ├── WebSocket service
    ├── Shared state synchronization
    └── Player management
```

## File Organization Benefits

```
Why This Structure?
├── /core
│   └── Keeps fundamental logic separate
│       → Easy to test in isolation
│       → Can be reused across features
│
├── /features
│   └── Feature-based organization
│       → Easy to add new game areas
│       → Clear separation of concerns
│
└── /shared
    └── Reusable UI components
        → Consistency across features
        → DRY principle
```

---

This architecture follows Angular best practices and game development patterns, making it easy to extend and maintain.
