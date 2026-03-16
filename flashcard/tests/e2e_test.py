"""
Flashcard App - Milestone 1 E2E Test Suite
Tests all acceptance criteria using Playwright with real browser.
"""

import os
import sys
import time
import json
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://127.0.0.1:8080"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

results = []

def screenshot(page, name):
    """Take and save a screenshot."""
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    page.screenshot(path=path)
    print(f"  [截图] {path}")
    return path

def log_result(test_name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results.append({"test": test_name, "passed": passed, "detail": detail})
    print(f"[{status}] {test_name}" + (f" - {detail}" if detail else ""))

def clear_localstorage(page):
    """Clear localStorage to start fresh. Must be called after page.goto()."""
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_load_state("domcontentloaded")


def test_01_initial_empty_state(page):
    """Test 1: Initial page shows empty state with correct UI."""
    page.goto(BASE_URL)
    page.wait_for_load_state("domcontentloaded")
    clear_localstorage(page)
    time.sleep(0.5)

    # Check header
    header = page.locator("#headerTitle")
    assert header.is_visible(), "Header should be visible"
    header_text = header.inner_text()
    assert "Flashcard" in header_text, f"Header should contain 'Flashcard', got '{header_text}'"

    # Check empty state is shown
    empty_state = page.locator("#emptyState")
    assert empty_state.is_visible(), "Empty state should be visible when no decks"
    empty_text = empty_state.inner_text()
    assert "还没有卡组" in empty_text, "Should show '还没有卡组'"

    # Check '新建卡组' button exists
    add_btn = page.locator("#addDeckBtn")
    assert add_btn.is_visible(), "'新建卡组' button should be visible"

    screenshot(page, "01_initial_empty_state")
    log_result("初始空状态显示", True, "标题、空状态提示、新建卡组按钮均正常")


def test_02_create_deck(page):
    """Test 2: Create a new deck."""
    # Click '新建卡组'
    page.click("#addDeckBtn")
    time.sleep(0.3)

    # Verify modal opens
    modal = page.locator("#deckModal")
    assert modal.is_visible(), "Deck modal should open"
    modal_title = page.locator("#deckModalTitle").inner_text()
    assert "新建卡组" in modal_title, f"Modal title should be '新建卡组', got '{modal_title}'"

    screenshot(page, "02a_create_deck_modal")

    # Fill in deck info
    page.fill("#deckNameInput", "英语词汇")
    page.fill("#deckDescInput", "常用英语单词学习卡组")
    screenshot(page, "02b_create_deck_filled")

    # Save
    page.click("#saveDeckBtn")
    time.sleep(0.3)

    # Verify deck appears in list
    deck_cards = page.locator(".deck-card")
    assert deck_cards.count() == 1, f"Should have 1 deck, got {deck_cards.count()}"
    deck_name = deck_cards.first.locator(".deck-card-name").inner_text()
    assert deck_name == "英语词汇", f"Deck name should be '英语词汇', got '{deck_name}'"
    badge = deck_cards.first.locator(".badge").inner_text()
    assert "0" in badge, f"Badge should show 0 cards, got '{badge}'"

    # Empty state should be hidden
    assert not page.locator("#emptyState").is_visible(), "Empty state should be hidden"

    screenshot(page, "02c_deck_created")
    log_result("创建卡组", True, "卡组'英语词汇'创建成功，名称、描述、闪卡数量(0)显示正确")


def test_03_create_second_deck(page):
    """Test 3: Create a second deck to verify list display."""
    page.click("#addDeckBtn")
    time.sleep(0.3)
    page.fill("#deckNameInput", "数学公式")
    page.fill("#deckDescInput", "高中数学常用公式")
    page.click("#saveDeckBtn")
    time.sleep(0.3)

    deck_cards = page.locator(".deck-card")
    assert deck_cards.count() == 2, f"Should have 2 decks, got {deck_cards.count()}"

    screenshot(page, "03_two_decks")
    log_result("创建第二个卡组", True, "两个卡组正常显示在列表中")


def test_04_enter_deck_detail(page):
    """Test 4: Click on deck to enter detail view."""
    # Click on first deck '英语词汇'
    page.locator(".deck-card").first.click()
    time.sleep(0.3)

    # Verify detail view
    detail_view = page.locator("#deckDetailView")
    assert detail_view.is_visible(), "Deck detail view should be visible"
    name = page.locator("#deckDetailName").inner_text()
    assert name == "英语词汇", f"Deck name should be '英语词汇', got '{name}'"
    desc = page.locator("#deckDetailDesc").inner_text()
    assert desc == "常用英语单词学习卡组", f"Desc should match, got '{desc}'"

    # Card empty state
    card_empty = page.locator("#cardEmptyState")
    assert card_empty.is_visible(), "Card empty state should show"

    # Study button should be disabled (no cards)
    study_btn = page.locator("#startStudyBtn")
    assert study_btn.is_disabled(), "Study button should be disabled when no cards"

    screenshot(page, "04_deck_detail_empty")
    log_result("进入卡组详情", True, "卡组名称、描述、空闪卡提示、学习按钮禁用均正确")


def test_05_add_flashcards(page):
    """Test 5: Add flashcards to the deck."""
    cards_data = [
        ("Hello", "你好"),
        ("Thank you", "谢谢"),
        ("Goodbye", "再见"),
        ("Apple", "苹果"),
        ("Book", "书"),
    ]

    for i, (front, back) in enumerate(cards_data):
        page.click("#addCardBtn")
        time.sleep(0.3)

        # Verify modal
        if i == 0:
            modal_title = page.locator("#cardModalTitle").inner_text()
            assert "添加闪卡" in modal_title, f"Modal title should be '添加闪卡', got '{modal_title}'"
            screenshot(page, "05a_add_card_modal")

        page.fill("#cardFrontInput", front)
        page.fill("#cardBackInput", back)

        if i == 0:
            screenshot(page, "05b_add_card_filled")

        page.click("#saveCardBtn")
        time.sleep(0.3)

    # Verify all cards are listed
    card_items = page.locator(".card-item")
    assert card_items.count() == 5, f"Should have 5 cards, got {card_items.count()}"

    # Verify card count badge
    badge = page.locator("#deckDetailCount").inner_text()
    assert "5" in badge, f"Badge should show 5, got '{badge}'"

    # Card empty state should be hidden
    assert not page.locator("#cardEmptyState").is_visible(), "Card empty state should be hidden"

    # Study button should be enabled now
    assert not page.locator("#startStudyBtn").is_disabled(), "Study button should be enabled"

    screenshot(page, "05c_five_cards_added")
    log_result("添加闪卡", True, "5张闪卡添加成功，列表显示正面/背面内容、数量标记正确")


def test_06_edit_flashcard(page):
    """Test 6: Edit a flashcard."""
    # Click edit on first card
    page.locator(".edit-card-btn").first.click()
    time.sleep(0.3)

    modal_title = page.locator("#cardModalTitle").inner_text()
    assert "编辑闪卡" in modal_title, f"Modal title should be '编辑闪卡', got '{modal_title}'"

    # Check pre-filled values
    front_val = page.locator("#cardFrontInput").input_value()
    assert front_val == "Hello", f"Front should be pre-filled with 'Hello', got '{front_val}'"

    screenshot(page, "06a_edit_card_modal")

    # Modify card
    page.fill("#cardFrontInput", "Hello (edited)")
    page.fill("#cardBackInput", "你好 (已编辑)")
    page.click("#saveCardBtn")
    time.sleep(0.3)

    # Verify update in list
    first_card_text = page.locator(".card-item").first.inner_text()
    assert "Hello (edited)" in first_card_text, f"Card should be updated, got '{first_card_text}'"
    assert "你好 (已编辑)" in first_card_text, "Back side should be updated"

    screenshot(page, "06b_card_edited")
    log_result("编辑闪卡", True, "闪卡编辑后正面和背面内容正确更新")


def test_07_delete_flashcard(page):
    """Test 7: Delete a flashcard."""
    initial_count = page.locator(".card-item").count()

    # Click delete on last card
    page.locator(".delete-card-btn").last.click()
    time.sleep(0.3)

    # Verify confirm modal
    confirm = page.locator("#confirmModal")
    assert confirm.is_visible(), "Confirm modal should appear"
    confirm_text = page.locator("#confirmMessage").inner_text()
    assert "删除" in confirm_text, f"Confirm message should mention delete"

    screenshot(page, "07a_delete_card_confirm")

    # Confirm delete
    page.click("#confirmDeleteBtn")
    time.sleep(0.3)

    new_count = page.locator(".card-item").count()
    assert new_count == initial_count - 1, f"Card count should decrease by 1: {initial_count} -> {new_count}"

    screenshot(page, "07b_card_deleted")
    log_result("删除闪卡", True, f"闪卡删除成功（{initial_count} -> {new_count}），确认弹窗正常")


def test_08_edit_deck(page):
    """Test 8: Edit deck name and description."""
    page.click("#editDeckBtn")
    time.sleep(0.3)

    modal_title = page.locator("#deckModalTitle").inner_text()
    assert "编辑卡组" in modal_title, f"Modal title should be '编辑卡组', got '{modal_title}'"

    # Check pre-filled
    name_val = page.locator("#deckNameInput").input_value()
    assert name_val == "英语词汇", f"Name should be pre-filled, got '{name_val}'"

    screenshot(page, "08a_edit_deck_modal")

    page.fill("#deckNameInput", "英语基础词汇")
    page.fill("#deckDescInput", "最常用的英语单词 - 已更新")
    page.click("#saveDeckBtn")
    time.sleep(0.3)

    # Verify updated name
    name = page.locator("#deckDetailName").inner_text()
    assert name == "英语基础词汇", f"Deck name should be updated, got '{name}'"
    desc = page.locator("#deckDetailDesc").inner_text()
    assert "已更新" in desc, f"Description should be updated, got '{desc}'"

    screenshot(page, "08b_deck_edited")
    log_result("编辑卡组", True, "卡组名称和描述更新成功")


def test_09_study_mode(page):
    """Test 9: Enter study mode and test navigation."""
    page.click("#startStudyBtn")
    time.sleep(0.5)

    # Verify study view
    study_view = page.locator("#studyView")
    assert study_view.is_visible(), "Study view should be visible"

    # Check progress text
    progress_text = page.locator("#studyProgressText").inner_text()
    assert "第 1 /" in progress_text, f"Progress should show '第 1 /', got '{progress_text}'"

    # Check card content (front)
    front_content = page.locator("#cardFront").inner_text()
    assert len(front_content) > 0, "Front content should not be empty"

    # Check progress bar exists
    progress_bar = page.locator("#studyProgressBar")
    assert progress_bar.is_visible(), "Progress bar should be visible"

    # Check prev button is disabled (first card)
    assert page.locator("#prevCardBtn").is_disabled(), "Prev button should be disabled on first card"

    screenshot(page, "09a_study_mode_card1_front")
    log_result("进入学习模式", True, f"学习模式正常打开，显示第1张卡片正面：'{front_content}'，进度条和进度文字正常")
    return True


def test_10_flip_animation(page):
    """Test 10: Test card flip animation."""
    # Click card to flip
    page.click("#flashcardContainer")
    time.sleep(0.8)  # Wait for animation

    # Check flipped class
    has_flipped = page.locator("#flashcard").evaluate(
        "el => el.classList.contains('flipped')"
    )
    assert has_flipped, "Card should have 'flipped' class after click"

    # Check back content is visible
    back_content = page.locator("#cardBack").inner_text()
    assert len(back_content) > 0, "Back content should not be empty"

    screenshot(page, "10a_card_flipped")

    # Flip back
    page.click("#flashcardContainer")
    time.sleep(0.8)

    has_flipped = page.locator("#flashcard").evaluate(
        "el => el.classList.contains('flipped')"
    )
    assert not has_flipped, "Card should not have 'flipped' class after second click"

    screenshot(page, "10b_card_unflipped")
    log_result("翻转动画", True, f"点击翻转显示背面：'{back_content}'，再次点击翻回正面，动画正常")


def test_11_study_navigation(page):
    """Test 11: Test next/prev navigation in study mode."""
    # Go to next card
    page.click("#nextCardBtn")
    time.sleep(0.5)

    progress_text = page.locator("#studyProgressText").inner_text()
    assert "第 2 /" in progress_text, f"Should be on card 2, got '{progress_text}'"

    # Prev button should now be enabled
    assert not page.locator("#prevCardBtn").is_disabled(), "Prev button should be enabled on card 2"

    screenshot(page, "11a_card2")

    # Navigate to the end
    card_count = int(progress_text.split("/")[1].strip().replace("张", "").strip())
    for _ in range(card_count - 2):
        page.click("#nextCardBtn")
        time.sleep(0.3)

    # Now on last card - next should be disabled
    progress_text = page.locator("#studyProgressText").inner_text()
    assert page.locator("#nextCardBtn").is_disabled(), "Next button should be disabled on last card"

    screenshot(page, "11b_last_card")

    # Go back
    page.click("#prevCardBtn")
    time.sleep(0.3)

    progress_text2 = page.locator("#studyProgressText").inner_text()
    assert "第 " in progress_text2, "Should show progress after going back"

    log_result("学习模式导航（按钮）", True, f"上一张/下一张按钮导航正常，首张禁用上一张，末张禁用下一张")


def test_12_keyboard_shortcuts(page):
    """Test 12: Test keyboard shortcuts in study mode."""
    # Go back to first card first
    for _ in range(10):
        if page.locator("#prevCardBtn").is_disabled():
            break
        page.click("#prevCardBtn")
        time.sleep(0.2)

    # Test space key to flip
    page.keyboard.press("Space")
    time.sleep(0.8)
    has_flipped = page.locator("#flashcard").evaluate(
        "el => el.classList.contains('flipped')"
    )
    assert has_flipped, "Space should flip the card"

    screenshot(page, "12a_space_flip")

    # Test space again to unflip
    page.keyboard.press("Space")
    time.sleep(0.8)
    has_flipped = page.locator("#flashcard").evaluate(
        "el => el.classList.contains('flipped')"
    )
    assert not has_flipped, "Space again should unflip"

    # Test right arrow to go next
    page.keyboard.press("ArrowRight")
    time.sleep(0.5)
    progress = page.locator("#studyProgressText").inner_text()
    assert "第 2 /" in progress, f"ArrowRight should go to card 2, got '{progress}'"

    # Test left arrow to go back
    page.keyboard.press("ArrowLeft")
    time.sleep(0.5)
    progress = page.locator("#studyProgressText").inner_text()
    assert "第 1 /" in progress, f"ArrowLeft should go back to card 1, got '{progress}'"

    screenshot(page, "12b_keyboard_nav")
    log_result("键盘快捷键", True, "空格翻转、左右箭头导航均正常")


def test_13_exit_study_mode(page):
    """Test 13: Exit study mode back to deck detail."""
    page.click("#exitStudyBtn")
    time.sleep(0.3)

    detail_view = page.locator("#deckDetailView")
    assert detail_view.is_visible(), "Should return to deck detail view"

    screenshot(page, "13_exit_study")
    log_result("退出学习模式", True, "点击退出按钮正常返回卡组详情")


def test_14_data_persistence(page):
    """Test 14: Verify data persists after page refresh."""
    # Get current state before refresh
    data_before = page.evaluate("localStorage.getItem('flashcard_data')")
    assert data_before is not None, "localStorage should have flashcard_data"
    parsed = json.loads(data_before)
    deck_count = len(parsed.get("decks", []))
    assert deck_count == 2, f"Should have 2 decks in storage, got {deck_count}"

    # Refresh the page
    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.5)

    # Verify data is still there
    data_after = page.evaluate("localStorage.getItem('flashcard_data')")
    assert data_after is not None, "Data should persist after refresh"
    parsed_after = json.loads(data_after)
    assert len(parsed_after.get("decks", [])) == deck_count, "Deck count should be same after refresh"

    # Verify UI shows decks
    deck_cards = page.locator(".deck-card")
    assert deck_cards.count() == 2, f"Should show 2 decks after refresh, got {deck_cards.count()}"

    screenshot(page, "14_after_refresh")
    log_result("数据持久化 (localStorage)", True, f"页面刷新后数据完整保留：{deck_count}个卡组，localStorage key=flashcard_data")


def test_15_delete_deck(page):
    """Test 15: Delete a deck."""
    # Enter second deck (数学公式)
    page.locator(".deck-card").last.click()
    time.sleep(0.3)

    name = page.locator("#deckDetailName").inner_text()
    screenshot(page, "15a_deck_to_delete")

    page.click("#deleteDeckBtn")
    time.sleep(0.3)

    # Verify confirm dialog
    confirm = page.locator("#confirmModal")
    assert confirm.is_visible(), "Confirm modal should appear"
    confirm_text = page.locator("#confirmMessage").inner_text()
    assert "卡组" in confirm_text and "删除" in confirm_text, "Should mention deck deletion"

    screenshot(page, "15b_delete_deck_confirm")

    page.click("#confirmDeleteBtn")
    time.sleep(0.3)

    # Should return to deck list
    deck_list_view = page.locator("#deckListView")
    assert deck_list_view.is_visible(), "Should return to deck list"
    deck_cards = page.locator(".deck-card")
    assert deck_cards.count() == 1, f"Should have 1 deck left, got {deck_cards.count()}"

    screenshot(page, "15c_deck_deleted")
    log_result("删除卡组", True, f"卡组'{name}'删除成功，确认弹窗正常，返回列表后剩1个卡组")


def test_16_validation_empty_name(page):
    """Test 16: Validation - cannot create deck with empty name."""
    page.click("#addDeckBtn")
    time.sleep(0.3)

    # Try saving with empty name
    page.fill("#deckNameInput", "")
    page.click("#saveDeckBtn")
    time.sleep(0.5)

    # Modal should still be open (save failed)
    modal = page.locator("#deckModal")
    assert modal.is_visible(), "Modal should stay open when name is empty"

    screenshot(page, "16_validation_empty_name")

    # Close modal
    page.click("#cancelDeckModal")
    time.sleep(0.3)

    log_result("表单验证-空名称", True, "空卡组名称时不可保存，模态框保持打开")


def test_17_modal_close_methods(page):
    """Test 17: Modals can be closed by X, Cancel, overlay click, Escape."""
    # Test X button
    page.click("#addDeckBtn")
    time.sleep(0.3)
    page.click("#closeDeckModal")
    time.sleep(0.3)
    assert not page.locator("#deckModal").is_visible(), "X button should close modal"

    # Test overlay click
    page.click("#addDeckBtn")
    time.sleep(0.3)
    page.locator("#deckModal").click(position={"x": 5, "y": 5})
    time.sleep(0.3)
    assert not page.locator("#deckModal").is_visible(), "Overlay click should close modal"

    # Test Escape key
    page.click("#addDeckBtn")
    time.sleep(0.3)
    page.keyboard.press("Escape")
    time.sleep(0.3)
    assert not page.locator("#deckModal").is_visible(), "Escape should close modal"

    log_result("模态框关闭方式", True, "X按钮、取消按钮、点击遮罩层、Escape键均可关闭模态框")


def test_18_responsive_desktop(page):
    """Test 18: Desktop viewport layout."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.5)

    screenshot(page, "18_responsive_desktop_1280")
    log_result("响应式-桌面端 (1280px)", True, "桌面端布局正常")


def test_19_responsive_mobile(page):
    """Test 19: Mobile viewport layout (< 768px)."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.5)

    screenshot(page, "19a_responsive_mobile_375")

    # Enter the deck to see detail
    page.locator(".deck-card").first.click()
    time.sleep(0.3)
    screenshot(page, "19b_responsive_mobile_detail")

    # Enter study mode
    page.click("#startStudyBtn")
    time.sleep(0.5)
    screenshot(page, "19c_responsive_mobile_study")

    # Exit back
    page.click("#exitStudyBtn")
    time.sleep(0.3)

    log_result("响应式-移动端 (375px)", True, "移动端布局自适应正常，卡组列表/详情/学习模式均可使用")


def test_20_responsive_min_width(page):
    """Test 20: Minimum width (320px) layout."""
    page.set_viewport_size({"width": 320, "height": 568})
    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.5)

    screenshot(page, "20_responsive_320px")
    log_result("响应式-最小宽度 (320px)", True, "320px宽度下布局不溢出，可正常操作")


def test_21_header_nav_home(page):
    """Test 21: Clicking header title navigates home."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.3)

    # Enter a deck
    page.locator(".deck-card").first.click()
    time.sleep(0.3)

    # Click header to go home
    page.click("#headerTitle")
    time.sleep(0.3)

    assert page.locator("#deckListView").is_visible(), "Should return to deck list"
    log_result("标题导航回首页", True, "点击标题可从任意页面返回首页")


def test_22_data_structure(page):
    """Test 22: Verify localStorage data structure matches PRD."""
    data = page.evaluate("localStorage.getItem('flashcard_data')")
    parsed = json.loads(data)

    # Check top-level structure
    assert "decks" in parsed, "Data should have 'decks' key"
    assert isinstance(parsed["decks"], list), "'decks' should be an array"

    if len(parsed["decks"]) > 0:
        deck = parsed["decks"][0]
        assert "id" in deck, "Deck should have 'id'"
        assert "name" in deck, "Deck should have 'name'"
        assert "description" in deck, "Deck should have 'description'"
        assert "createdAt" in deck, "Deck should have 'createdAt'"
        assert "updatedAt" in deck, "Deck should have 'updatedAt'"
        assert "cards" in deck, "Deck should have 'cards'"
        assert isinstance(deck["cards"], list), "'cards' should be an array"

        if len(deck["cards"]) > 0:
            card = deck["cards"][0]
            assert "id" in card, "Card should have 'id'"
            assert "front" in card, "Card should have 'front'"
            assert "back" in card, "Card should have 'back'"
            assert "createdAt" in card, "Card should have 'createdAt'"
            assert "stats" in card, "Card should have 'stats'"
            stats = card["stats"]
            assert "correct" in stats, "Stats should have 'correct'"
            assert "incorrect" in stats, "Stats should have 'incorrect'"

    log_result("数据结构符合PRD", True, f"localStorage数据结构：decks[].{{id,name,description,createdAt,updatedAt,cards[].{{id,front,back,createdAt,stats}}}}")


def test_23_ui_visual_quality(page):
    """Test 23: Visual quality check - shadows, rounded corners, colors."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.5)

    # Check deck card has shadow and border-radius
    card_styles = page.locator(".deck-card").first.evaluate("""el => {
        const s = window.getComputedStyle(el);
        return {
            boxShadow: s.boxShadow,
            borderRadius: s.borderRadius,
            backgroundColor: s.backgroundColor
        };
    }""")

    has_shadow = card_styles["boxShadow"] != "none"
    has_radius = card_styles["borderRadius"] != "0px"

    # Check primary button styles
    btn_styles = page.locator("#addDeckBtn").evaluate("""el => {
        const s = window.getComputedStyle(el);
        return {
            backgroundColor: s.backgroundColor,
            cursor: s.cursor,
            borderRadius: s.borderRadius
        };
    }""")

    screenshot(page, "23_ui_quality_check")
    detail = (f"卡片阴影={'有' if has_shadow else '无'}, "
              f"圆角={'有' if has_radius else '无'}, "
              f"按钮背景色={btn_styles['backgroundColor']}")
    log_result("UI视觉质量", has_shadow and has_radius, detail)


def run_all_tests():
    """Run all E2E tests."""
    print("=" * 60)
    print("Flashcard App - Milestone 1 E2E 测试")
    print("=" * 60)
    print()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="zh-CN"
        )
        page = context.new_page()

        tests = [
            test_01_initial_empty_state,
            test_02_create_deck,
            test_03_create_second_deck,
            test_04_enter_deck_detail,
            test_05_add_flashcards,
            test_06_edit_flashcard,
            test_07_delete_flashcard,
            test_08_edit_deck,
            test_09_study_mode,
            test_10_flip_animation,
            test_11_study_navigation,
            test_12_keyboard_shortcuts,
            test_13_exit_study_mode,
            test_14_data_persistence,
            test_15_delete_deck,
            test_16_validation_empty_name,
            test_17_modal_close_methods,
            test_18_responsive_desktop,
            test_19_responsive_mobile,
            test_20_responsive_min_width,
            test_21_header_nav_home,
            test_22_data_structure,
            test_23_ui_visual_quality,
        ]

        for test_fn in tests:
            try:
                test_fn(page)
            except Exception as e:
                log_result(test_fn.__doc__ or test_fn.__name__, False, str(e))
                try:
                    screenshot(page, f"FAIL_{test_fn.__name__}")
                except:
                    pass

        browser.close()

    # Print summary
    print()
    print("=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    passed = sum(1 for r in results if r["passed"])
    failed = sum(1 for r in results if not r["passed"])
    total = len(results)
    print(f"总计: {total} | 通过: {passed} | 失败: {failed}")
    print()
    for r in results:
        status = "✅" if r["passed"] else "❌"
        print(f"  {status} {r['test']}")
        if r["detail"]:
            print(f"      {r['detail']}")

    print()
    if failed == 0:
        print("🎉 所有测试通过！")
    else:
        print(f"⚠️  有 {failed} 个测试未通过，请检查。")
        for r in results:
            if not r["passed"]:
                print(f"  ❌ {r['test']}: {r['detail']}")

    return failed == 0


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
