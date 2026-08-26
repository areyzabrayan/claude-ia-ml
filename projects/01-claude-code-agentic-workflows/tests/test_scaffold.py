import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from scaffold import ScaffoldError, create_project


def test_create_project_happy_path(tmp_path):
    project_dir = create_project("08", "Fine-Tuning Básico", projects_dir=tmp_path)

    assert project_dir == tmp_path / "08-fine-tuning-basico"
    assert (project_dir / "README.md").exists()
    assert (project_dir / "requirements.txt").exists()
    assert (project_dir / "tests" / "test_placeholder.py").exists()

    readme = (project_dir / "README.md").read_text()
    assert "08 · Fine-Tuning Básico" in readme


def test_create_project_rejects_duplicate_number(tmp_path):
    create_project("08", "Primer tema", projects_dir=tmp_path)

    with pytest.raises(ScaffoldError, match="Ya existe un proyecto"):
        create_project("08", "Otro tema", projects_dir=tmp_path)


def test_create_project_rejects_non_numeric_number(tmp_path):
    with pytest.raises(ScaffoldError, match="numérico"):
        create_project("abc", "Algún tema", projects_dir=tmp_path)


def test_create_project_rejects_title_without_valid_chars(tmp_path):
    with pytest.raises(ScaffoldError, match="no produce un nombre"):
        create_project("09", "###", projects_dir=tmp_path)


def test_create_project_slugifies_title(tmp_path):
    project_dir = create_project("10", "RAG + Embeddings!!", projects_dir=tmp_path)
    assert project_dir.name == "10-rag-embeddings"
