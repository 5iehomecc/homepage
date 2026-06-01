/**
 * fairywand — 鼠标拖尾粒子特效
 *
 * 通过 App.register 注册，由 app.js 统一初始化。
 *
 * 架构：
 *   - 对象池预分配，零运行时 GC 压力
 *   - swap-and-pop O(1) 删除，无数组移动
 *   - Retina 适配 (devicePixelRatio)
 *   - 粒子数量硬上限防内存泄漏
 *   - prefers-reduced-motion 自动禁用
 *
 * 配置（修改 App.config.fairywand 可覆盖）：
 *   maxParticles  — 最大粒子数 (默认 300)
 *   spawnRate     — 每次 mousemove 生成数 (默认 3)
 *   colors        — 颜色数组 (默认 ['#00f2ff', '#bc13fe'])
 *   fadeRate      — 每帧 alpha 衰减 (默认 0.02)
 */

App.register('fairywand', function() {
    if (App.config.reducedMotion) return;

    var isMobile = /Mobi|Android/i.test(navigator.userAgent);

    var cfg = Object.assign({
        maxParticles: isMobile ? 100 : 300,
        spawnRate: isMobile ? 1 : 3,
        colors: ['#00f2ff', '#bc13fe'],
        fadeRate: 0.02
    }, App.config.fairywand || {});

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:' + (App.config.zEffect || 99999);
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    var dpr = App.config.dpr;
    var pool = new Array(cfg.maxParticles);
    var count = 0;

    function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', (function() {
        var timer;
        return function() {
            clearTimeout(timer);
            timer = setTimeout(resize, 150);
        };
    })());
    resize();

    function spawn(x, y) {
        if (count >= cfg.maxParticles) return;
        var p = pool[count];
        if (!p) p = pool[count] = {};
        p.x = x;
        p.y = y;
        p.size = Math.random() * 2 + 1;
        p.color = cfg.colors[Math.random() > 0.5 ? 1 : 0];
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = (Math.random() - 0.5) * 3;
        p.alpha = 1;
        count++;
    }

    document.addEventListener('mousemove', function(e) {
        for (var i = 0; i < cfg.spawnRate; i++) spawn(e.clientX, e.clientY);
    });

    function render() {
        if (document.hidden) { requestAnimationFrame(render); return; }
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        var i = count;
        while (i--) {
            var p = pool[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= cfg.fadeRate;
            if (p.alpha <= 0) {
                pool[i] = pool[count - 1];
                pool[count - 1] = p;
                count--;
                continue;
            }
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 6.2832);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
});
