# 06 · Testing y QA para sistemas con IA

## Objetivo
Aprender a garantizar la calidad de un sistema que usa LLMs, donde las salidas no son
deterministas y "assertEquals" no siempre alcanza.

## Qué vas a aprender
- Tests unitarios clásicos para el código no-LLM (parsing, validaciones, lógica de negocio).
- Evals de salidas de LLM: criterios de aceptación (contiene X, no contiene Y, formato válido,
  juez automático con otro LLM) en vez de comparar texto exacto.
- Tests de regresión para prompts (detectar cuándo un cambio de prompt rompe algo que antes andaba).
- Cobertura y qué NO vale la pena testear en un proyecto con IA.

## Entregable
- Suite de tests para uno de los proyectos anteriores (elegir uno con lógica de LLM, ej. 02 o 04),
  separando claramente tests deterministas de evals de LLM.
- Un "golden set" de casos de prueba con el resultado esperado (o criterio de aceptación) para
  las partes que usan LLM.
- Pipeline de CI que corre los tests deterministas en cada cambio (los evals con LLM real pueden
  correr aparte, por costo/latencia).

## Criterios de "hecho"
- [ ] Tests deterministas corriendo en CI, en verde.
- [ ] Golden set documentado con al menos 10 casos.
- [ ] Al menos un test que hubiera detectado una regresión real introducida a propósito
      (documentar el experimento: qué se rompió y cómo el test lo agarró).
