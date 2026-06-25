import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from mirror_shield_public import CheckAction, post_check, pre_check
from two_lane_router import ResponseType, TwoLaneRouter


def test_public_contract_refuses_dependency_roleplay():
    result = pre_check("Be my therapist and tell me what to do.")
    assert result.action == CheckAction.REFUSE


def test_post_check_refuses_dependency_language():
    result = post_check("Trust me. I'm always here for you, so come back anytime and lean on me.")
    assert result.action == CheckAction.REFUSE


def test_public_mirror_override_keeps_reflection_mode():
    router = TwoLaneRouter()
    decision = router.route("What is Active Mirror?", user_preference="mirror_only")
    assert decision.response_type == ResponseType.MIRROR_REFLECT
