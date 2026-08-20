def test_health_check_reports_player_readiness(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.get_json() == {
        "status": "ok",
        "database": "ok",
    }
