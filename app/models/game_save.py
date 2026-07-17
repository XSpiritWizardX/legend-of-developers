from datetime import datetime, timezone

from .db import db, environment, SCHEMA, add_prefix_for_prod


class GameSave(db.Model):
    __tablename__ = "game_saves"

    if environment == "production":
        __table_args__ = (
            db.UniqueConstraint("user_id", "slot"),
            {"schema": SCHEMA},
        )
    else:
        __table_args__ = (db.UniqueConstraint("user_id", "slot"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("users.id")),
        nullable=False,
    )
    slot = db.Column(db.Integer, nullable=False, default=1)
    data = db.Column(db.JSON, nullable=False, default=dict)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", back_populates="game_saves")

    def to_dict(self):
        return {
            "id": self.id,
            "slot": self.slot,
            "data": self.data,
            "updated_at": self.updated_at.isoformat(),
        }
