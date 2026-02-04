# Assets Placeholder Guide

## Required Assets for Production

### Mobile (Expo)
Currently using placeholder `.txt` files. Replace with actual images:

**Icon (1024x1024 PNG)**
- `apps/mobile/assets/icon.png` - App icon for iOS/Android
- Must be square, no transparency for iOS
- Will be resized automatically for different densities

**Adaptive Icon (1024x1024 PNG - Android)**
- `apps/mobile/assets/adaptive-icon.png` - Foreground layer
- Should have safe zone (center 66% for circular masks)
- Background color: #0F1115 (defined in app.json)

**Splash Screen (1284x2778 PNG)**
- `apps/mobile/assets/splash.png` - Launch screen
- Logo should be centered, max 200px width
- Background: #0F1115 (dark theme)

**Favicon (48x48 PNG - Web)**
- `apps/mobile/assets/favicon.png` - Browser tab icon

### Desktop (Tauri)
Currently using placeholder `.txt` files in `apps/desktop/icons/`. Replace with:

**Windows**
- `icon.ico` - Multi-size ICO (16, 32, 48, 64, 128, 256)
- Generated from 256x256 PNG source

**macOS**
- `icon.icns` - Apple icon format
- Generated from 1024x1024 PNG source

**Linux**
- `icon.png` - 512x512 PNG

## Design Guidelines

**Logo Concept** (based on app identity):
- Symbol: Rocket 🚀 + Dashboard elements
- Colors: Green (#22C55E) primary, dark background (#0F1115)
- Style: Modern, minimal, professional

**Icon Safe Zones**:
- iOS: Full square, rounded by system
- Android: Center 66% (circular/squircle masks)
- Windows: Standard square with shadow

## Quick Generation Tools

**For development/testing**, use:
1. https://icon.kitchen - Generate all mobile icon sizes
2. https://realfavicongenerator.net - Generate favicon
3. https://github.com/tauri-apps/tauri-icon - Tauri icon generator

**Production Design**:
Hire designer or use Figma/Sketch to create:
1. Base 1024x1024 PNG icon
2. Export all required sizes
3. Run tauri-apps/tauri-icon CLI for desktop

## Placeholder Status
All asset files currently have `.txt` extensions to mark them as placeholders. When replacing:
1. Delete `.txt` files
2. Add proper image files with correct names
3. Test builds to verify correct rendering
4. Commit only final, optimized images (use ImageOptim/TinyPNG)
