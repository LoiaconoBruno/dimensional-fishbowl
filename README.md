# La pecera dimensional

Página interactiva sobre una pregunta: si nuestro universo fuera una pecera dentro de una dimensión que no vemos, **¿cómo podríamos deducirlo desde adentro?** Muestra dos pistas que un ser de Planilandia (un mundo de 2D) podría usar para deducir la tercera dimensión, y que valen para nosotros con una dimensión más.

## Por qué

La analogía de la pecera es conocida. Lo interesante es la segunda mitad: cómo deducir el afuera **sin poder salir nunca**. La página sirve de base para el ensayo o el cuento: muestra con números qué vería el pez y qué podría inferir.

## Instalación

No hace falta instalar nada. Es una página estática sin dependencias. Para correr los tests hace falta Node 18 o más nuevo.

## Uso

Abrí `index.html` con doble clic.

Ejemplo:

1. Con **Esfera** elegida, apretá **Pasar por el plano**. Desde afuera se ve la esfera atravesando el plano; desde adentro, un círculo que aparece, crece, se achica y desaparece. El registro grafica el área y la deducción apila los cortes hasta dibujar el perfil circular. Al terminar, el "volumen" estimado es **4,19** (el de una esfera de radio 1 es 4π/3 ≈ 4,19).
2. Elegí **Dos esferas a distinta altura** y poné la posición en 50 %: el ser plano ve **2 figuras separadas** que en realidad son parte de un mismo objeto que se asoma en dos lugares.
3. En la pista 2, con **El nuestro (3D + 1 escondida)** y L = 1, la pendiente medida es **−3** cerca y **−2** lejos.
4. Cambiá a **Planilandia**: las pendientes pasan a **−2** y **−1**.

## Cómo funciona

**Pista 1, los cortes.** Cada objeto (esfera, cono, cubo, dos esferas) se corta con el plano a cada altura. El ser plano solo ve esos cortes: registra el área total en el tiempo y, apilándolos, reconstruye el perfil. Sumando área × espesor estima un volumen que no puede ver.

**Pista 2, la fuerza.** Si el mundo tiene n dimensiones visibles y una extra enrollada de tamaño L, una masa puntual se comporta como una fila infinita de copias separadas por L a lo largo de la dimensión extra. La fuerza en el mundo visible es la suma de todas:

```
F(r) = Σₖ r / (r² + (k·L)²)^((n+1)/2)
```

La suma se hace numéricamente y la cola lejana se aproxima con una integral. Cerca (r ≪ L) domina la copia más próxima y F ∝ 1/rⁿ. Lejos (r ≫ L) las copias se funden y F ∝ 1/r^(n−1), la ley de siempre. La pendiente en escala logarítmica delata la dimensión escondida.

La lógica está en `src/pecera.js`, sin DOM, y se testea con:

```bash
npm test
```

## Limitaciones

- Es una visualización para pensar, no una prueba de nada.
- La pista 2 usa el modelo más simple: una sola dimensión extra, plana y circular. Los modelos reales de dimensiones extra (por ejemplo, los de Arkani-Hamed, Dimopoulos y Dvali, 1998, o los de Randall y Sundrum, 1999) son más complejos.
- Hasta hoy los experimentos no encontraron desviaciones de la ley 1/r² de la gravedad a escalas de decenas de micrómetros, ni señales de dimensiones extra en el LHC.

## Próximos pasos

- Agregar la pista de la luz que se dobla al cruzar el "vidrio" de la pecera.
- Un objeto que rota mientras atraviesa el plano (los cortes cambian de forma, no solo de tamaño).
- Elegir formato (ensayo o cuento) y usar estas dos pistas como estructura.

## Licencia

MIT
