// Interfaz: dibuja el objeto, sus cortes, el registro, la reconstrucción y la ley de fuerza.
(() => {
  const $ = (id) => document.getElementById(id);
  const fmt = (x, d = 2) => Number(x.toFixed(d)).toLocaleString("es-AR");
  let objeto = "esfera";
  let registro = Pecera.registro(objeto);
  let timer = null;

  for (const [k, o] of Object.entries(Pecera.OBJETOS)) $("objeto").add(new Option(o.nombre, k));

  const zDe = (t) => registro[0].z + (registro[registro.length - 1].z - registro[0].z) * t;

  function dibujarAfuera(t) {
    const { ctx, w, h } = Grafico.preparar($("c-afuera"), 240);
    const c = Grafico.colores();
    const esc = Math.min(w, h) / 4.2;
    const cx = w / 2, cy = h / 2;
    const zPlano = zDe(t);
    // El objeto se dibuja en sus coordenadas, desplazado para que el plano quede en el medio.
    const Y = (z) => cy - (z - zPlano) * esc;
    ctx.fillStyle = c.series[0];
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = c.series[0];
    ctx.lineWidth = 2;
    const circ = (x, z, r) => { ctx.beginPath(); ctx.arc(cx + x * esc, Y(z), r * esc, 0, 2 * Math.PI); ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); };
    if (objeto === "esfera") circ(0, 0, 1);
    if (objeto === "pesa") { circ(-1.1, -0.6, 1); circ(1.1, 0.6, 1); }
    if (objeto === "cubo") { ctx.globalAlpha = 0.25; ctx.fillRect(cx - esc, Y(1), 2 * esc, 2 * esc); ctx.globalAlpha = 1; ctx.strokeRect(cx - esc, Y(1), 2 * esc, 2 * esc); }
    if (objeto === "cono") {
      ctx.beginPath(); ctx.moveTo(cx - esc, Y(-1)); ctx.lineTo(cx + esc, Y(-1)); ctx.lineTo(cx, Y(1)); ctx.closePath();
      ctx.globalAlpha = 0.25; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
    }
    // El plano y lo que corta
    ctx.strokeStyle = c.muted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(8, cy); ctx.lineTo(w - 8, cy); ctx.stroke();
    ctx.strokeStyle = c.series[1]; ctx.lineWidth = 4;
    for (const f of Pecera.corte(objeto, zPlano)) {
      const media = f.forma === "circulo" ? f.r : f.lado / 2;
      ctx.beginPath(); ctx.moveTo(cx + (f.x - media) * esc, cy); ctx.lineTo(cx + (f.x + media) * esc, cy); ctx.stroke();
    }
    ctx.fillStyle = c.muted; ctx.font = "12px system-ui"; ctx.fillText("Planilandia", 10, cy - 6);
  }

  function dibujarAdentro(t) {
    const { ctx, w, h } = Grafico.preparar($("c-adentro"), 240);
    const c = Grafico.colores();
    const esc = Math.min(w, h) / 4.2;
    const cx = w / 2, cy = h / 2;
    const figuras = Pecera.corte(objeto, zDe(t));
    ctx.fillStyle = c.series[1]; ctx.strokeStyle = c.series[1]; ctx.lineWidth = 2;
    for (const f of figuras) {
      ctx.globalAlpha = 0.35;
      if (f.forma === "circulo") { ctx.beginPath(); ctx.arc(cx + f.x * esc, cy, f.r * esc, 0, 2 * Math.PI); ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); }
      else { const l = f.lado * esc; ctx.fillRect(cx + f.x * esc - l / 2, cy - l / 2, l, l); ctx.globalAlpha = 1; ctx.strokeRect(cx + f.x * esc - l / 2, cy - l / 2, l, l); }
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.muted; ctx.font = "13px system-ui"; ctx.textAlign = "center";
    ctx.fillText(figuras.length === 0 ? "No hay nada" : figuras.length === 1 ? "Una figura" : `${figuras.length} figuras separadas`, cx, h - 12);
  }

  function dibujarRegistro(t) {
    Grafico.lineas($("c-registro"), {
      series: [{ nombre: "Área total", puntos: registro.map((p) => [p.t, p.area]) }],
      xMin: 0, xMax: 1, yMin: 0,
      xEtiqueta: "tiempo", yEtiqueta: "área",
      verticales: [{ x: t, etiqueta: "ahora" }],
      alto: 220,
    });
  }

  function dibujarReconstruccion(t) {
    const { ctx, w, h } = Grafico.preparar($("c-reconstruccion"), 220);
    const c = Grafico.colores();
    const esc = Math.min(w / 4.6, (h - 20) / (registro[registro.length - 1].z - registro[0].z));
    const cx = w / 2;
    const z0 = registro[0].z;
    const paso = Math.max(1, Math.floor(registro.length / 60));
    ctx.fillStyle = c.series[2];
    for (let i = 0; i < registro.length && registro[i].t <= t + 1e-9; i += paso) {
      const p = registro[i];
      const y = h - 10 - (p.z - z0) * esc;
      for (const f of Pecera.corte(objeto, p.z)) {
        const media = f.forma === "circulo" ? f.r : f.lado / 2;
        ctx.fillRect(cx + (f.x - media) * esc, y - 1.5, 2 * media * esc, 3);
      }
    }
    const vol = Pecera.volumenInferido(objeto, 2000);
    $("txt-volumen").textContent = `Apilando lo que registró (cada corte en el momento en que lo vio), el ser plano dibuja un perfil que nunca pudo ver. Sumando área × tiempo, al final del recorrido estima el "volumen" escondido: ${fmt(vol)}.`;
  }

  function dibujarCortes() {
    const t = parseFloat($("t").value);
    $("v-t").textContent = Math.round(t * 100) + " %";
    dibujarAfuera(t); dibujarAdentro(t); dibujarRegistro(t); dibujarReconstruccion(t);
  }

  function dibujarFuerza() {
    const n = parseInt($("mundo").value, 10);
    const L = Math.pow(10, parseFloat($("L").value));
    $("v-L").textContent = fmt(L);
    const curva = Pecera.curvaFuerza(n, L);
    const cerca = curva.map(([r]) => [r, 1 / Math.pow(r, n)]);
    // Ley "de siempre" diluida en L: n = 2 → 2/(L r); n = 3 → π/(2 L r²).
    const k = n === 2 ? 2 / L : Math.PI / (2 * L);
    const lejos = curva.map(([r]) => [r, k / Math.pow(r, n - 1)]);
    Grafico.lineas($("c-fuerza"), {
      series: [
        { nombre: "Fuerza medida", puntos: curva },
        { nombre: `1/r^${n} (con la dimensión extra)`, puntos: cerca, punteada: true },
        { nombre: `1/r^${n - 1} (ley de siempre)`, puntos: lejos, punteada: true },
      ],
      logX: true, logY: true,
      xMin: 0.01, xMax: 100,
      yMin: Math.min(...curva.map((p) => p[1])) / 2, yMax: Math.max(...curva.map((p) => p[1])) * 2,
      xEtiqueta: "distancia r", yEtiqueta: "fuerza",
      verticales: [{ x: L, etiqueta: "r = L" }],
      alto: 280,
    });
    $("s-cerca").textContent = fmt(Pecera.pendiente(0.01, n, L));
    $("s-lejos").textContent = fmt(Pecera.pendiente(100, n, L));
    $("txt-ley").textContent = n === 3
      ? "En nuestro mundo la gravedad cae como 1/r² (pendiente −2). Si a distancias cortas la pendiente se acercara a −3, delataría una dimensión escondida de tamaño parecido a esa distancia."
      : "En Planilandia la fuerza cae como 1/r (pendiente −1). A distancias cortas, una pendiente cercana a −2 delataría la tercera dimensión.";
  }

  function play() {
    clearInterval(timer);
    let t = 0;
    timer = setInterval(() => {
      t += 0.005;
      $("t").value = Math.min(1, t);
      dibujarCortes();
      if (t >= 1) { clearInterval(timer); timer = null; }
    }, 20);
  }

  $("objeto").addEventListener("change", () => { objeto = $("objeto").value; registro = Pecera.registro(objeto); dibujarCortes(); });
  $("t").addEventListener("input", () => { clearInterval(timer); dibujarCortes(); });
  $("play").addEventListener("click", play);
  $("mundo").addEventListener("change", dibujarFuerza);
  $("L").addEventListener("input", dibujarFuerza);
  window.addEventListener("resize", () => { dibujarCortes(); dibujarFuerza(); });

  dibujarCortes();
  dibujarFuerza();
})();
