import pytest


def test_anonymous_user_cannot_read_saves(anonymous_client):
    # An unauthenticated request should be rejected instead of exposing save data.
    response = anonymous_client.get("/api/game/saves", follow_redirects=True)
    assert response.status_code == 401
    assert response.get_json()["errors"]["message"] == "Unauthorized"


def test_save_payload_must_be_an_object(client):
    # The API should reject the edge case where save data is a scalar value.
    response = client.put("/api/game/saves/1", json={"data": "invalid"})
    assert response.status_code == 400
    assert response.get_json() == {"error": "Save data must be an object."}


def test_create_and_read_save(client):
    # A normal save request should persist data that can be read from the same slot.
    payload = {"mapId": "overworld", "player": {"hp": 6}}
    created = client.put("/api/game/saves/1", json={"data": payload})
    fetched = client.get("/api/game/saves/1")
    assert created.status_code == 200
    assert fetched.get_json()["save"]["data"] == payload


def test_three_sigil_save_is_promoted_to_completed_game(client):
    payload = {
        "mapId": "d03",
        "flags": {"firstWebpage": True, "reactApp": True, "backendApi": True},
        "player": {"hp": 8, "hasEmber": False},
    }
    response = client.put("/api/game/saves/1", json={"data": payload})
    data = response.get_json()["save"]["data"]
    assert response.status_code == 200
    assert data["flags"]["questComplete"] is True
    assert data["player"]["hasEmber"] is True
    assert payload["flags"].get("questComplete") is None


def test_put_existing_slot_updates_in_place(client):
    # Saving twice to one slot should update the existing record, not duplicate it.
    first = client.put("/api/game/saves/2", json={"data": {"coins": 1}}).get_json()["save"]
    second = client.put("/api/game/saves/2", json={"data": {"coins": 99}}).get_json()["save"]
    assert second["id"] == first["id"]
    assert second["data"] == {"coins": 99}


def test_list_saves_orders_slots_numerically(client):
    # Multiple saves should be returned in slot order regardless of creation order.
    client.put("/api/game/saves/3", json={"data": {}})
    client.put("/api/game/saves/1", json={"data": {}})
    response = client.get("/api/game/saves")
    assert [save["slot"] for save in response.get_json()["saves"]] == [1, 3]


def test_delete_missing_slot_is_idempotent(client):
    # Deleting an empty valid slot should still report success.
    response = client.delete("/api/game/saves/3")
    assert response.status_code == 200
    assert response.get_json() == {"message": "Save file deleted."}


@pytest.mark.parametrize("slot", [0, 4, 99])
def test_save_slot_outside_limit_is_rejected(client, slot):
    response = client.put(f"/api/game/saves/{slot}", json={"data": {}})
    assert response.status_code == 400
    assert response.get_json() == {"error": "Save slot must be between 1 and 3."}


def test_read_and_delete_outside_limit_are_rejected(client):
    assert client.get("/api/game/saves/4").status_code == 400
    assert client.delete("/api/game/saves/4").status_code == 400
