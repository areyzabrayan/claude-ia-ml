# 05 · Pipeline de datos y modelado clásico

## Objetivo
Construir un pipeline completo de ML "tradicional": datos crudos → limpieza → features →
entrenamiento → evaluación, con seguimiento de experimentos.

## Qué vas a aprender
- Separación clara de etapas (ETL, features, entrenamiento, evaluación) como pasos reproducibles.
- División train/validation/test sin fuga de datos (data leakage).
- Métricas de evaluación apropiadas al problema (no solo accuracy).
- Tracking de experimentos (MLflow o similar): qué parámetros y métricas quedan registrados.

## Entregable
- Dataset público pequeño (tabular) elegido y documentado (fuente, licencia).
- Pipeline con etapas separadas y ejecutables independientemente (`python pipeline.py --stage=...`).
- Al menos 2 experimentos registrados con distintos parámetros/modelos, comparados en el README.

## Criterios de "hecho"
- [ ] Pipeline reproducible de punta a punta con un solo comando.
- [ ] Split train/val/test correctamente aislado (verificado con un test).
- [ ] Tests que verifiquen las funciones de limpieza/features con casos conocidos (inputs con
      valores nulos, tipos inesperados, etc.).
