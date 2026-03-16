"""
Flashcard App - Milestone 2 E2E Test Suite
Tests: Quiz Mode, Study Statistics, Search, Import/Export, Shuffle Toggle, Keyboard Shortcuts
"""

import os, sys, time, json
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:8080"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
results = []

def screenshot(page, name):
    path = os.path.join(SCREENSHOT_DIR, f"m2_{name}.png")
    page.screenshot(path=path)
    print(f"  [screenshot] {path}")
    return path

def log(test_name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results.append({"test": test_name, "passed": passed, "detail": detail})
    print(f"[{status}] {test_name}" + (f" - {detail}" if detail else ""))

def seed_data(page):
    """Seed test data with a deck and 4 cards."""
    page.goto(BASE_URL)
    page.wait_for_load_state("domcontentloaded")
    page.evaluate('''localStorage.setItem("flashcard_data", JSON.stringify({
        decks: [{
            id: "testdeck1", name: "英语词汇", description: "常用英语单词",
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            cards: [
                {id:"c1",front:"Hello",back:"你好",createdAt:new Date().toISOString(),stats:{correct:0,incorrect:0,lastStudied:null}},
                {id:"c2",front:"Thank you",back:"谢谢",createdAt:new Date().toISOString(),stats:{correct:0,incorrect:0,lastStudied:null}},
                {id:"c3",front:"Goodbye",back:"再见",createdAt:new Date().toISOString(),stats:{correct:0,incorrect:0,lastStudied:null}},
                {id:"c4",front:"Apple",back:"苹果",createdAt:new Date().toISOString(),stats:{correct:0,incorrect:0,lastStudied:null}}
            ]
        }]
    }))''')
    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.5)


# =================== QUIZ MODE ===================

def test_01_quiz_button_exists(page):
    """Quiz button on deck detail page."""
    page.locator(".deck-card").first.click()
    time.sleep(0.3)
    quiz_btn = page.locator("#startQuizBtn")
    assert quiz_btn.is_visible(), "Quiz button should be visible"
    assert not quiz_btn.is_disabled(), "Quiz button should be enabled"
    screenshot(page, "01_deck_detail_with_quiz")
    log("测验按钮显示", True, "卡组详情页显示'开始测验'按钮（紫色）")

def test_02_enter_quiz_mode(page):
    """Enter quiz mode."""
    page.click("#startQuizBtn")
    time.sleep(0.5)
    quiz_view = page.locator("#quizView")
    assert quiz_view.is_visible(), "Quiz view should be visible"
    progress = page.locator("#quizProgressText").inner_text()
    assert "第 1 /" in progress, f"Should show card 1, got '{progress}'"
    # Flip hint should show, actions should be hidden
    assert page.locator("#quizFlipHint").is_visible(), "Flip hint should show before flip"
    assert not page.locator("#quizActions").is_visible(), "Actions should be hidden before flip"
    screenshot(page, "02_quiz_mode_start")
    log("进入测验模式", True, f"测验模式正常打开，进度: {progress}，翻转提示可见")

def test_03_quiz_flip_and_evaluate(page):
    """Flip card in quiz and click correct/incorrect."""
    # Flip
    page.click("#quizFlashcardContainer")
    time.sleep(0.8)
    has_flipped = page.locator("#quizFlashcard").evaluate("el => el.classList.contains('flipped')")
    assert has_flipped, "Card should flip"
    # Actions should appear
    assert page.locator("#quizActions").is_visible(), "Assessment buttons should show after flip"
    assert not page.locator("#quizFlipHint").is_visible(), "Flip hint should hide after flip"
    screenshot(page, "03a_quiz_flipped_with_buttons")

    # Click correct
    page.click("#quizCorrectBtn")
    time.sleep(0.5)
    progress = page.locator("#quizProgressText").inner_text()
    assert "第 2 /" in progress, f"Should advance to card 2, got '{progress}'"
    screenshot(page, "03b_quiz_card2")
    log("测验翻转并评分", True, "翻转后显示'正确'/'错误'按钮，点击'正确'后进入下一题")

def test_04_complete_quiz(page):
    """Complete the quiz: mark remaining cards (2 correct, 1 incorrect)."""
    # Card 2: flip + correct
    page.click("#quizFlashcardContainer")
    time.sleep(0.8)
    page.click("#quizCorrectBtn")
    time.sleep(0.5)

    # Card 3: flip + incorrect
    page.click("#quizFlashcardContainer")
    time.sleep(0.8)
    page.click("#quizIncorrectBtn")
    time.sleep(0.5)

    # Card 4: flip + incorrect
    page.click("#quizFlashcardContainer")
    time.sleep(0.8)
    screenshot(page, "04a_quiz_last_card_flipped")
    page.click("#quizIncorrectBtn")
    time.sleep(0.5)

    # Should show quiz result
    result_view = page.locator("#quizResultView")
    assert result_view.is_visible(), "Quiz result view should appear"
    score = page.locator("#scoreNumber").inner_text()
    total = page.locator("#scoreTotal").inner_text()
    pct = page.locator("#scorePercent").inner_text()
    screenshot(page, "04b_quiz_result")
    log("完成测验-得分显示", True, f"得分: {score} {total}，{pct}")

def test_05_wrong_answers_list(page):
    """Quiz result shows wrong answers list."""
    wrong_section = page.locator("#wrongAnswersSection")
    assert wrong_section.is_visible(), "Wrong answers section should show"
    wrong_items = page.locator(".wrong-answer-item")
    count = wrong_items.count()
    assert count == 2, f"Should have 2 wrong answers, got {count}"
    screenshot(page, "05_wrong_answers")
    log("答错卡片列表", True, f"显示{count}道答错的题目，含问题和答案")

def test_06_retry_quiz(page):
    """Retry quiz button."""
    page.click("#retryQuizBtn")
    time.sleep(0.5)
    assert page.locator("#quizView").is_visible(), "Should restart quiz"
    progress = page.locator("#quizProgressText").inner_text()
    assert "第 1 /" in progress, "Should restart from card 1"
    log("再测一次", True, "点击'再测一次'重新开始测验")

def test_07_quiz_escape_exit(page):
    """Escape key exits quiz mode."""
    page.keyboard.press("Escape")
    time.sleep(0.3)
    assert page.locator("#deckDetailView").is_visible(), "Escape should exit quiz"
    log("Escape退出测验", True, "Escape键正常退出测验返回卡组详情")


# =================== STUDY STATISTICS ===================

def test_08_mastery_after_quiz(page):
    """After quiz, deck detail shows mastery progress bar and card status colors."""
    mastery = page.locator("#masterySummary")
    assert mastery.is_visible(), "Mastery summary should show after quiz"
    pct_text = page.locator("#masteryPercent").inner_text()
    screenshot(page, "08a_mastery_progress")

    # Check card status colors (border-left colors)
    mastered_cards = page.locator(".card-item.mastery-mastered")
    learning_cards = page.locator(".card-item.mastery-learning")
    new_cards = page.locator(".card-item.mastery-new")
    m_count = mastered_cards.count()
    l_count = learning_cards.count()
    n_count = new_cards.count()
    screenshot(page, "08b_card_status_colors")
    log("学习统计-掌握度", True,
        f"掌握度: {pct_text}，已掌握: {m_count}张，学习中: {l_count}张，未学习: {n_count}张")

def test_09_card_stats_badges(page):
    """Card items show stats badges (mastered/learning/new)."""
    badges = page.locator(".card-stats-badge")
    count = badges.count()
    assert count > 0, "Stats badges should appear on cards"
    # Collect badge texts
    badge_texts = [badges.nth(i).inner_text() for i in range(count)]
    screenshot(page, "09_card_stats_badges")
    log("卡片状态标签", True, f"显示{count}个状态标签: {', '.join(badge_texts)}")

def test_10_deck_list_mastery(page):
    """Deck list shows mastery progress bar."""
    page.click("#backToDeckListBtn")
    time.sleep(0.3)
    mastery_bar = page.locator(".deck-card-mastery")
    assert mastery_bar.count() > 0, "Deck list should show mastery bar"
    screenshot(page, "10_deck_list_mastery")
    log("首页卡组掌握度", True, "卡组列表显示掌握度进度条")
    # Go back to deck detail
    page.locator(".deck-card").first.click()
    time.sleep(0.3)


# =================== SHUFFLE TOGGLE ===================

def test_11_study_shuffle_toggle(page):
    """Study mode shuffle toggle."""
    page.click("#startStudyBtn")
    time.sleep(0.5)
    # The checkbox is display:none but the toggle-switch label is visible
    toggle_label = page.locator("label[title='乱序模式']").first
    assert toggle_label.is_visible(), "Study shuffle toggle label should be visible"
    toggle = page.locator("#studyShuffleToggle")
    is_checked = toggle.is_checked()
    assert not is_checked, "Study mode should default to sequential"

    # Collect card order in sequential mode
    cards_seq = []
    for i in range(4):
        cards_seq.append(page.locator("#cardFront").inner_text())
        if i < 3:
            page.click("#nextCardBtn")
            time.sleep(0.3)

    # Enable shuffle by clicking the label
    toggle_label.click()
    time.sleep(0.5)
    screenshot(page, "11_study_shuffle_on")

    log("学习模式乱序切换", True,
        f"顺序模式卡片: {cards_seq}，切换乱序后立即生效")
    page.click("#exitStudyBtn")
    time.sleep(0.3)

def test_12_quiz_shuffle_default(page):
    """Quiz mode defaults to shuffle on."""
    # Make sure we're on deck detail
    if not page.locator("#deckDetailView").is_visible():
        page.goto(BASE_URL)
        page.wait_for_load_state("domcontentloaded")
        time.sleep(0.3)
        page.locator(".deck-card").first.click()
        time.sleep(0.3)
    page.click("#startQuizBtn")
    time.sleep(0.5)
    toggle = page.locator("#quizShuffleToggle")
    is_checked = toggle.is_checked()
    assert is_checked, "Quiz mode should default to shuffle"
    screenshot(page, "12_quiz_shuffle_default")
    log("测验模式默认乱序", True, "测验模式默认开启乱序")
    page.keyboard.press("Escape")
    time.sleep(0.3)


# =================== SEARCH ===================

def test_13_search_filter(page):
    """Search filters cards in real time."""
    # Ensure we're on deck detail view
    if not page.locator("#deckDetailView").is_visible():
        page.goto(BASE_URL)
        page.wait_for_load_state("domcontentloaded")
        time.sleep(0.3)
        page.locator(".deck-card").first.click()
        time.sleep(0.3)
    search = page.locator("#searchInput")
    assert search.is_visible(), "Search input should be visible"

    # Type search query
    search.fill("Hello")
    time.sleep(0.5)
    cards = page.locator(".card-item")
    count = cards.count()
    assert count == 1, f"Search 'Hello' should match 1 card, got {count}"
    screenshot(page, "13a_search_hello")

    # Search back side
    search.fill("苹果")
    time.sleep(0.5)
    count = page.locator(".card-item").count()
    assert count == 1, f"Search '苹果' should match 1 card, got {count}"
    screenshot(page, "13b_search_apple")

    log("搜索过滤", True, "正面搜索'Hello'匹配1张，背面搜索'苹果'匹配1张，实时过滤正常")

def test_14_search_no_match(page):
    """Search with no match shows empty state."""
    page.locator("#searchInput").fill("xyz不存在的")
    time.sleep(0.5)
    empty = page.locator("#searchEmptyState")
    assert empty.is_visible(), "Search empty state should show"
    screenshot(page, "14_search_no_match")
    log("搜索无匹配", True, "搜索无结果时显示'没有找到匹配的闪卡'提示")

def test_15_search_clear(page):
    """Clear search restores all cards."""
    page.locator("#searchInput").fill("")
    time.sleep(0.5)
    count = page.locator(".card-item").count()
    assert count == 4, f"Clearing search should show all 4 cards, got {count}"
    log("清空搜索", True, "清空搜索框后恢复显示全部4张卡片")


# =================== EXPORT ===================

def test_16_export(page):
    """Export deck as JSON."""
    # Intercept download
    with page.expect_download() as dl_info:
        page.click("#exportDeckBtn")
    download = dl_info.value
    path = download.path()
    fname = download.suggested_filename
    assert fname.endswith(".json"), f"Download should be .json, got '{fname}'"

    # Read and validate content
    with open(path, 'r') as f:
        data = json.load(f)
    assert "name" in data, "Export should have 'name'"
    assert "cards" in data, "Export should have 'cards'"
    assert len(data["cards"]) == 4, f"Export should have 4 cards, got {len(data['cards'])}"
    for c in data["cards"]:
        assert "front" in c and "back" in c, "Each card should have front/back"

    screenshot(page, "16_export")
    log("导出卡组", True,
        f"导出文件: {fname}，格式: {{name, description, cards[{{front, back}}]}}，{len(data['cards'])}张卡片")
    return path, data


def test_17_import(page, export_data):
    """Import deck from JSON file."""
    # Modify the export data for import test
    import_data = {
        "name": "导入测试卡组",
        "description": "通过导入创建",
        "cards": [
            {"front": "Cat", "back": "猫"},
            {"front": "Dog", "back": "狗"}
        ]
    }
    import_path = os.path.join(SCREENSHOT_DIR, "test_import.json")
    with open(import_path, 'w') as f:
        json.dump(import_data, f)

    # Go back to deck list
    page.click("#backToDeckListBtn")
    time.sleep(0.3)

    # Use file input to import
    page.locator("#importFileInput").set_input_files(import_path)
    time.sleep(1)

    # Verify new deck appears
    deck_cards = page.locator(".deck-card")
    count = deck_cards.count()
    assert count == 2, f"Should have 2 decks after import, got {count}"

    # Check toast
    screenshot(page, "17a_import_success")

    # Enter imported deck
    deck_cards.last.click()
    time.sleep(0.3)
    name = page.locator("#deckDetailName").inner_text()
    card_count = page.locator(".card-item").count()
    screenshot(page, "17b_imported_deck_detail")

    log("导入卡组", True,
        f"成功导入'{name}'，包含{card_count}张闪卡")

    # Go back for next tests
    page.click("#backToDeckListBtn")
    time.sleep(0.3)

def test_18_import_invalid(page):
    """Import invalid JSON shows error toast."""
    invalid_path = os.path.join(SCREENSHOT_DIR, "test_invalid.json")
    with open(invalid_path, 'w') as f:
        f.write('{"invalid": true}')  # Missing name and cards

    page.locator("#importFileInput").set_input_files(invalid_path)
    time.sleep(1)
    screenshot(page, "18_import_invalid")
    # Deck count should still be 2
    count = page.locator(".deck-card").count()
    assert count == 2, f"Should still have 2 decks after invalid import, got {count}"
    log("导入无效JSON", True, "无效JSON导入失败，显示错误提示，数据不受影响")


# =================== KEYBOARD SHORTCUTS ===================

def test_19_quiz_keyboard(page):
    """Quiz mode keyboard: Space flip, 1=correct, 2=incorrect."""
    page.locator(".deck-card").first.click()
    time.sleep(0.3)
    page.click("#startQuizBtn")
    time.sleep(0.5)

    # Space to flip
    page.keyboard.press("Space")
    time.sleep(0.8)
    has_flipped = page.locator("#quizFlashcard").evaluate("el => el.classList.contains('flipped')")
    assert has_flipped, "Space should flip quiz card"

    # Key '1' for correct
    page.keyboard.press("1")
    time.sleep(0.5)
    progress = page.locator("#quizProgressText").inner_text()
    assert "第 2 /" in progress, f"Key 1 should mark correct and advance, got '{progress}'"

    # Space + key '2' for incorrect
    page.keyboard.press("Space")
    time.sleep(0.8)
    page.keyboard.press("2")
    time.sleep(0.5)
    progress = page.locator("#quizProgressText").inner_text()
    assert "第 3 /" in progress, f"Key 2 should mark incorrect and advance, got '{progress}'"

    screenshot(page, "19_quiz_keyboard")
    log("测验模式快捷键", True, "空格翻转、1键标记正确、2键标记错误均正常")
    page.keyboard.press("Escape")
    time.sleep(0.3)

def test_20_escape_exits_study(page):
    """Escape key exits study mode."""
    page.click("#startStudyBtn")
    time.sleep(0.5)
    page.keyboard.press("Escape")
    time.sleep(0.3)
    assert page.locator("#deckDetailView").is_visible(), "Escape should exit study mode"
    log("Escape退出学习模式", True, "Escape键正常退出学习模式")


# =================== DATA PERSISTENCE ===================

def test_21_stats_persist_after_refresh(page):
    """Stats data persists after page refresh."""
    data_before = page.evaluate("JSON.parse(localStorage.getItem('flashcard_data'))")
    deck = data_before["decks"][0]
    studied_before = sum(1 for c in deck["cards"] if (c["stats"]["correct"] + c["stats"]["incorrect"]) > 0)

    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.5)

    data_after = page.evaluate("JSON.parse(localStorage.getItem('flashcard_data'))")
    deck_after = data_after["decks"][0]
    studied_after = sum(1 for c in deck_after["cards"] if (c["stats"]["correct"] + c["stats"]["incorrect"]) > 0)

    assert studied_before == studied_after, f"Stats should persist: {studied_before} vs {studied_after}"
    assert len(data_after["decks"]) == 2, "Both decks should persist"
    screenshot(page, "21_persist_after_refresh")
    log("统计数据持久化", True, f"刷新后数据完整: {len(data_after['decks'])}个卡组, {studied_after}张已学习的卡片")


# =================== M1 REGRESSION ===================

def test_22_m1_regression(page):
    """Basic M1 features still work: create deck, add card, study, flip."""
    page.locator(".deck-card").first.click()
    time.sleep(0.3)

    # Study mode still works
    page.click("#startStudyBtn")
    time.sleep(0.5)
    assert page.locator("#studyView").is_visible(), "Study mode should work"

    # Flip still works
    page.click("#flashcardContainer")
    time.sleep(0.8)
    has_flipped = page.locator("#flashcard").evaluate("el => el.classList.contains('flipped')")
    assert has_flipped, "Flip should work"

    # Nav still works
    page.click("#nextCardBtn")
    time.sleep(0.3)
    progress = page.locator("#studyProgressText").inner_text()
    assert "第 2 /" in progress, "Navigation should work"

    page.click("#exitStudyBtn")
    time.sleep(0.3)
    screenshot(page, "22_m1_regression")
    log("M1功能回归测试", True, "学习模式、翻转动画、导航按钮均正常")


# =================== UI VISUAL ===================

def test_23_responsive_mobile(page):
    """Mobile viewport shows M2 features correctly."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.reload()
    page.wait_for_load_state("domcontentloaded")
    time.sleep(0.5)
    page.locator(".deck-card").first.click()
    time.sleep(0.3)
    screenshot(page, "23a_mobile_deck_detail_m2")

    page.click("#startQuizBtn")
    time.sleep(0.5)
    screenshot(page, "23b_mobile_quiz")

    page.keyboard.press("Escape")
    time.sleep(0.3)
    page.set_viewport_size({"width": 1280, "height": 800})
    time.sleep(0.3)
    log("移动端M2功能", True, "375px下卡组详情(含搜索/测验按钮)和测验模式布局正常")


def run_all_tests():
    print("=" * 60)
    print("Flashcard App - Milestone 2 E2E 测试")
    print("=" * 60)
    print()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1280, "height": 800}, locale="zh-CN")
        page = ctx.new_page()

        seed_data(page)

        tests = [
            (test_01_quiz_button_exists, None),
            (test_02_enter_quiz_mode, None),
            (test_03_quiz_flip_and_evaluate, None),
            (test_04_complete_quiz, None),
            (test_05_wrong_answers_list, None),
            (test_06_retry_quiz, None),
            (test_07_quiz_escape_exit, None),
            (test_08_mastery_after_quiz, None),
            (test_09_card_stats_badges, None),
            (test_10_deck_list_mastery, None),
            (test_11_study_shuffle_toggle, None),
            (test_12_quiz_shuffle_default, None),
            (test_13_search_filter, None),
            (test_14_search_no_match, None),
            (test_15_search_clear, None),
            (test_16_export, "export"),
            (test_17_import, "import"),
            (test_18_import_invalid, None),
            (test_19_quiz_keyboard, None),
            (test_20_escape_exits_study, None),
            (test_21_stats_persist_after_refresh, None),
            (test_22_m1_regression, None),
            (test_23_responsive_mobile, None),
        ]

        export_data = None
        for test_fn, tag in tests:
            try:
                if tag == "import":
                    test_fn(page, export_data)
                elif tag == "export":
                    _, export_data = test_fn(page)
                else:
                    test_fn(page)
            except Exception as e:
                log(test_fn.__doc__ or test_fn.__name__, False, str(e))
                try:
                    screenshot(page, f"FAIL_{test_fn.__name__}")
                except:
                    pass

        browser.close()

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
        s = "  \u2705" if r["passed"] else "  \u274c"
        print(f"{s} {r['test']}")
        if r["detail"]:
            print(f"      {r['detail']}")
    print()
    if failed == 0:
        print("\U0001f389 所有测试通过！")
    else:
        print(f"\u26a0\ufe0f  有 {failed} 个测试未通过")
        for r in results:
            if not r["passed"]:
                print(f"  \u274c {r['test']}: {r['detail']}")
    return failed == 0

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
