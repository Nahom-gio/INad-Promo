export function initHeroParticles(){
  const hero = document.querySelector('#hero');
  const canvas = document.querySelector('.hero-particles');
  if (!hero || !canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d', { alpha:true });
  if (!ctx) return;

  const styles = getComputedStyle(document.documentElement);
  const colors = [
    styles.getPropertyValue('--pink').trim() || '#EC3892',
    styles.getPropertyValue('--purp').trim() || '#413E75',
    styles.getPropertyValue('--cyan').trim() || '#42B1DB',
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let frame = null;
  let visible = true;

  const buildParticles = () => {
    const area = width * height;
    const count = Math.min(92, Math.max(42, Math.round(area / 18500)));
    particles = Array.from({ length:count }, (_, index) => ({
      x:Math.random() * width,
      y:Math.random() * height,
      baseX:Math.random() * width,
      baseY:Math.random() * height,
      vx:(Math.random() - .5) * .18,
      vy:(Math.random() - .5) * .18,
      r:Math.random() * 1.35 + .75,
      color:colors[index % colors.length],
      phase:Math.random() * Math.PI * 2,
    }));
    particles.forEach((particle) => {
      particle.x = particle.baseX;
      particle.y = particle.baseY;
    });
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.baseX += particle.vx;
      particle.baseY += particle.vy;

      if (particle.baseX < -20) particle.baseX = width + 20;
      if (particle.baseX > width + 20) particle.baseX = -20;
      if (particle.baseY < -20) particle.baseY = height + 20;
      if (particle.baseY > height + 20) particle.baseY = -20;

      const driftX = Math.cos(time * .00035 + particle.phase) * 10;
      const driftY = Math.sin(time * .00028 + particle.phase) * 8;
      let targetX = particle.baseX + driftX;
      let targetY = particle.baseY + driftY;

      particle.x += (targetX - particle.x) * .08;
      particle.y += (targetY - particle.y) * .08;
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        const max = 135;
        if (distSq < max * max) {
          const alpha = (1 - Math.sqrt(distSq) / max) * .18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(209,188,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    particles.forEach((particle) => {
      const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.r * 8);
      glow.addColorStop(0, particle.color);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.globalAlpha = .22;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r * 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = .78;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    if(visible) frame = requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize, { passive:true });
  const syncAnimation = () => {
    if((document.hidden||!visible)&&frame){
      cancelAnimationFrame(frame);
      frame=null;
    }else if(!document.hidden&&visible&&!frame){
      frame=requestAnimationFrame(draw);
    }
  };

  const observer=new IntersectionObserver(entries=>{
    visible=entries.some(entry=>entry.isIntersecting);
    syncAnimation();
  });
  observer.observe(hero);

  document.addEventListener('visibilitychange', () => {
    syncAnimation();
  });

  resize();
  frame = requestAnimationFrame(draw);
}
