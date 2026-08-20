from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from app.models import GameSave, db

game_routes = Blueprint("game", __name__)
VALID_SAVE_SLOTS = frozenset({1, 2, 3})


def _invalid_slot_response(slot):
    if slot in VALID_SAVE_SLOTS:
        return None
    return jsonify({"error": "Save slot must be between 1 and 3."}), 400


@game_routes.get("/saves/<int:slot>")
@login_required
def get_save(slot):
    invalid = _invalid_slot_response(slot)
    if invalid:
        return invalid
    save = GameSave.query.filter_by(user_id=current_user.id, slot=slot).first()
    return jsonify({"save": save.to_dict() if save else None})


@game_routes.get("/saves")
@login_required
def get_saves():
    saves = GameSave.query.filter_by(user_id=current_user.id).order_by(GameSave.slot)
    return jsonify({"saves": [save.to_dict() for save in saves]})


@game_routes.put("/saves/<int:slot>")
@login_required
def put_save(slot):
    invalid = _invalid_slot_response(slot)
    if invalid:
        return invalid
    payload = request.get_json(silent=True) or {}
    data = payload.get("data")
    if not isinstance(data, dict):
        return jsonify({"error": "Save data must be an object."}), 400

    save = GameSave.query.filter_by(user_id=current_user.id, slot=slot).first()
    if save is None:
        save = GameSave(user_id=current_user.id, slot=slot)
        db.session.add(save)
    save.data = data
    save.updated_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({"save": save.to_dict()})


@game_routes.delete("/saves/<int:slot>")
@login_required
def delete_save(slot):
    invalid = _invalid_slot_response(slot)
    if invalid:
        return invalid
    save = GameSave.query.filter_by(user_id=current_user.id, slot=slot).first()
    if save:
        db.session.delete(save)
        db.session.commit()
    return jsonify({"message": "Save file deleted."})
