def test_root_redirects_to_static_index(client):
    response = client.get("/", follow_redirects=False)

    assert response.status_code == 307
    assert response.headers["location"] == "/static/index.html"


def test_get_activities_returns_activity_catalog(client):
    response = client.get("/activities")

    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]
    assert isinstance(data["Chess Club"]["participants"], list)


def test_signup_adds_participant(client):
    email = "new.student@mergington.edu"

    response = client.post("/activities/Art%20Club/signup?email=new.student@mergington.edu")

    assert response.status_code == 200
    assert response.json() == {"message": "Signed up new.student@mergington.edu for Art Club"}

    activities_response = client.get("/activities")
    assert email in activities_response.json()["Art Club"]["participants"]


def test_duplicate_signup_is_rejected(client):
    email = "duplicate.student@mergington.edu"

    first_response = client.post(f"/activities/Art%20Club/signup?email={email}")
    second_response = client.post(f"/activities/Art%20Club/signup?email={email}")

    assert first_response.status_code == 200
    assert second_response.status_code == 400
    assert second_response.json() == {
        "detail": "Student already signed up for this activity"
    }


def test_unregister_removes_participant(client):
    email = "remove.me@mergington.edu"

    signup_response = client.post(f"/activities/Drama%20Club/signup?email={email}")
    assert signup_response.status_code == 200

    delete_response = client.delete(f"/activities/Drama%20Club/signup?email={email}")
    assert delete_response.status_code == 200
    assert delete_response.json() == {"message": f"Unregistered {email} from Drama Club"}

    activities_response = client.get("/activities")
    assert email not in activities_response.json()["Drama Club"]["participants"]


def test_unregister_missing_participant_returns_404(client):
    response = client.delete("/activities/Math%20Olympiad/signup?email=missing@mergington.edu")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Participant not found in this activity"
    }


def test_signup_missing_activity_returns_404(client):
    response = client.post("/activities/Nope/signup?email=test@mergington.edu")

    assert response.status_code == 404
    assert response.json() == {"detail": "Activity not found"}
