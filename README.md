# claude-ia-ml

Repositorio de aprendizaje práctico: IA aplicada al desarrollo de software, Machine Learning,
LLMs y buenas prácticas de entrega. Cada carpeta en `projects/` es un proyecto independiente,
pequeño y completo (código + tests + README propio), pensado para aprender haciendo.

## Objetivos de aprendizaje

1. **Desarrollo asistido por IA** — usar Claude Code (y herramientas similares) como parte real
   del flujo de trabajo diario: subagentes, hooks, comandos personalizados, automatización de tareas.
2. **Machine Learning y datos** — orquestación de LLMs, RAG, embeddings/búsqueda vectorial,
   pipelines de datos y modelado.
3. **Testing y QA** — garantizar la calidad del propio trabajo sin depender de un equipo externo
   (tests automatizados, evals de LLMs, CI).
4. **Entrega en ciclos cortos** — construir y lanzar productos pequeños de forma iterativa.

## Roadmap de proyectos

| # | Proyecto | Enfoque principal | Objetivo(s) |
|---|----------|-------------------|-------------|
| 01 | [claude-code-agentic-workflows](projects/01-claude-code-agentic-workflows) | Automatizar una tarea real del propio repo con Claude Code (subagentes, hooks, comandos) | 1 |
| 02 | [rag-minimo](projects/02-rag-minimo) | RAG básico sobre documentos propios | 2 |
| 03 | [embeddings-busqueda-vectorial](projects/03-embeddings-busqueda-vectorial) | Comparar embeddings y evaluar calidad de retrieval | 2 |
| 04 | [orquestacion-agentes-llm](projects/04-orquestacion-agentes-llm) | Agente multi-paso con tool calling | 1, 2 |
| 05 | [pipeline-datos-ml](projects/05-pipeline-datos-ml) | ETL + entrenamiento de un modelo clásico con tracking | 2 |
| 06 | [testing-qa-para-ia](projects/06-testing-qa-para-ia) | Tests unitarios + evals de salidas de LLM + CI | 3 |
| 07 | [producto-ciclo-corto](projects/07-producto-ciclo-corto) | Construir y lanzar un producto pequeño end-to-end | 3, 4 |

Los proyectos están numerados en un orden sugerido (de fundamentos a integración), pero no es
obligatorio seguirlos en orden estricto.

## Cómo trabajar cada proyecto

Cada carpeta en `projects/` tiene su propio `README.md` con:
- **Objetivo**: qué vas a construir.
- **Qué vas a aprender**: conceptos concretos.
- **Entregable**: qué debe existir al terminar.
- **Criterios de "hecho"**: cómo saber que quedó completo (incluye tests/CI cuando aplica).

La mayoría de los proyectos son en Python, pero el stack se elige según lo que mejor sirva para
aprender cada tema (por ejemplo, un frontend simple en el proyecto 07).

## Requisitos generales

- Python 3.11+
- `pip install -r requirements.txt` dentro de cada proyecto (cada uno declara sus propias deps)
- `pytest` para correr tests de un proyecto: `cd projects/NN-nombre && pytest`

## CI

GitHub Actions (`.github/workflows/ci.yml`) corre los tests de cada proyecto que tenga una carpeta
`tests/`, de forma independiente.
