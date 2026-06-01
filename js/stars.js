/**
 * stars — Canvas 星空闪烁背景
 *
 * 通过 App.register 注册，由 app.js 统一初始化。
 *
 * 架构：
 *   - 200 颗星独立 sin 波形闪烁，每颗星随机相位/速度
 *   - Retina 适配 (devicePixelRatio)
 *   - resize 时重建星星位置
 *   - prefers-reduced-motion 自动禁用
 *
 * 配置（修改 App.config.stars 可覆盖）：
 *   count  — 星星数量 (默认 200)
 *   color  — 星星颜色 (默认 '#fff')
 */

App.register('stars', function() {
    if (App.config.reducedMotion) return;

    var isMobile = /Mobi|Android/i.test(navigator.userAgent);

    var cfg = Object.assign({
        count: isMobile ? 80 : 200,
        color: '#fff'
    }, App.config.stars || {});

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:' + (App.config.zCanvas || 0);
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    var dpr = App.config.dpr;
    var stars = [];

    function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildStars();
    }

    function buildStars() {
        var w = window.innerWidth, h = window.innerHeight;
        stars = [];
        for (var i = 0; i < cfg.count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.4 + 0.4,
                phase: Math.random() * 6.2832,
                speed: Math.random() * 1.5 + 0.5,
                base: Math.random() * 0.4 + 0.3
            });
        }
    }

    window.addEventListener('resize', (function() {
        var timer;
        return function() {
            clearTimeout(timer);
            timer = setTimeout(resize, 150);
        };
    })());
    resize();

    function render(t) {
        if (document.hidden) { requestAnimationFrame(render); return; }
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        var sec = t * 0.001;
        for (var i = 0, len = stars.length; i < len; i++) {
            var s = stars[i];
            var alpha = s.base + (1 - s.base) * (0.5 + 0.5 * Math.sin(sec * s.speed + s.phase));
            ctx.globalAlpha = alpha;
            ctx.fillStyle = cfg.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, 6.2832);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
});
