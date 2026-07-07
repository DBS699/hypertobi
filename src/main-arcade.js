import './styles/main.css';
import './styles/arcade.css';
import { mountGame } from './arcade/mount.js';

mountGame(document.getElementById('game-root'));
