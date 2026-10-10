const game = document.getElementById("game");
const ghost = document.getElementById("ghost");
const player = document.getElementById("player");
const overlay = document.getElementById("overlay");
const timeEl = document.getElementById("time");
const finalEl = document.getElementById("final");

const SIZE = 45;
const MAX = game.clientWidth - SIZE;
const PLAYER_SPEED = 260;     // px per second
const GHOST_START = 90;       // px per second
const GHOST_RAMP = 4;         // ghost gets faster every second

const keys = new Set();
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEYMAP = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
                 w: "up", s: "down", a: "left", d: "right" };

let p, g, elapsed, last, gameOver;

function reset() {
    p = { x: MAX / 2, y: MAX / 2 };
    g = { x: 0, y: 0 };
    elapsed = 0;
    gameOver = false;
    player.textContent = "💃🏼";
    overlay.hidden = true;
    last = performance.now();
    requestAnimationFrame(loop);
}

const clamp = (n) => Math.max(0, Math.min(MAX, n));

function draw() {
    player.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    ghost.style.transform = `translate3d(${g.x}px, ${g.y}px, 0)`;
}

function loop(now) {
    if (gameOver) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;

    // player: smooth continuous movement while a key/button is held
    let dx = 0, dy = 0;
    keys.forEach((k) => { dx += DIRS[k][0]; dy += DIRS[k][1]; });
    const len = Math.hypot(dx, dy);
    if (len) {
        p.x = clamp(p.x + (dx / len) * PLAYER_SPEED * dt);
        p.y = clamp(p.y + (dy / len) * PLAYER_SPEED * dt);
    }

    // ghost: glides straight toward the player, speeding up over time
    const vx = p.x - g.x, vy = p.y - g.y;
    const dist = Math.hypot(vx, vy);
    if (dist > 0) {
        const step = Math.min((GHOST_START + elapsed * GHOST_RAMP) * dt, dist);
        g.x += (vx / dist) * step;
        g.y += (vy / dist) * step;
    }

    draw();
    timeEl.textContent = elapsed.toFixed(1);

    if (dist < SIZE * 0.6) {
        gameOver = true;
        player.textContent = "💀";
        finalEl.textContent = `รอดได้ ${elapsed.toFixed(1)} วินาที`;
        overlay.hidden = false;
        return;
    }
    requestAnimationFrame(loop);
}

// keyboard
document.addEventListener("keydown", (e) => {
    const k = KEYMAP[e.key];
    if (k) { keys.add(k); e.preventDefault(); }
});
document.addEventListener("keyup", (e) => {
    const k = KEYMAP[e.key];
    if (k) keys.delete(k);
});
window.addEventListener("blur", () => keys.clear());

// on-screen buttons (hold to keep moving)
document.querySelectorAll("#pad button").forEach((btn) => {
    const dir = btn.dataset.dir;
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); keys.add(dir); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) =>
        btn.addEventListener(ev, () => keys.delete(dir)));
});

document.getElementById("restart").addEventListener("click", reset);

reset();
