# Angular Game Project 🎮

A mobile-first, responsive game built with Angular featuring character movement and interactive mini-games.

## 🎯 Project Overview

This is an Angular-based game where players control a character that can move around a map and interact with 4 different locations. Each location triggers a mini-game (to be implemented).

### Features
- ✅ Mobile-first responsive design
- ✅ Touch controls with virtual joystick
- ✅ Keyboard controls (WASD/Arrow keys) for desktop
- ✅ Character movement with collision detection
- ✅ 4 interactive locations with progress tracking
- ✅ LocalStorage for game state persistence
- ✅ Smooth animations and transitions

## 📁 Project Structure

```
game-project/
├── src/
│   ├── app/
│   │   ├── core/                    # Core functionality
│   │   │   ├── models/              # TypeScript interfaces
│   │   │   │   ├── character.model.ts
│   │   │   │   ├── place.model.ts
│   │   │   │   └── game-state.model.ts
│   │   │   └── services/            # Business logic services
│   │   │       ├── character.service.ts
│   │   │       └── game-state.service.ts
│   │   ├── features/                # Feature modules
│   │   │   ├── game-map/           # Main game map component
│   │   │   │   ├── game-map.ts
│   │   │   │   ├── game-map.html
│   │   │   │   └── game-map.scss
│   │   │   └── mini-games/         # Future mini-game components
│   │   ├── shared/                  # Shared components and utilities
│   │   │   ├── components/
│   │   │   └── utils/
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── app.routes.ts
│   ├── styles.scss                  # Global styles
│   └── index.html
```

## 🏗️ Architecture Explanation

### 1. **Core Layer** (`core/`)
Contains the fundamental building blocks:

- **Models**: TypeScript interfaces defining data structures
  - `Character`: Player character with position, direction, movement state
  - `Place`: Interactive locations with mini-game configuration
  - `GameState`: Progress tracking and save state

- **Services**: Business logic and state management
  - `CharacterService`: Handles character movement, collision detection
  - `GameStateService`: Manages game progress and localStorage persistence

### 2. **Features Layer** (`features/`)
Feature-specific components organized by functionality:

- **game-map**: Main gameplay area with character and places
- **mini-games**: (Future) Individual mini-game implementations

### 3. **Shared Layer** (`shared/`)
Reusable components, pipes, directives, and utilities used across features

## 🎮 Game Controls

### Mobile (Touch)
- Touch and drag anywhere on screen to move character
- Virtual joystick appears on touch
- Character moves based on joystick direction

### Desktop
- **WASD** or **Arrow Keys** to move
- Smooth 60 FPS movement
- Collision detection with places

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v10 or higher)

### Installation

```bash
# Navigate to project directory
cd game-project

# Install dependencies
npm install

# Start development server
npm start
```

Open `http://localhost:4200` in your browser.

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 📱 Mobile Optimization

The game is built with mobile-first principles:

1. **Touch Controls**: Custom virtual joystick implementation
2. **Responsive Layout**: Uses `clamp()`, viewport units, and media queries
3. **Performance**: 60 FPS movement loop, optimized animations
4. **Viewport Configuration**: Prevents zoom and bounce effects
5. **Touch Action**: Prevents default browser behaviors

### Mobile-Specific Features
- Virtual joystick with dead zone
- Optimized font sizes using `clamp()`
- Landscape orientation support
- Fixed positioning to prevent scrolling
- Touch-optimized hit areas

## 🎯 Game Mechanics

### Character System
- **Position-based movement**: Uses percentage-based positioning (0-100%)
- **Direction tracking**: Up, down, left, right
- **Movement states**: Moving/idle with animations
- **Collision detection**: AABB (Axis-Aligned Bounding Box) algorithm

### Progress System
- 4 interactive locations on the map
- Progress tracked in localStorage
- Completion badges on finished locations
- Visual feedback (color change, icons)

### Current Locations
1. **Magic House** 🏠 - Puzzle mini-game
2. **Training Grounds** ⚔️ - Action mini-game
3. **Library** 📚 - Trivia mini-game
4. **Market** 🏪 - Memory mini-game

## 🔄 State Management

### Services Pattern
- **CharacterService**: RxJS BehaviorSubject for character state
- **GameStateService**: Handles persistence and progress tracking
- **Observable Pattern**: Components subscribe to state changes

### Data Flow
```
User Input → Service (State Update) → Component (Re-render)
```

## 🎨 Styling Approach

- **SCSS** for maintainable styles
- **Mobile-first** media queries
- **CSS Custom Properties** for theming potential
- **Animations**: Keyframe animations for character and UI
- **Responsive Units**: clamp(), vw, vh, rem

## 🔮 Future Enhancements

### Short-term
- [ ] Implement actual mini-games for each location
- [ ] Add sound effects and background music
- [ ] Create animated character sprites
- [ ] Add obstacles and terrain variations

### Long-term
- [ ] Multiple character selection
- [ ] Multiplayer support
- [ ] Achievement system
- [ ] Customizable maps
- [ ] Save game to cloud

## 🛠️ Development Guidelines

### Adding a New Mini-Game

1. Create component in `features/mini-games/`
```bash
ng generate component features/mini-games/puzzle-game
```

2. Update `Place` model if needed
3. Implement game logic in component
4. Connect to `GameStateService` for progress tracking
5. Add routing if necessary

### Adding a New Location

1. Update `initializePlaces()` in `game-map.ts`
2. Add new place object with position, icon, description
3. Test collision detection
4. Implement corresponding mini-game

## 📊 Performance Considerations

- Movement loop runs at 60 FPS (16ms interval)
- Collision detection optimized with early returns
- RxJS subscriptions properly cleaned up with `takeUntil`
- Touch events use `preventDefault()` to avoid conflicts
- CSS animations use `transform` for GPU acceleration

## 🐛 Known Issues & Solutions

### Issue: Character moves too fast on some devices
**Solution**: Adjust speed parameter in `CharacterService.moveCharacter()`

### Issue: Touch controls feel unresponsive
**Solution**: Reduce dead zone or increase joystick sensitivity

### Issue: Places too small on mobile
**Solution**: Adjust percentage width/height in `initializePlaces()`

## 📝 Code Quality

- TypeScript strict mode enabled
- Standalone components (modern Angular)
- Proper interface definitions
- Service injection via constructor
- Lifecycle hooks for cleanup
- Responsive design patterns

## 🤝 Contributing

When contributing to this project:
1. Follow the established folder structure
2. Use TypeScript interfaces for type safety
3. Keep components focused and single-responsibility
4. Write mobile-first CSS
5. Test on both mobile and desktop
6. Clean up subscriptions in `ngOnDestroy`

## 📄 License

This project is for educational purposes.

---

**Built with Angular 19+ | Optimized for Mobile 📱**
