#!/usr/bin/env python3
"""Scaffold a new numbered learning project under projects/."""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PROJECTS_DIR = REPO_ROOT / "projects"

README_TEMPLATE = """# {number} · {title}

## Objetivo
TODO: describe qué vas a construir.

## Qué vas a aprender
- TODO

## Entregable
- TODO

## Criterios de "hecho"
- [ ] TODO
"""

REQUIREMENTS_TEMPLATE = "pytest\n"

TEST_PLACEHOLDER = '''def test_placeholder():
    """Reemplazar por tests reales del proyecto."""
    assert True
'''


class ScaffoldError(Exception):
    pass


def _slugify(title: str) -> str:
    normalized = unicodedata.normalize("NFKD", title.strip().lower())
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_only).strip("-")
    if not slug:
        raise ScaffoldError(f"El título '{title}' no produce un nombre de carpeta válido")
    return slug


def create_project(number: str, title: str, projects_dir: Path = PROJECTS_DIR) -> Path:
    if not re.fullmatch(r"\d{2,}", number):
        raise ScaffoldError(f"El número de proyecto debe ser numérico (ej. '08'), recibido: '{number}'")

    slug = _slugify(title)
    folder_name = f"{number}-{slug}"

    existing = {p.name for p in projects_dir.glob(f"{number}-*")} if projects_dir.exists() else set()
    if existing:
        raise ScaffoldError(
            f"Ya existe un proyecto con el número {number}: {sorted(existing)[0]}"
        )

    project_dir = projects_dir / folder_name
    project_dir.mkdir(parents=True, exist_ok=False)
    (project_dir / "tests").mkdir()

    (project_dir / "README.md").write_text(
        README_TEMPLATE.format(number=number, title=title), encoding="utf-8"
    )
    (project_dir / "requirements.txt").write_text(REQUIREMENTS_TEMPLATE, encoding="utf-8")
    (project_dir / "tests" / "test_placeholder.py").write_text(TEST_PLACEHOLDER, encoding="utf-8")

    return project_dir


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("number", help="Número del proyecto, ej. 08")
    parser.add_argument("title", help="Título/tema del proyecto, ej. 'fine-tuning-basico'")
    args = parser.parse_args(argv)

    try:
        project_dir = create_project(args.number, args.title)
    except ScaffoldError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    print(f"Proyecto creado en {project_dir.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
