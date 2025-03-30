# repo
https://github.com/pleabargain/gemini-space-invaders-html

Built on https://aistudio.google.com/ with this prompt 

```

using vanilla javascript
write a space invaders clone
complete with audio effects

```

# Vanilla JavaScript Space Invaders Clone

A simple clone of the classic arcade game Space Invaders, built entirely with vanilla JavaScript, HTML5 Canvas, and CSS. This project demonstrates core game development concepts like the game loop, rendering, collision detection, input handling, and basic audio integration without relying on external libraries or frameworks.

## Features

*   **Player Control:** Move the player ship left and right using arrow keys or A/D keys.
*   **Shooting:** Fire projectiles using the Spacebar (with a short cooldown).
*   **Alien Swarm:** A grid of aliens moves horizontally, drops down, and increases speed upon hitting the screen edges.
*   **Alien Attack:** Aliens periodically fire projectiles back at the player.
*   **Collision Detection:** Detects hits between player bullets and aliens, and alien bullets and the player.
*   **Scoring:** Gain points for destroying aliens.
*   **Lives System:** Player starts with multiple lives, losing one upon being hit.
*   **Sound Effects:** Basic audio feedback for shooting, alien destruction, player explosion, and alien movement (requires audio files).
*   **Game States:** Includes a start screen, active gameplay, and a game over screen with restart functionality.
*   **Basic Difficulty Scaling:** Aliens move slightly faster as their numbers dwindle within a wave, and subsequent waves start slightly faster.

## Screenshot

*(Add a screenshot or GIF of the gameplay here if possible)*
![Gameplay Screenshot Placeholder](screenshot_placeholder.png) <!-- Replace with actual image if you have one -->

## Setup and Installation

1.  **Get the Code:** Clone this repository or download the source files (`index.html`, `style.css`, `script.js`).
2.  **Create Audio Folder:** Create a subfolder named `audio` in the same directory as `index.html`.
3.  **Add Audio Files:** Place the required audio files into the `audio` folder. The game expects the following files (you must provide these yourself):
    *   `shoot.wav` (Player shooting sound)
    *   `invaderkilled.wav` (Alien hit/destroyed sound)
    *   `explosion.wav` (Player hit/destroyed sound)
    *   `fastinvader1.wav` (Alien movement sound 1)
    *   `fastinvader2.wav` (Alien movement sound 2)
    *   `fastinvader3.wav` (Alien movement sound 3)
    *   `fastinvader4.wav` (Alien movement sound 4)
    *   *(Note: You can use `.mp3` or `.ogg` files, but you will need to update the corresponding file names/extensions within the `loadAudio` function in `script.js`)*
4.  **File Structure:** Your project folder should look like this:
    ```
    your-project-folder/
    ├── index.html
    ├── style.css
    ├── script.js
    └── audio/
        ├── shoot.wav
        ├── invaderkilled.wav
        ├── explosion.wav
        ├── fastinvader1.wav
        ├── fastinvader2.wav
        ├── fastinvader3.wav
        └── fastinvader4.wav
    ```
5.  **Run the Game:** Open the `index.html` file in your web browser.

## How to Play

1.  **Start:** Click the "Start Game" button on the initial screen.
2.  **Move:** Use the **Left Arrow Key** or **A** to move the player ship left.
3.  **Move:** Use the **Right Arrow Key** or **D** to move the player ship right.
4.  **Shoot:** Press the **Spacebar** to fire a projectile upwards.
5.  **Objective:** Destroy all the aliens in the swarm before they reach the bottom of the screen or destroy all your ships.
6.  **Avoid:** Dodge the projectiles fired by the aliens.
7.  **Restart:** If the game ends, click the "Play Again" button on the Game Over screen.

## Audio Requirements

*   This game relies on external audio files for sound effects. **You must provide these files** and place them in the `audio/` subfolder as listed in the "Setup" section.
*   The game attempts to load these files when you click "Start Game".
*   **Browser Audio Policy:** Most modern browsers restrict audio playback until the user interacts with the page (e.g., clicking a button). The "Start Game" button serves this purpose. If sounds don't play, ensure your files are correctly named, placed, and that your browser isn't blocking audio.

## Limitations & Known Issues

*   **Basic Graphics:** Uses simple colored rectangles for all game elements. Sprites could be added for visual improvement.
*   **No Shields:** Does not implement the classic player shields.
*   **No High Scores:** Doesn't save high scores between sessions.
*   **No UFO:** The bonus mystery ship is not implemented.
*   **Simple AI:** Aliens fire randomly from the bottom-most ranks.

## Potential Future Enhancements

*   Implement sprite-based graphics.
*   Add player shields with damage states.
*   Introduce multiple levels with increasing difficulty (more aliens, faster speeds, different patterns).
*   Implement a high score table using `localStorage`.
*   Add the top-screen mystery UFO ship for bonus points.
*   More sophisticated alien firing patterns.
*   Touch controls for mobile compatibility.

---

Feel free to use, modify, and learn from this code!