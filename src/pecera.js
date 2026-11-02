// La pecera dimensional: cómo un ser de una dimensión menos podría deducir
// que hay un "afuera".
//
// Parte 1 (cortes): un objeto de 3D atraviesa un plano. El ser plano solo ve el
// corte: figuras que aparecen de la nada, cambian de tamaño y desaparecen.
// Apilando los cortes puede reconstruir un perfil que nunca vio.
//
// Parte 2 (fuerza): si el mundo tiene una dimensión extra compacta de tamaño L,
// la ley de fuerza cambia con la distancia. Lejos (r ≫ L) se ve la ley "normal"
// de n dimensiones, 1/r^(n−1); cerca (r ≪ L) aparece la de n+1, 1/r^n.
// Midiendo la pendiente se delata la dimensión escondida.
const Pecera = (() => {
  const OBJETOS = {
    esfera: { nombre: "Esfera", alto: 2 },
    cono: { nombre: "Cono (punta arriba)", alto: 2 },
    cubo: { nombre: "Cubo", alto: 2 },
    pesa: { nombre: "Dos esferas a distinta altura", alto: 3.2 },
  };

  // Cortes del objeto con el plano, con el plano a altura z (coordenadas del
  // objeto, centrado en 0, tamaño característico 1). Devuelve una lista de
  // figuras: { forma: "circulo", x, r } o { forma: "cuadrado", x, lado }.
  function corte(objeto, z) {
    const circulo = (cx, cz, a) => {
      const d = z - cz;
      return Math.abs(d) < a ? [{ forma: "circulo", x: cx, r: Math.sqrt(a * a - d * d) }] : [];
    };
    switch (objeto) {
      case "esfera": return circulo(0, 0, 1);
      case "cono": return z >= -1 && z <= 1 ? [{ forma: "circulo", x: 0, r: (1 - z) / 2 }].filter((f) => f.r > 0) : [];
      case "cubo": return Math.abs(z) <= 1 ? [{ forma: "cuadrado", x: 0, lado: 2 }] : [];
      case "pesa": return [...circulo(-1.1, -0.6, 1), ...circulo(1.1, 0.6, 1)];
      default: throw new Error(`Objeto desconocido: ${objeto}`);
    }
  }

  function area(figuras) {
    return figuras.reduce((a, f) => a + (f.forma === "circulo" ? Math.PI * f.r * f.r : f.lado * f.lado), 0);
  }

  // Lo que registra el ser plano mientras el objeto pasa a velocidad constante:
  // [{ t, area, piezas }]. t va de 0 a 1.
  function registro(objeto, n = 200) {
    const alto = OBJETOS[objeto].alto;
    const desde = -alto / 2 - 0.2, hasta = alto / 2 + 0.2;
    const out = [];
    for (let i = 0; i <= n; i++) {
      const z = desde + ((hasta - desde) * i) / n;
      const f = corte(objeto, z);
      out.push({ t: i / n, z, area: area(f), piezas: f.length });
    }
    return out;
  }

  // Volumen que el ser plano puede inferir sumando área × espesor de cada corte.
  function volumenInferido(objeto, n = 4000) {
    const r = registro(objeto, n);
    const dz = r[1].z - r[0].z;
    return r.reduce((a, p) => a + p.area * dz, 0);
  }

  // Integral de r / (r² + z²)^((n+1)/2) para z de Z a ∞ (cola de la suma).
  function cola(r, Z, n) {
    if (n === 2) return (1 / r) * (1 - Z / Math.sqrt(r * r + Z * Z));
    if (n === 3) return r * (1 / (2 * r * r)) * (Math.PI / (2 * r) - Z / (r * r + Z * Z) - Math.atan(Z / r) / r);
    throw new Error("n tiene que ser 2 o 3");
  }

  // Fuerza (radial, en el mundo visible) de una masa puntual a distancia r, en
  // un mundo de n dimensiones visibles con una dimensión extra circular de
  // tamaño L. Se suman las "imágenes" de la masa a lo largo de la dimensión
  // extra; la cola lejana se aproxima con una integral.
  function fuerza(r, n, L) {
    const K = Math.min(20000, Math.max(50, Math.ceil((20 * r) / L)));
    const exp = (n + 1) / 2;
    let s = 0;
    for (let k = -K; k <= K; k++) {
      const z = k * L;
      s += r / Math.pow(r * r + z * z, exp);
    }
    s += (2 / L) * cola(r, (K + 0.5) * L, n);
    return s;
  }

  // Pendiente local d(log F)/d(log r): ≈ −n cerca, ≈ −(n−1) lejos.
  function pendiente(r, n, L) {
    const h = 1e-3;
    return (Math.log(fuerza(r * (1 + h), n, L)) - Math.log(fuerza(r * (1 - h), n, L))) / (Math.log(1 + h) - Math.log(1 - h));
  }

  function curvaFuerza(n, L, rMin = 0.01, rMax = 100, puntos = 120) {
    const out = [];
    for (let i = 0; i <= puntos; i++) {
      const r = rMin * Math.pow(rMax / rMin, i / puntos);
      out.push([r, fuerza(r, n, L)]);
    }
    return out;
  }

  return { OBJETOS, corte, area, registro, volumenInferido, fuerza, pendiente, curvaFuerza };
})();

if (typeof module !== "undefined") module.exports = Pecera;
