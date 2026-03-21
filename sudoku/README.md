# Sudoku

**Live Demo**: https://sudoku-iota-three.vercel.app

**Deploy Status**: Deployed to Vercel

## Features

### Core Game (M1)
- 9x9 grid with 3x3 box visual grouping (thick borders)
- Puzzle generator with 3 difficulties (Easy/Medium/Hard), guaranteed unique solution
- Click cell + type 1-9 to fill, Delete/Backspace to clear
- Triple highlighting: selected cell's row/col/box + same number across board
- Real-time error detection with red highlighting for duplicates
- New Game button with difficulty selector popup
- Win detection with congratulations overlay

### Enhanced Features (M2)
- **Pencil Mode**: Toggle to enter candidate numbers (3x3 small digits), auto-cleared on fill
- **Timer**: MM:SS count-up, shown in win overlay, resets on new game
- **Check Button**: Highlights incorrect cells in orange, green toast for correct
- **Solve Button**: Reveals complete solution, locks board, stops timer
- **Undo**: Full history stack with Ctrl+Z/Cmd+Z and button
- **Arrow Key Navigation**: Move between cells, boundary-safe
- **Dark Theme**: Deep color palette with sufficient contrast
- **Responsive Design**: Desktop to mobile (375px) without overflow

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- No frameworks, no dependencies
- Static deployment on Vercel
