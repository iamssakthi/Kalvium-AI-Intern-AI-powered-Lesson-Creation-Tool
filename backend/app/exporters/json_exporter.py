import json
from pathlib import Path
from typing import Dict, Any

def export_lesson_package_json(data: Dict[str, Any], output_path: str) -> str:
    """Export complete lesson package including research sources, sections, and QC audits to JSON."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    return output_path

