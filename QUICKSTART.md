# 🎮 Quick Start Guide - Angular Game Project

## 📦 Installation

```bash
# Navigate to the project directory
cd game-project

# Install dependencies
npm install

# Start the development server
npm start
```

The game will open at `http://localhost:4200`

## 🎯 How to Play

### On Mobile 📱
1. Touch anywhere on the screen
2. Drag your finger to move the character
3. A virtual joystick will appear
4. Move the character to any of the 4 locations to enter

### On Desktop 🖥️
1. Use **WASD** or **Arrow Keys** to move
2. Navigate to any of the 4 locations
3. Press Enter when prompted to complete the location

## 🏗️ Project Structure at a Glance

```
src/app/
├── core/
│   ├── models/          # Data structures (Character, Place, GameState)
│   └── services/        # Business logic (CharacterService, GameStateService)
├── features/
│   └── game-map/       # Main game component
└── shared/             # Reusable components (future)
```

## 🎨 What's Included

✅ **Working Features:**
- Character movement with smooth animations
- 4 interactive locations on the map
- Touch controls for mobile
- Keyboard controls for desktop
- Progress tracking with localStorage
- Collision detection
- Responsive design (mobile-first)

🚧 **To Be Implemented:**
- Actual mini-games for each location
- Sound effects
- Better character sprites
- Multiple levels

## 🔧 Customization Tips

### Change Character Speed
Edit `game-map.ts`, line ~148:
```typescript
const speed = 1.5; // Increase for faster movement
```

### Add New Location
Edit `game-map.ts`, `initializePlaces()` method:
```typescript
{
  id: 'place-5',
  name: 'Your New Place',
  position: { x: 50, y: 50 }, // X and Y are percentages (0-100)
  width: 15,
  height: 15,
  isCompleted: false,
  miniGameType: 'your-game',
  description: 'Your description',
  iconUrl: '🎯' // Any emoji
}
```

### Customize Colors
Edit `game-map.scss`:
- Background gradient: `.game-container` background property
- Place colors: `.place` background property
- Character shadow: `.character` filter property

## 📱 Mobile Testing

### Using Chrome DevTools
1. Open Chrome DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select a mobile device
4. Reload the page

### On Real Device
1. Find your computer's local IP:
   ```bash
   # On Windows
   ipconfig
   
   # On Mac/Linux
   ifconfig
   ```

2. Start the dev server:
   ```bash
   npm start -- --host 0.0.0.0
   ```

3. On your phone, navigate to: `http://YOUR-IP:4200`

## 🐛 Troubleshooting

### Game not loading?
- Check console for errors (F12)
- Ensure npm install completed successfully
- Try clearing browser cache

### Character not moving?
- Check if JavaScript is enabled
- Try refreshing the page
- Check console for errors

### Touch controls not working?
- Ensure you're on a touch device or using device emulation
- Check if browser supports touch events
- Try in a different browser

## 📚 Next Steps

1. Read the full documentation: `PROJECT_GUIDE.md`
2. Implement mini-games in `features/mini-games/`
3. Add sound effects
4. Create better visual assets
5. Add more locations and levels

## 🎓 Learning Resources

- **Angular Docs**: https://angular.dev
- **Game Dev Patterns**: Look into state machines for mini-games
- **Touch Events**: MDN Web Docs - Touch events
- **RxJS**: ReactiveX documentation for observables

---

**Happy Gaming! 🎮**
