on('load', async () => {
  const c = $('canvas');
  const ctx = c.getContext('2d');
  
  const { width, height } = c.getBoundingClientRect();
  
  c.width = width;
  c.height = height;
  
  const radius = 12;
  const length = 0|(width / (2*radius)) + 3;
  const depth = 0|(height / (2*radius)) + 3;
  const padX = -radius * 3;
  const padY = -radius * 3;
  
  let mouse = {
    pos: vec2(0, 0),
    lastPos: vec2(0, 0),
  };
  
  on('mousemove', ({ x, y }) => {
    mouse.pos.x = x;
    mouse.pos.y = y;
  });
  
  // thank you, .sys_ on Discord!
  on("touchmove", ({ targetTouches }) => {
    mouse.pos.x = targetTouches[0].clientX;
    mouse.pos.y = targetTouches[0].clientY;
  });

  on("touchstart", ({ targetTouches }) => {
    mouse.pos.x = targetTouches[0].clientX;
    mouse.pos.y = targetTouches[0].clientY;
    mouse.lastPos.x = targetTouches[0].clientX;
    mouse.lastPos.y = targetTouches[0].clientY;
  });
  
  // https://iquilezles.org/articles/distfunctions2d/
  // float sdSegment( in vec2 p, in vec2 a, in vec2 b )
  // {
  //   vec2 pa = p-a, ba = b-a;
  //   float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  //   return length( pa - ba*h );
  // }
  const distToLine = (p, a, b) => {
    const pa = p.sub(a);
    const ba = b.sub(a);
    if (ba.dot(ba) == 0) return pa.length();
    const h = Math.min(Math.max(0, pa.dot(ba)/ba.dot(ba)), 1);
    return pa.sub(ba.mul(h)).length();
  };
  
  let Ps = [...Array(length * depth)].map((e, i) => {
    const x = i % length;
    const y = 0 | (i / length);
    
    const start = vec2(padX + x*3*radius, padY + y*3*radius);
    let pos = vec2(start.x, start.y);
    
    const update = Sorder(pos, ['x', 'y'], {
      frequency: 1,
      springiness: 1,
      response: 0,
    });
    
    return {
      render() {
        const dist = Math.hypot(pos.x - start.x, pos.y - start.y);
        ctx.fillStyle = '#404040';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 4*radius*dist/width, 0, 2*Math.PI);
        ctx.fill();
      },
      update(dt) {
        const dist = distToLine(pos, mouse.lastPos, mouse.pos);
        const amount = Math.exp(-100 * (dist*dist)/(width*width))
        pos.x = start.x + 8*(mouse.pos.x - mouse.lastPos.x)*amount;
        pos.y = start.y + 8*(mouse.pos.y - mouse.lastPos.y)*amount;
        update(dt);
      },
    };
  });
  
  while (true) {
    mouse.lastPos.x = mouse.pos.x;
    mouse.lastPos.y = mouse.pos.y;
    
    const dt = await frame();
    

    ctx.fillStyle = '#202020';
    ctx.fillRect(0, 0, c.width, c.height);
    
    for (const p of Ps) {
      p.render();
      p.update(1/60);
    }
  }
  
  
});