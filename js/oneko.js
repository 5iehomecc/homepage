/**
 * oneko — 像素小猫追踪鼠标特效
 *
 * 基于 https://github.com/adryd325/oneko.js
 * 通过 App.register 注册，由 app.js 统一初始化。
 *
 * 配置（通过 data 属性覆盖）：
 *   <script data-cat="js/oneko_white.gif" data-persist-position="false">
 *
 * 功能：
 *   - 8 方向行走动画 + 闲置状态机（idle/alert/scratch/sleep）
 *   - 墙壁挠痒（靠近屏幕边缘时触发）
 *   - 位置持久化（localStorage）
 *   - 触摸事件支持
 *   - prefers-reduced-motion 自动禁用
 */

App.register('oneko', function() {
    if (App.config.reducedMotion) return;

    var el = document.createElement('div');
    var persist = true;
    var posX = 32, posY = 32;
    var mouseX = 0, mouseY = 0;
    var frameCount = 0, idleTime = 0;
    var idleAnim = null, idleFrame = 0;

    var SPEED = 10;
    var SPRITE = 32;
    var HALF = SPRITE / 2;

    var sprites = {
        idle:        [[-3, -3]],
        alert:       [[-7, -3]],
        scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
        scratchWallN:[[0, 0], [0, -1]],
        scratchWallS:[[-7, -1], [-6, -2]],
        scratchWallE:[[-2, -2], [-2, -3]],
        scratchWallW:[[-4, 0], [-4, -1]],
        tired:       [[-3, -2]],
        sleeping:    [[-2, 0], [-2, -1]],
        N:  [[-1, -2], [-1, -3]], NE: [[0, -2], [0, -3]],
        E:  [[-3, 0],  [-3, -1]], SE: [[-5, -1], [-5, -2]],
        S:  [[-6, -3], [-7, -2]], SW: [[-5, -3], [-6, -1]],
        W:  [[-4, -2], [-4, -3]], NW: [[-1, 0],  [-1, -1]]
    };

    function setSprite(name, frame) {
        var s = sprites[name][frame % sprites[name].length];
        el.style.backgroundPosition = s[0] * SPRITE + 'px ' + s[1] * SPRITE + 'px';
    }

    function resetIdle() { idleAnim = null; idleFrame = 0; }

    function idle() {
        idleTime++;
        if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && !idleAnim) {
            var pool = ['sleeping', 'scratchSelf'];
            if (posX < SPRITE) pool.push('scratchWallW');
            if (posY < SPRITE) pool.push('scratchWallN');
            if (posX > window.innerWidth - SPRITE) pool.push('scratchWallE');
            if (posY > window.innerHeight - SPRITE) pool.push('scratchWallS');
            idleAnim = pool[Math.floor(Math.random() * pool.length)];
        }
        switch (idleAnim) {
            case 'sleeping':
                if (idleFrame < 8) { setSprite('tired', 0); break; }
                setSprite('sleeping', Math.floor(idleFrame / 4));
                if (idleFrame > 192) resetIdle();
                break;
            case 'scratchWallN': case 'scratchWallS':
            case 'scratchWallE': case 'scratchWallW':
            case 'scratchSelf':
                setSprite(idleAnim, idleFrame);
                if (idleFrame > 9) resetIdle();
                break;
            default:
                setSprite('idle', 0);
                return;
        }
        idleFrame++;
    }

    function tick() {
        frameCount++;
        var dx = posX - mouseX, dy = posY - mouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < SPEED || dist < 48) { idle(); return; }

        idleAnim = null; idleFrame = 0;

        if (idleTime > 1) {
            setSprite('alert', 0);
            idleTime = Math.min(idleTime, 7) - 1;
            return;
        }

        var dir = '';
        if (dy / dist > 0.5) dir += 'N';
        else if (dy / dist < -0.5) dir += 'S';
        if (dx / dist > 0.5) dir += 'W';
        else if (dx / dist < -0.5) dir += 'E';

        setSprite(dir || 'E', frameCount);
        posX -= (dx / dist) * SPEED;
        posY -= (dy / dist) * SPEED;
        posX = Math.min(Math.max(HALF, posX), window.innerWidth - HALF);
        posY = Math.min(Math.max(HALF, posY), window.innerHeight - HALF);
        el.style.left = (posX - HALF) + 'px';
        el.style.top = (posY - HALF) + 'px';
    }

    function onFrame(ts) {
        if (document.hidden) { requestAnimationFrame(onFrame); return; }
        if (!el.isConnected) return;
        if (!onFrame._last) onFrame._last = ts;
        if (ts - onFrame._last > 100) { onFrame._last = ts; tick(); }
        requestAnimationFrame(onFrame);
    }

    function init() {
        var file = 'js/oneko.gif';
        var script = document.currentScript;
        if (script && script.dataset.cat) file = script.dataset.cat;
        if (script && script.dataset.persistPosition) {
            persist = script.dataset.persistPosition === '' ||
                      JSON.parse(script.dataset.persistPosition.toLowerCase());
        }

        if (persist) {
            try {
                var s = JSON.parse(localStorage.getItem('oneko'));
                if (s) { posX = s.nekoPosX; posY = s.nekoPosY; mouseX = s.mousePosX; mouseY = s.mousePosY; frameCount = s.frameCount; idleTime = s.idleTime; idleAnim = s.idleAnimation; idleFrame = s.idleAnimationFrame; el.style.backgroundPosition = s.bgPos; }
            } catch(e) {}
        }

        el.id = 'oneko';
        el.setAttribute('aria-hidden', 'true');
        el.style.cssText = 'width:32px;height:32px;position:fixed;pointer-events:none;image-rendering:pixelated;z-index:' + App.config.zTop;
        el.style.left = (posX - HALF) + 'px';
        el.style.top = (posY - HALF) + 'px';
        el.style.backgroundImage = 'url(' + file + ')';
        document.body.appendChild(el);

        document.addEventListener('mousemove', function(e) { mouseX = e.clientX; mouseY = e.clientY; });
        document.addEventListener('touchmove', function(e) { if (e.touches[0]) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; } }, { passive: true });
        document.addEventListener('touchstart', function(e) { if (e.touches[0]) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; } }, { passive: true });

        if (persist) {
            window.addEventListener('beforeunload', function() {
                localStorage.setItem('oneko', JSON.stringify({ nekoPosX: posX, nekoPosY: posY, mousePosX: mouseX, mousePosY: mouseY, frameCount: frameCount, idleTime: idleTime, idleAnimation: idleAnim, idleAnimationFrame: idleFrame, bgPos: el.style.backgroundPosition }));
            });
        }

        requestAnimationFrame(onFrame);
    }

    init();
});
