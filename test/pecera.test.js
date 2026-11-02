const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../src/pecera.js");

const cerca = (a, b, eps, msg) => assert.ok(Math.abs(a - b) < eps, msg || `${a} ≈ ${b}`);

test("la esfera se ve como un círculo que crece y se achica", () => {
  cerca(P.corte("esfera", 0)[0].r, 1, 1e-12);
  cerca(P.corte("esfera", 0.6)[0].r, 0.8, 1e-12);
  assert.deepEqual(P.corte("esfera", 1.2), []);
});

test("el cono se achica linealmente hasta la punta", () => {
  cerca(P.corte("cono", -1)[0].r, 1, 1e-12);
  cerca(P.corte("cono", 0)[0].r, 0.5, 1e-12);
  assert.deepEqual(P.corte("cono", 1), []);
});

test("el cubo es un cuadrado que aparece y desaparece sin cambiar", () => {
  assert.equal(P.corte("cubo", 0.5)[0].lado, 2);
  assert.deepEqual(P.corte("cubo", 1.5), []);
});

test("las dos esferas se ven como dos piezas separadas a mitad de camino", () => {
  assert.equal(P.corte("pesa", 0).length, 2);
  assert.equal(P.corte("pesa", -1.4).length, 1);
  const piezas = P.registro("pesa").map((p) => p.piezas);
  assert.equal(Math.max(...piezas), 2);
});

test("sumando los cortes se infiere el volumen escondido", () => {
  cerca(P.volumenInferido("esfera"), (4 / 3) * Math.PI, 0.01);
  cerca(P.volumenInferido("cubo"), 8, 0.02);
  cerca(P.volumenInferido("cono"), (Math.PI * 1 * 2) / 3, 0.01);
});

test("cerca, la fuerza es la de una dimensión más; lejos, la normal", () => {
  for (const n of [2, 3]) {
    cerca(P.pendiente(0.01, n, 1), -n, 0.02, `n=${n} cerca: ${P.pendiente(0.01, n, 1)}`);
    cerca(P.pendiente(100, n, 1), -(n - 1), 0.02, `n=${n} lejos: ${P.pendiente(100, n, 1)}`);
  }
});

test("lejos, la fuerza coincide con la ley de n dimensiones diluida en L", () => {
  // n = 2: F → 2 / (L·r).   n = 3: F → π / (2·L·r²).
  const L = 0.5;
  cerca(P.fuerza(200, 2, L) * L * 200 / 2, 1, 1e-3);
  cerca(P.fuerza(200, 3, L) * 2 * L * 200 * 200 / Math.PI, 1, 1e-3);
});

test("el registro va de vacío a vacío", () => {
  const r = P.registro("esfera", 100);
  assert.equal(r[0].area, 0);
  assert.equal(r[r.length - 1].area, 0);
  assert.ok(Math.max(...r.map((p) => p.area)) > 3);
});
