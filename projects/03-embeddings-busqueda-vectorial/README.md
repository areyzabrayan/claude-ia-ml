# 03 · Embeddings y búsqueda vectorial

## Objetivo
Entender cómo funcionan los embeddings y cómo se evalúa la calidad de una búsqueda vectorial,
más allá de "usar la librería y que funcione".

## Qué vas a aprender
- Cómo se generan embeddings y qué representan (similitud semántica vs. léxica).
- Métricas de distancia (coseno, euclidiana) y cuándo importa cuál usar.
- Métricas de evaluación de retrieval: precision@k, recall@k, MRR.
- Comparar al menos dos modelos de embeddings distintos sobre el mismo dataset.

## Entregable
- Dataset pequeño de pares pregunta→documento relevante (puede ser manual, 20-30 pares).
- Script que indexa los documentos, corre las preguntas y calcula precision@k / recall@k / MRR
  para cada modelo de embeddings comparado.
- Tabla comparativa en el README con resultados y una conclusión escrita (no solo números).

## Criterios de "hecho"
- [ ] Al menos 2 modelos de embeddings comparados con las mismas métricas.
- [ ] Resultados reproducibles vía script (no cálculos manuales).
- [ ] Tests que verifiquen las funciones de métricas (precision@k, recall@k, MRR) con casos
      conocidos, independientes de cualquier modelo real.
