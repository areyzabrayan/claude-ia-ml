# 04 · Orquestación de agentes LLM

## Objetivo
Construir un agente que resuelve una tarea en varios pasos usando tool calling (funciones que el
modelo puede invocar), no solo un prompt de una sola pasada.

## Qué vas a aprender
- Diseño de herramientas (tools) con esquemas claros para que el modelo las use bien.
- Bucle agente: pensar → llamar herramienta → observar resultado → repetir hasta terminar.
- Manejo de errores de herramientas y límites (máx. de pasos, timeouts) para evitar loops infinitos.
- Trade-offs de usar un framework (LangChain/LlamaIndex/SDK propio) vs. implementar el loop a mano.

## Entregable
- Un agente CLI que resuelve una tarea concreta de varios pasos (ej. "investiga un tema usando
  búsqueda + resume + guarda el resultado en un archivo").
- Al menos 3 herramientas (tools) distintas expuestas al agente.
- Log legible de cada paso que tomó el agente (para poder auditar su razonamiento).

## Criterios de "hecho"
- [ ] El agente completa la tarea de punta a punta sin intervención manual.
- [ ] Límite de pasos explícito y manejo de fallos de herramientas sin crashear.
- [ ] Tests que mockean las herramientas y verifican que el agente las llama con los argumentos
      esperados ante inputs conocidos.
