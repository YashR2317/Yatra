"""
BrajYatra Python Backend Tests
===============================
Converted from Vitest to pytest.
Tests: geo utils, scoring, helpers, budget, database, API endpoints.
"""

import pytest
import math
import json
import sys
from pathlib import Path


# ─── Geo Utilities Tests ────────────────────────────────────

class TestGeoUtils:
    """Tests for agent/utils/geo.py — haversine distance and route optimization."""

    def test_haversine_zero_distance(self):
        from agent.utils.geo import haversine
        assert haversine(27.4924, 77.6737, 27.4924, 77.6737) == 0.0

    def test_haversine_known_distance(self):
        from agent.utils.geo import haversine
        # Mathura to Vrindavan ≈ 12-15 km
        dist = haversine(27.4924, 77.6737, 27.5744, 77.6997)
        assert 8 < dist < 15

    def test_haversine_mathura_agra(self):
        from agent.utils.geo import haversine
        # Mathura to Agra ≈ 55-60 km
        dist = haversine(27.4924, 77.6737, 27.1751, 78.0421)
        assert 40 < dist < 70

    def test_city_centroids_exist(self):
        from agent.utils.geo import get_city_centroid
        for city in ["mathura", "vrindavan", "agra", "govardhan", "barsana", "gokul"]:
            centroid = get_city_centroid(city)
            assert centroid is not None, f"Missing centroid for {city}"
            assert "lat" in centroid and "lng" in centroid

    def test_optimize_route_preserves_all_places(self):
        from agent.utils.geo import optimize_route
        places = [
            {"id": "a", "lat": 27.5, "lng": 77.7},
            {"id": "b", "lat": 27.6, "lng": 77.8},
            {"id": "c", "lat": 27.4, "lng": 77.6},
        ]
        result = optimize_route(places, 27.5, 77.7)
        assert len(result) == 3
        assert {p["id"] for p in result} == {"a", "b", "c"}

    def test_optimize_route_single_place(self):
        from agent.utils.geo import optimize_route
        places = [{"id": "a", "lat": 27.5, "lng": 77.7}]
        result = optimize_route(places, 27.5, 77.7)
        assert len(result) == 1

    def test_estimate_travel_time(self):
        from agent.utils.geo import estimate_travel_time
        # Short distance, should be a few minutes
        time_mins = estimate_travel_time(27.4924, 77.6737, 27.5, 77.68)
        assert 0 < time_mins < 30


# ─── Helper Utilities Tests ─────────────────────────────────

class TestHelpers:
    """Tests for agent/utils/helpers.py."""

    def test_parse_tags_valid_json(self):
        from agent.utils.helpers import parse_tags
        result = parse_tags('["temple", "heritage"]')
        assert result == ["temple", "heritage"]

    def test_parse_tags_empty(self):
        from agent.utils.helpers import parse_tags
        assert parse_tags("") == []
        assert parse_tags(None) == []

    def test_parse_tags_invalid_json(self):
        from agent.utils.helpers import parse_tags
        assert parse_tags("not json") == []

    def test_sanitize_input_strips_html(self):
        from agent.utils.helpers import sanitize_input
        result = sanitize_input("<script>alert('xss')</script>Hello")
        assert "<script>" not in result
        assert "Hello" in result

    def test_sanitize_input_length_limit(self):
        from agent.utils.helpers import sanitize_input
        long_input = "a" * 3000
        result = sanitize_input(long_input)
        assert len(result) == 2000

    def test_format_place_for_llm(self):
        from agent.utils.helpers import format_place_for_llm
        place = {
            "id": "test_001",
            "name": "Test Temple",
            "city": "Mathura",
            "category": "Temple",
            "description": "A very long description " * 20,
            "opening_hours": "6:00-12:00",
            "estimated_visit_duration": 60,
            "crowd_level": "high",
            "highlight": 1,
            "best_time_to_visit": "morning",
            "entry_fee": 0,
        }
        result = format_place_for_llm(place)
        assert result["id"] == "test_001"
        assert len(result["description"]) <= 120
        assert result["highlight"] is True

    def test_generate_id(self):
        from agent.utils.helpers import generate_id
        id1 = generate_id()
        id2 = generate_id()
        assert id1 != id2
        assert len(id1) > 10


# ─── Scoring Tests ───────────────────────────────────────────

class TestScoring:
    """Tests for agent/agents/scoring.py."""

    def test_score_place_with_matching_interest(self):
        from agent.agents.scoring import score_place
        place = {
            "category": "Temple",
            "tags": '["pilgrimage", "heritage"]',
            "popularity_rank": 1,
            "highlight": True,
            "crowd_level": "medium",
            "estimated_visit_duration": 60,
            "entry_fee": 0,
            "city": "Mathura",
        }
        intent = {"interests": ["pilgrimage"], "group_type": "family", "budget_level": "medium"}
        score = score_place(place, intent)
        assert score > 0, "Matching interest should give positive score"

    def test_score_place_highlight_boost(self):
        from agent.agents.scoring import score_place
        place_highlight = {
            "category": "Temple",
            "tags": "[]",
            "popularity_rank": 5,
            "highlight": True,
            "crowd_level": "medium",
            "entry_fee": 0,
            "city": "Mathura",
        }
        place_no_highlight = {**place_highlight, "highlight": False}
        intent = {"interests": [], "group_type": "family", "budget_level": "medium"}
        s1 = score_place(place_highlight, intent)
        s2 = score_place(place_no_highlight, intent)
        assert s1 > s2, "Highlighted places should score higher"

    def test_rank_places_returns_sorted(self):
        from agent.agents.scoring import rank_places
        places = [
            {"id": "a", "category": "Market", "tags": "[]", "popularity_rank": 50, "highlight": False, "crowd_level": "low", "entry_fee": 0, "city": "Mathura"},
            {"id": "b", "category": "Temple", "tags": '["pilgrimage"]', "popularity_rank": 1, "highlight": True, "crowd_level": "medium", "entry_fee": 0, "city": "Mathura"},
        ]
        intent = {"interests": ["pilgrimage"], "group_type": "family", "budget_level": "medium"}
        ranked = rank_places(places, intent)
        assert ranked[0]["id"] == "b", "Temple with matching interest should rank first"


# ─── Budget Calculator Tests ────────────────────────────────

class TestBudget:
    """Tests for agent/agents/budget.py."""

    def test_budget_estimate_basic(self):
        from agent.agents.budget import estimate_budget
        result = estimate_budget(
            places=[{"entry_fee": 50}, {"entry_fee": 0}],
            days=2,
            budget_level="medium",
            people=2,
            cities=["Mathura"],
        )
        assert result["total"] > 0
        assert result["currency"] == "INR"
        assert result["per_person"] > 0
        assert result["days"] == 2
        assert result["people"] == 2

    def test_budget_low_vs_high(self):
        from agent.agents.budget import estimate_budget
        low = estimate_budget(days=2, budget_level="low", people=2, cities=["Mathura"])
        high = estimate_budget(days=2, budget_level="high", people=2, cities=["Mathura"])
        assert high["total"] > low["total"], "High budget should cost more than low"

    def test_budget_multi_city(self):
        from agent.agents.budget import estimate_budget
        result = estimate_budget(
            days=3, budget_level="medium", people=2, cities=["Mathura", "Vrindavan", "Agra"]
        )
        assert result["total"] > 0
        assert len(result["cities"]) == 3


# ─── Diversity Tests ────────────────────────────────────────

class TestDiversity:
    """Tests for agent/agents/diversity.py."""

    def test_enforce_diversity_limits_category(self):
        from agent.agents.diversity import enforce_diversity
        places = [
            {"id": f"t{i}", "category": "Temple", "city": "Mathura", "popularity_rank": i, "highlight": False}
            for i in range(10)
        ]
        result = enforce_diversity(places, {"maxPerCategory": 3, "totalNeeded": 5, "cities": ["Mathura"], "minPerCity": 2})
        temple_count = sum(1 for p in result if p["category"] == "Temple")
        assert temple_count <= 4  # max + possible gem overflow

    def test_enforce_diversity_ensures_city_minimum(self):
        from agent.agents.diversity import enforce_diversity
        places = [
            {"id": f"m{i}", "category": "Temple", "city": "Mathura", "popularity_rank": i, "highlight": False}
            for i in range(5)
        ] + [
            {"id": f"v{i}", "category": "Ghat", "city": "Vrindavan", "popularity_rank": i, "highlight": False}
            for i in range(5)
        ]
        result = enforce_diversity(places, {
            "maxPerCategory": 3,
            "totalNeeded": 8,
            "cities": ["Mathura", "Vrindavan"],
            "minPerCity": 3,
        })
        mathura_count = sum(1 for p in result if p["city"] == "Mathura")
        vrindavan_count = sum(1 for p in result if p["city"] == "Vrindavan")
        assert mathura_count >= 3
        assert vrindavan_count >= 3


# ─── Place Images Tests ─────────────────────────────────────

class TestPlaceImages:
    """Tests for agent/utils/place_images.py."""

    def test_get_place_image_with_id(self):
        from agent.utils.place_images import get_place_image
        place = {"id": "mathura_001", "city": "Mathura", "category": "Temple"}
        img = get_place_image(place)
        assert img.startswith("/assets/images/")

    def test_get_place_image_fallback_to_city(self):
        from agent.utils.place_images import get_place_image
        place = {"id": "unknown_999", "city": "Agra", "category": "Unknown"}
        img = get_place_image(place)
        assert img.startswith("/assets/images/")

    def test_enrich_with_image(self):
        from agent.utils.place_images import enrich_with_image
        place = {"id": "vrindavan_001", "city": "Vrindavan", "category": "Temple"}
        enriched = enrich_with_image(place)
        assert "image_url" in enriched


# ─── Config Tests ────────────────────────────────────────────

class TestConfig:
    """Tests for config.py."""

    def test_settings_loads(self):
        from config import get_settings
        settings = get_settings()
        assert settings is not None
        assert isinstance(settings.AGENT_PORT, int)

    def test_allowed_origins_list(self):
        from config import get_settings
        settings = get_settings()
        origins = settings.allowed_origins_list
        assert isinstance(origins, list)


# ─── Validators Tests ───────────────────────────────────────

class TestValidators:
    """Tests for shared/validators.py."""

    def test_signup_valid(self):
        from shared.validators import SignupRequest
        req = SignupRequest(name="Test User", email="test@example.com", password="password123")
        assert req.name == "Test User"
        assert req.email == "test@example.com"

    def test_signup_invalid_email(self):
        from shared.validators import SignupRequest
        with pytest.raises(Exception):
            SignupRequest(name="Test", email="notanemail", password="password123")

    def test_chat_request_valid(self):
        from shared.validators import ChatRequest
        req = ChatRequest(message="Hello, what is Mathura?")
        assert req.message == "Hello, what is Mathura?"
        assert req.language == "en"

    def test_chat_request_empty_message(self):
        from shared.validators import ChatRequest
        with pytest.raises(Exception):
            ChatRequest(message="")

    def test_itinerary_request_defaults(self):
        from shared.validators import ItineraryRequest
        req = ItineraryRequest()
        assert req.days == 1
        assert req.pace == "moderate"
        assert req.cities == []
