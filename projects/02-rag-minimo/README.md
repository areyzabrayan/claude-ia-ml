# 02 · RAG mínimo

## Objetivo
Construir un sistema de Retrieval-Augmented Generation (RAG) básico: indexar un puñado de
documentos propios (notas, PDFs, markdown) y responder preguntas sobre ellos citando la fuente.

## Qué vas a aprender
- Chunking de documentos (por tamaño, por sección).
- Generación de embeddings y almacenamiento en un vector store local (Chroma o FAISS).
- Recuperación (retrieval) top-k y armado del prompt con contexto.
- Diferencia entre "el modelo alucina" y "el modelo no tenía el dato en el contexto".

## Entregable
- Script/CLI `rag.py` que indexa una carpeta `data/` y responde preguntas por línea de comandos.
- Al menos 5 documentos de prueba en `data/`.
- README con ejemplos de preguntas/respuestas reales, incluyendo un caso donde el sistema
  correctamente dice "no lo sé" por falta de contexto.

## Criterios de "hecho"
- [ ] Indexación reproducible (`python rag.py index`).
- [ ] Preguntas respondidas con la fuente citada (archivo + fragmento).
- [ ] Al menos un test automatizado que verifique que una pregunta con respuesta conocida
      recupera el chunk correcto (test de retrieval, no de la calidad del texto generado).
