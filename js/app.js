/**
 * App — 全局命名空间与插件注册中心
 *
 * 架构说明：
 *   window.App 是所有特效插件的注册中心。
 *   每个特效脚本通过 App.register(name, initFn) 注册自己，
 *   app.js 在 DOMContentLoaded 时统一初始化所有已注册的插件。
 *
 * 新增特效只需：
 *   1. 创建 js/your-effect.js
 *   2. 在文件末尾调用 App.register('yourEffect', initFn)
 *   3. 在 index.html 中添加 <script defer src="js/your-effect.js">
 *
 * 配置系统：
 *   App.config 存放全局配置，各插件可读取。
 *   可通过 window.__APP_CONFIG__ 覆盖默认值（用于动态配置）。
 */

(function() {
    'use strict';

    var plugins = {};

    var defaultConfig = {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        dpr: window.devicePixelRatio || 1,
        startTime: new Date('2020/01/01 00:00:00').getTime(),
        zCanvas: 0,
        zContent: 10,
        zEffect: 999,
        zTop: 2147483647
    };

    var config = Object.assign({}, defaultConfig, window.__APP_CONFIG__ || {});

    var App = {
        config: config,
        register: function(name, initFn) {
            plugins[name] = initFn;
        },
        init: function() {
            initRuntime();
            initCopyright();
            var names = Object.keys(plugins);
            for (var i = 0; i < names.length; i++) {
                try {
                    plugins[names[i]]();
                } catch (e) {
                    console.warn('[App] Plugin "' + names[i] + '" failed:', e);
                }
            }
        }
    };

    function initRuntime() {
        var el = document.getElementById('runtime-timer');
        if (!el) return;
        var start = config.startTime;
        function update() {
            var diff = Date.now() - start;
            var d = Math.floor(diff / 86400000);
            var h = Math.floor((diff % 86400000) / 3600000);
            var m = Math.floor((diff % 3600000) / 60000);
            var s = Math.floor((diff % 60000) / 1000);
            el.textContent = d + ' 天 ' + h + ' 小时 ' + m + ' 分 ' + s + ' 秒';
        }
        setInterval(update, 1000);
        update();
    }

    function initCopyright() {
        var el = document.getElementById('copyright-year');
        if (el) el.textContent = new Date().getFullYear();
    }

    window.App = App;

    document.addEventListener('DOMContentLoaded', function() {
        App.init();
    });
})();
