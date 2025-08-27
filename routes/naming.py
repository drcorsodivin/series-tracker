# routes/naming.py
import json, os
from flask import Blueprint, jsonify, request

naming_bp = Blueprint("naming", __name__, url_prefix="/api/naming")
_patterns = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "patterns.json"))

def _defaults():
    return {"series": [], "season": [], "quality": [], "resolution": []}

def _load():
    if not os.path.isfile(_patterns): return _defaults()
    try:
        with open(_patterns, "r", encoding="utf-8") as f:
            data = json.load(f)
        for k in _defaults(): data.setdefault(k, [])
        return data
    except Exception:
        return _defaults()

def _save(data: dict):
    clean = {k: data.get(k, []) for k in _defaults()}
    with open(_patterns, "w", encoding="utf-8") as f:
        json.dump(clean, f, ensure_ascii=False, indent=2)

@naming_bp.get("/patterns")
def get_patterns(): return jsonify(_load())

@naming_bp.post("/patterns")
def update_patterns():
    try:
        payload = request.get_json(force=True)
        if not isinstance(payload, dict): raise ValueError
    except Exception:
        return jsonify({"success": False, "error": "Неверный формат данных."}), 400
    _save(payload)
    return jsonify({"success": True, "patterns": _load()})
