import os
from pathlib import Path


def print_project_structure(root_dir, max_level=None, exclude_dirs=None, exclude_extensions=None):
    """
    Печатает древовидную структуру проекта, исключая указанные директории и файлы.

    :param root_dir: Корневая директория проекта
    :param max_level: Максимальный уровень вложенности (None - без ограничений)
    :param exclude_dirs: Список директорий для исключения
    :param exclude_extensions: Список расширений файлов для исключения
    """
    if exclude_dirs is None:
        exclude_dirs = {'venv', '__pycache__', '.idea', '.git', 'migrations', 'static', 'templates'}
    if exclude_extensions is None:
        exclude_extensions = {'.pyc', '.pth', '.pyo', '.dist-info'}

    root_path = Path(root_dir)
    prefix = "│   "

    print(f"{root_path.name}/")

    for root, dirs, files in os.walk(root_dir):
        # Фильтрация директорий
        dirs[:] = [d for d in dirs if d not in exclude_dirs]

        level = root.replace(str(root_dir), '').count(os.sep)
        if max_level is not None and level > max_level:
            continue

        indent = prefix * (level - 1) + "├───" if level > 0 else ""

        # Вывод текущей директории
        relative_path = os.path.relpath(root, root_dir)
        if relative_path != ".":
            print(f"{indent}{os.path.basename(root)}/")

        # Вывод файлов
        sub_indent = prefix * level + "├───" if level >= 0 else ""
        for f in files:
            if any(f.endswith(ext) for ext in exclude_extensions):
                continue
            print(f"{sub_indent}{f}")


if __name__ == "__main__":
    project_root = os.getcwd()  # Текущая директория или укажите путь вручную: r'C:\path\to\project'
    print("Структура Django-проекта:")
    print_project_structure(
        root_dir=project_root,
        max_level=4,  # Ограничение глубины вложенности
        exclude_dirs={'venv', '__pycache__', '.idea', '.git', 'node_modules'},
        exclude_extensions={'.pyc', '.pth', '.pyo', '.cache', '.sqlite3'}
    )