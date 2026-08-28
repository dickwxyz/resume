// ============================================================
// 陈雅琴教授个人简历网站 - 交互脚本
// ============================================================

(function () {
  'use strict';

  // ---------- 1. 导航栏滚动样式 & 激活联动 ----------
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const backTop = document.getElementById('backTop');
  const navToggle = document.getElementById('navToggle');
  const navLinksBox = document.getElementById('navLinks');

  function onScroll() {
    const y = window.scrollY;

    // 导航栏样式
    if (y > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // 返回顶部按钮
    if (y > 500) backTop.classList.add('visible');
    else backTop.classList.remove('visible');

    // 导航高亮：找到当前 section
    const scrollPos = y + 140;
    let currentId = 'home';
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- 2. 移动端菜单 ----------
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinksBox.classList.toggle('open');
  });
  navLinks.forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinksBox.classList.remove('open');
    });
  });

  // ---------- 3. 返回顶部 ----------
  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- 4. 滚动入场动画（IntersectionObserver） ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // 加入轻微错峰，显得更灵动
        const delay = entry.target.dataset.delay || (idx % 6) * 60;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  // 把所有 hover-card 注册入场动画，并额外设置时间线与卡片的错峰
  const allAnimated = document.querySelectorAll(
    '.hover-card, .timeline-item, .stat-card, .research-card, .course-card, .paper-item, .award-item, .contact-card, .recruit-box'
  );
  allAnimated.forEach((el, i) => {
    // 已有 class 的不再覆盖（CSS stagger-in 依赖动画，JS 管可见性 + 错峰）
    if (!el.classList.contains('hover-card')) el.classList.add('hover-card');
    // 给 grid 内部元素按 DOM 顺序错峰
    el.dataset.delay = String((i % 8) * 70);
    io.observe(el);
  });

  // ---------- 5. 数字滚动动画（论文数、学生数、经费等） ----------
  const statNums = document.querySelectorAll('.stat-num');

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateNumber(el, target, duration = 1600) {
    const start = performance.now();
    const isLarge = target >= 1000;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(p);
      let val = Math.round(target * eased);
      // 大数字加入千分号，显得更专业
      if (isLarge) val = val.toLocaleString('zh-CN');
      el.textContent = val;
      if (p < 1) requestAnimationFrame(tick);
      else {
        if (isLarge) el.textContent = target.toLocaleString('zh-CN');
        else el.textContent = target;
      }
    };
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count, 10) || 0;
        animateNumber(entry.target, target, target > 1000 ? 2000 : 1600);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(n => statObserver.observe(n));

  // ---------- 6. 标题装饰：鼠标轻微视差（灵动感） ----------
  const heroPortrait = document.querySelector('.hero-portrait');
  const heroText = document.querySelector('.hero-text');
  const decoLeaves = document.querySelectorAll('.deco-leaf');

  if (heroPortrait && window.matchMedia('(pointer: fine)').matches) {
    document.querySelector('.hero').addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 ~ 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // 头像轻微反向移动
      heroPortrait.style.transform = `translate(${x * -12}px, ${y * -10}px) rotate(${x * 1.5}deg)`;
      heroText.style.transform    = `translate(${x * 8}px, ${y * 6}px)`;

      // 四周的装饰元素飘得更远一些
      decoLeaves.forEach((leaf, i) => {
        const factor = (i + 1) * 5;
        leaf.style.transform = `translate(${x * factor}px, ${y * factor}px) rotate(${x * 15 + i * 8}deg)`;
      });
    });

    document.querySelector('.hero').addEventListener('mouseleave', () => {
      heroPortrait.style.transform = '';
      heroText.style.transform = '';
      decoLeaves.forEach(leaf => leaf.style.transform = '');
    });
  }

  // ---------- 7. 时间轴卡片：滚动时按条目依次点亮 ----------
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 时间线点做一次脉动动画
        const dot = entry.target.querySelector('.timeline-dot');
        if (dot) {
          dot.style.animation = 'none';
          void dot.offsetWidth;
          dot.style.animation = 'dot-pulse 1.2s ease-out';
        }
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  timelineItems.forEach(item => timelineObserver.observe(item));

  // 注入时间线点脉动动画 keyframes
  const dotStyle = document.createElement('style');
  dotStyle.textContent = `
    @keyframes dot-pulse {
      0%   { box-shadow: 0 0 0 4px rgba(201, 169, 97, 0.15), 0 0 0 0 rgba(201, 169, 97, 0.6); }
      100% { box-shadow: 0 0 0 4px rgba(201, 169, 97, 0.15), 0 0 0 22px rgba(201, 169, 97, 0); }
    }
  `;
  document.head.appendChild(dotStyle);

  // ---------- 8. 论文 / 研究卡片 hover 时：轻微倾斜（3D tilt）----------
  const tiltTargets = document.querySelectorAll('.research-card, .paper-item, .course-card, .contact-card');
  if (window.matchMedia('(pointer: fine)').matches) {
    tiltTargets.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rotX = (py - 0.5) * -6;   // degree
        const rotY = (px - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ---------- 9. 装饰粒子：画布背景绘制动态连线的小点（增加灵动感） ----------
  const canvas = document.getElementById('bgCanvas');
  if (canvas && window.matchMedia('(pointer: fine)').matches) {
    // 用原生 canvas 绘制
    const realCanvas = document.createElement('canvas');
    realCanvas.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:0.5;';
    canvas.appendChild(realCanvas);
    const ctx = realCanvas.getContext('2d');
    let w, h, dots;

    function resize() {
      w = realCanvas.width  = window.innerWidth  * devicePixelRatio;
      h = realCanvas.height = window.innerHeight * devicePixelRatio;
      realCanvas.style.width  = window.innerWidth + 'px';
      realCanvas.style.height = window.innerHeight + 'px';
      const count = Math.min(60, Math.floor(window.innerWidth / 22));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        r: (Math.random() * 1.6 + 0.6) * devicePixelRatio
      }));
    }
    resize();
    window.addEventListener('resize', resize);

    const linkDist = 130 * devicePixelRatio;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      // 更新位置
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
      });
      // 连线
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.35;
            ctx.strokeStyle = `rgba(201, 169, 97, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // 点
      dots.forEach(d => {
        ctx.fillStyle = 'rgba(74, 140, 124, 0.65)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ---------- 10. 首尾字母装饰：名字首字随机微光 ----------
  const heroNameChars = document.querySelectorAll('.hero-name .char');
  heroNameChars.forEach((ch, idx) => {
    ch.addEventListener('mouseenter', () => {
      ch.style.filter = 'drop-shadow(0 0 14px rgba(201, 169, 97, 0.7))';
      ch.style.transform  = 'translateY(-6px) scale(1.08)';
      ch.style.transition = 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
    ch.addEventListener('mouseleave', () => {
      ch.style.filter = '';
      ch.style.transform = '';
    });
  });

  // ---------- 11. 联系卡片 / 邮箱复制小彩蛋 ----------
  const ccValues = document.querySelectorAll('.cc-value');
  ccValues.forEach(v => {
    if (!v.href || !v.href.startsWith('mailto:')) return;
    v.title = '点击复制邮箱';
    v.addEventListener('click', (e) => {
      // 默认行为继续（打开邮箱），但额外给一个复制反馈
      const email = v.textContent.trim();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          const origin = v.textContent;
          v.textContent = '✓ 已复制到剪贴板';
          v.style.color = 'var(--gold)';
          setTimeout(() => {
            v.textContent = origin;
            v.style.color = '';
          }, 1800);
        });
      }
    });
  });

  // ---------- 12. 平滑锚点：因为已经在 CSS 用了 scroll-behavior，这里只给 hash 补个顶部偏移 ----------
  // 解决带#链接跳转后被固定导航挡住标题的问题
  function fixAnchorOffset() {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 92;
    requestAnimationFrame(() => window.scrollTo({ top, behavior: 'smooth' }));
  }
  window.addEventListener('load', fixAnchorOffset);

  // ---------- 13. 招生信息卡片：随机出现"✨"小光点 ----------
  const recruit = document.querySelector('.recruit-box');
  if (recruit) {
    setInterval(() => {
      const spark = document.createElement('span');
      spark.textContent = '✨';
      spark.style.cssText = `
        position:absolute;
        font-size:${12 + Math.random() * 10}px;
        left:${Math.random() * 85 + 5}%;
        top:${Math.random() * 80 + 5}%;
        opacity:0;
        transform:scale(0.4);
        pointer-events:none;
        transition:all 1.4s ease-out;
        filter:drop-shadow(0 0 6px rgba(201,169,97,0.8));
      `;
      recruit.appendChild(spark);
      requestAnimationFrame(() => {
        spark.style.opacity = '0.9';
        spark.style.transform = 'scale(1) translateY(-18px)';
      });
      setTimeout(() => {
        spark.style.opacity = '0';
        spark.style.transform += ' translateY(-26px)';
        setTimeout(() => spark.remove(), 1500);
      }, 1200);
    }, 1400);
  }

  // ---------- 14. 页面加载完成后：给 body 加 class，触发一些收尾动画 ----------
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

})();
