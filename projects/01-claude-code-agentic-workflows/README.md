# 01 · Claude Code en el flujo de trabajo diario

## Objetivo
Usar Claude Code como herramienta real dentro de este mismo repositorio: crear un comando
personalizado (`/new-project`) que automatiza una tarea repetitiva y molesta — scaffolding de un
nuevo proyecto de aprendizaje siguiendo la convención del repo — respaldado por código testeado.

## Qué vas a aprender
- Comandos personalizados de Claude Code (`.claude/commands/`).
- Cómo diseñar una automatización para que sea confiable (falla claro, no rompe nada existente).
- Separar la "herramienta de IA" (el comando) de la lógica que hace el trabajo real (Python
  testeable), para poder confiar en la automatización sin tener que confiar ciegamente en el LLM.

## Entregable
- `.claude/commands/new-project.md`: slash command que scaffoldea un nuevo proyecto.
- `scaffold.py`: lógica de scaffolding, invocable también directo por CLI (sin Claude Code).
- `tests/test_scaffold.py`: tests que cubren el camino feliz y errores esperados.

## Uso

```bash
# Directo por CLI, desde la raíz del repo:
python projects/01-claude-code-agentic-workflows/scaffold.py 08 "mi-nuevo-tema"

# O dentro de Claude Code, en este repo:
/new-project 08 "mi-nuevo-tema"
```

Esto crea `projects/08-mi-nuevo-tema/` con `README.md` (plantilla con las mismas secciones que
los demás proyectos), `requirements.txt` y `tests/`.

## Criterios de "hecho"
- [x] Comando funcional dentro de Claude Code.
- [x] Lógica de scaffolding con tests automatizados (no depende de que el LLM "lo haga bien").
- [x] Falla con un mensaje claro si el número de proyecto ya existe, en vez de sobrescribir.
