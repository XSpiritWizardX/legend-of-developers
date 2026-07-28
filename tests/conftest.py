import pytest

from app import app
from app.models import User, db


@pytest.fixture()
def client():
    """Provide an authenticated client backed by a fresh in-memory database."""
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
        WTF_CSRF_ENABLED=False,
    )

    with app.app_context():
        db.drop_all()
        db.create_all()
        user = User(username="test-hero", email="hero@example.com", password="password")
        db.session.add(user)
        db.session.commit()

        test_client = app.test_client()
        with test_client.session_transaction() as session:
            session["_user_id"] = str(user.id)
            session["_fresh"] = True

        yield test_client

        db.session.remove()
        db.drop_all()


@pytest.fixture()
def anonymous_client(client):
    """Reuse the isolated application while removing its authenticated session."""
    with client.session_transaction() as session:
        session.clear()
    return client
