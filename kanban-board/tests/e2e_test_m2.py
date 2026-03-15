"""
Kanban Board M2 - E2E Test Suite
Tests all M2 acceptance criteria + M1 regression using Playwright (real Chromium).
"""

import os
import sys
import json
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8080"
SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

RESULTS = []


def log_result(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    RESULTS.append({"name": name, "passed": passed, "detail": detail})
    print(f"  [{status}] {name}" + (f" - {detail}" if detail else ""))


def screenshot(page, name):
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"    Screenshot: tests/screenshots/{name}.png")
    return path


def fresh_page(browser, width=1280, height=800):
    """Create a fresh context+page with cleared localStorage."""
    ctx = browser.new_context(viewport={"width": width, "height": height})
    page = ctx.new_page()
    page.goto(BASE_URL)
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_load_state("networkidle")
    return ctx, page


def add_card(page, column, title, description="", priority="medium"):
    """Helper: add a card to a column. Pass priority=None to skip changing the select."""
    page.locator(f"#{column} .add-card-btn").click()
    page.locator(f"#{column} .card-title-input").fill(title)
    if description:
        page.locator(f"#{column} .card-desc-input").fill(description)
    if priority is not None:
        page.locator(f"#{column} .card-priority-input").select_option(priority)
    page.locator(f"#{column} .btn-confirm").click()
    page.wait_for_timeout(300)


def run_tests():
    print("=" * 60)
    print("Kanban Board M2 - E2E Test Suite")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ============================================================
        # TEST GROUP 1: Card Count
        # ============================================================
        print("\n--- Test Group 1: Card Count ---")
        ctx, page = fresh_page(browser)

        # 1.1: Initial counts are (0)
        todo_count = page.locator("#todo-count").text_content().strip()
        inprog_count = page.locator("#inprogress-count").text_content().strip()
        done_count = page.locator("#done-count").text_content().strip()
        log_result("1.1 Initial counts all (0)",
                   todo_count == "(0)" and inprog_count == "(0)" and done_count == "(0)",
                   f"todo={todo_count}, inprog={inprog_count}, done={done_count}")

        # 1.2: Count updates on add
        add_card(page, "todo", "Card 1")
        add_card(page, "todo", "Card 2")
        todo_count = page.locator("#todo-count").text_content().strip()
        log_result("1.2 Count updates on add", todo_count == "(2)", f"todo={todo_count}")

        # 1.3: Add to different columns
        add_card(page, "inprogress", "IP Card")
        add_card(page, "done", "Done Card 1")
        add_card(page, "done", "Done Card 2")
        add_card(page, "done", "Done Card 3")
        inprog_count = page.locator("#inprogress-count").text_content().strip()
        done_count = page.locator("#done-count").text_content().strip()
        log_result("1.3 Counts correct across columns",
                   inprog_count == "(1)" and done_count == "(3)",
                   f"inprog={inprog_count}, done={done_count}")

        # 1.4: Count updates on delete
        page.locator("#done-list .card .card-delete").first.click(force=True)
        page.wait_for_timeout(300)
        done_count = page.locator("#done-count").text_content().strip()
        log_result("1.4 Count updates on delete", done_count == "(2)", f"done={done_count}")

        screenshot(page, "m2_01_card_counts")
        ctx.close()

        # ============================================================
        # TEST GROUP 2: Priority Labels
        # ============================================================
        print("\n--- Test Group 2: Priority Labels ---")
        ctx, page = fresh_page(browser)

        # 2.1: Add card with High priority
        add_card(page, "todo", "High Priority Task", "Urgent!", "high")
        card = page.locator("#todo-list .card").first
        has_priority_class = card.evaluate("el => el.classList.contains('priority-high')")
        log_result("2.1 High priority card has priority-high class", has_priority_class)

        border_color = card.evaluate("el => getComputedStyle(el).borderLeftColor")
        log_result("2.2 High priority border is red (#e74c3c)", border_color == "rgb(231, 76, 60)",
                   f"Got: {border_color}")

        badge = page.locator("#todo-list .card .card-priority-badge").first
        badge_text = badge.text_content().strip()
        badge_color = badge.evaluate("el => getComputedStyle(el).color")
        log_result("2.3 High priority badge shows 'High'", badge_text == "High", f"Got: '{badge_text}'")
        log_result("2.4 High priority badge color is red", badge_color == "rgb(231, 76, 60)",
                   f"Got: {badge_color}")

        # 2.5: Medium priority
        add_card(page, "todo", "Medium Priority Task", "", "medium")
        card_med = page.locator("#todo-list .card").nth(1)
        border_med = card_med.evaluate("el => getComputedStyle(el).borderLeftColor")
        log_result("2.5 Medium priority border is yellow-orange (#f39c12)",
                   border_med == "rgb(243, 156, 18)", f"Got: {border_med}")

        badge_med = page.locator("#todo-list .card .card-priority-badge").nth(1)
        badge_med_text = badge_med.text_content().strip()
        log_result("2.6 Medium priority badge shows 'Medium'", badge_med_text == "Medium",
                   f"Got: '{badge_med_text}'")

        # 2.7: Low priority
        add_card(page, "todo", "Low Priority Task", "", "low")
        card_low = page.locator("#todo-list .card").nth(2)
        border_low = card_low.evaluate("el => getComputedStyle(el).borderLeftColor")
        log_result("2.7 Low priority border is green (#27ae60)",
                   border_low == "rgb(39, 174, 96)", f"Got: {border_low}")

        # 2.8: No priority (explicitly select "None")
        add_card(page, "todo", "No Priority Task", "", "")
        card_none = page.locator("#todo-list .card").nth(3)
        has_badge = card_none.locator(".card-priority-badge").count() > 0
        border_none = card_none.evaluate("el => getComputedStyle(el).borderLeftColor")
        log_result("2.8 No priority card has no badge", not has_badge,
                   f"has_badge={has_badge}, border={border_none}")

        screenshot(page, "m2_02_priority_labels")
        ctx.close()

        # ============================================================
        # TEST GROUP 3: Edit Card
        # ============================================================
        print("\n--- Test Group 3: Edit Card ---")
        ctx, page = fresh_page(browser)

        add_card(page, "todo", "Original Title", "Original Description", "low")

        # 3.1: Click card opens modal
        page.locator("#todo-list .card").first.click()
        page.wait_for_timeout(300)
        modal_visible = not page.locator("#edit-modal").evaluate("el => el.classList.contains('hidden')")
        log_result("3.1 Clicking card opens edit modal", modal_visible)

        screenshot(page, "m2_03_edit_modal_open")

        # 3.2: Modal shows correct current values
        title_val = page.locator("#edit-title").input_value()
        desc_val = page.locator("#edit-description").input_value()
        prio_val = page.locator("#edit-priority").input_value()
        log_result("3.2 Modal pre-filled with current title", title_val == "Original Title",
                   f"Got: '{title_val}'")
        log_result("3.3 Modal pre-filled with current description", desc_val == "Original Description",
                   f"Got: '{desc_val}'")
        log_result("3.4 Modal pre-filled with current priority", prio_val == "low",
                   f"Got: '{prio_val}'")

        # 3.5: Edit and save
        page.locator("#edit-title").fill("Updated Title")
        page.locator("#edit-description").fill("Updated Description")
        page.locator("#edit-priority").select_option("high")
        page.locator("#edit-save").click()
        page.wait_for_timeout(300)

        # Verify modal closed
        modal_hidden = page.locator("#edit-modal").evaluate("el => el.classList.contains('hidden')")
        log_result("3.5 Modal closes after save", modal_hidden)

        # Verify card updated
        card_title = page.locator("#todo-list .card .card-title").first.text_content().strip()
        card_desc = page.locator("#todo-list .card .card-description").first.text_content().strip()
        has_high = page.locator("#todo-list .card").first.evaluate("el => el.classList.contains('priority-high')")
        log_result("3.6 Card title updated", card_title == "Updated Title", f"Got: '{card_title}'")
        log_result("3.7 Card description updated", card_desc == "Updated Description",
                   f"Got: '{card_desc}'")
        log_result("3.8 Card priority updated to high", has_high)

        screenshot(page, "m2_04_after_edit")

        # 3.9: Empty title validation
        page.locator("#todo-list .card").first.click()
        page.wait_for_timeout(300)
        page.locator("#edit-title").fill("")
        page.locator("#edit-save").click()
        page.wait_for_timeout(200)
        modal_still_open = not page.locator("#edit-modal").evaluate("el => el.classList.contains('hidden')")
        log_result("3.9 Empty title rejected (modal stays open)", modal_still_open)

        # 3.10: Close with Escape
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        modal_closed = page.locator("#edit-modal").evaluate("el => el.classList.contains('hidden')")
        log_result("3.10 Escape closes modal", modal_closed)

        # 3.11: Close by clicking overlay
        page.locator("#todo-list .card").first.click()
        page.wait_for_timeout(300)
        page.locator("#edit-modal").click(position={"x": 10, "y": 10})
        page.wait_for_timeout(200)
        modal_closed2 = page.locator("#edit-modal").evaluate("el => el.classList.contains('hidden')")
        log_result("3.11 Click overlay closes modal", modal_closed2)

        # 3.12: Edit saved to localStorage
        stored = page.evaluate("localStorage.getItem('kanban-board-data')")
        data = json.loads(stored)
        log_result("3.12 Edit persisted to localStorage",
                   data["todo"][0]["title"] == "Updated Title" and data["todo"][0]["priority"] == "high",
                   f"Stored title: '{data['todo'][0]['title']}', priority: '{data['todo'][0]['priority']}'")

        ctx.close()

        # ============================================================
        # TEST GROUP 4: Search / Filter
        # ============================================================
        print("\n--- Test Group 4: Search / Filter ---")
        ctx, page = fresh_page(browser)

        add_card(page, "todo", "Buy groceries", "milk and eggs")
        add_card(page, "todo", "Fix bug", "login page crash")
        add_card(page, "inprogress", "Write docs", "API documentation")
        add_card(page, "done", "Deploy app", "production release")

        # 4.1: Search input exists
        search = page.locator("#search-input")
        log_result("4.1 Search input exists", search.count() == 1)

        # 4.2: Search by title
        search.fill("bug")
        page.wait_for_timeout(300)
        visible_todo = page.locator("#todo-list .card:not(.filtered-out)").count()
        visible_inprog = page.locator("#inprogress-list .card:not(.filtered-out)").count()
        visible_done = page.locator("#done-list .card:not(.filtered-out)").count()
        log_result("4.2 Search 'bug' shows only matching card",
                   visible_todo == 1 and visible_inprog == 0 and visible_done == 0,
                   f"visible: todo={visible_todo}, inprog={visible_inprog}, done={visible_done}")

        screenshot(page, "m2_05_search_filter_bug")

        # 4.3: Search by description
        search.fill("documentation")
        page.wait_for_timeout(300)
        visible_todo = page.locator("#todo-list .card:not(.filtered-out)").count()
        visible_inprog = page.locator("#inprogress-list .card:not(.filtered-out)").count()
        log_result("4.3 Search by description 'documentation'",
                   visible_todo == 0 and visible_inprog == 1,
                   f"todo={visible_todo}, inprog={visible_inprog}")

        # 4.4: Case insensitive
        search.fill("BUY")
        page.wait_for_timeout(300)
        visible = page.locator("#todo-list .card:not(.filtered-out)").count()
        log_result("4.4 Case insensitive search", visible == 1, f"visible={visible}")

        # 4.5: Clear search restores all cards
        search.fill("")
        page.wait_for_timeout(300)
        total_visible = page.locator(".card:not(.filtered-out)").count()
        log_result("4.5 Clear search restores all cards", total_visible == 4,
                   f"visible={total_visible}")

        # 4.6: No match hides all
        search.fill("xyznonexistent")
        page.wait_for_timeout(300)
        total_visible = page.locator(".card:not(.filtered-out)").count()
        log_result("4.6 No match hides all cards", total_visible == 0,
                   f"visible={total_visible}")

        search.fill("")
        page.wait_for_timeout(200)
        ctx.close()

        # ============================================================
        # TEST GROUP 5: Undo (Ctrl+Z)
        # ============================================================
        print("\n--- Test Group 5: Undo (Ctrl+Z) ---")
        ctx, page = fresh_page(browser)

        add_card(page, "todo", "Undo Delete Test", "test description", "high")
        add_card(page, "todo", "Another Card")

        # 5.1: Undo delete
        page.locator("#todo-list .card .card-delete").first.click(force=True)
        page.wait_for_timeout(300)
        todo_count_before = page.locator("#todo-list .card").count()
        log_result("5.1a Card deleted", todo_count_before == 1)

        # Click body first to ensure no input is focused
        page.locator("body").click(position={"x": 5, "y": 5})
        page.wait_for_timeout(100)
        page.keyboard.press("Control+z")
        page.wait_for_timeout(500)
        todo_count_after = page.locator("#todo-list .card").count()
        log_result("5.1b Ctrl+Z undoes delete", todo_count_after == 2,
                   f"cards after undo: {todo_count_after}")

        # Verify restored card content
        restored_title = page.locator("#todo-list .card .card-title").first.text_content().strip()
        log_result("5.1c Restored card has correct title", restored_title == "Undo Delete Test",
                   f"Got: '{restored_title}'")

        screenshot(page, "m2_06_undo_delete")

        # 5.2: Undo move
        card = page.locator("#todo-list .card").first
        target = page.locator("#done .card-list")
        card.drag_to(target)
        page.wait_for_timeout(500)

        todo_after_move = page.locator("#todo-list .card").count()
        done_after_move = page.locator("#done-list .card").count()
        log_result("5.2a Card moved to Done", todo_after_move == 1 and done_after_move == 1,
                   f"todo={todo_after_move}, done={done_after_move}")

        page.locator("body").click(position={"x": 5, "y": 5})
        page.wait_for_timeout(100)
        page.keyboard.press("Control+z")
        page.wait_for_timeout(500)
        todo_after_undo = page.locator("#todo-list .card").count()
        done_after_undo = page.locator("#done-list .card").count()
        log_result("5.2b Ctrl+Z undoes move", todo_after_undo == 2 and done_after_undo == 0,
                   f"todo={todo_after_undo}, done={done_after_undo}")

        # 5.3: Undo edit
        page.locator("#todo-list .card").first.click()
        page.wait_for_timeout(300)
        page.locator("#edit-title").fill("Changed Title")
        page.locator("#edit-save").click()
        page.wait_for_timeout(300)

        changed_title = page.locator("#todo-list .card .card-title").first.text_content().strip()
        log_result("5.3a Card edited", changed_title == "Changed Title", f"Got: '{changed_title}'")

        page.locator("body").click(position={"x": 5, "y": 5})
        page.wait_for_timeout(100)
        page.keyboard.press("Control+z")
        page.wait_for_timeout(500)
        undone_title = page.locator("#todo-list .card .card-title").first.text_content().strip()
        log_result("5.3b Ctrl+Z undoes edit", undone_title == "Undo Delete Test",
                   f"Got: '{undone_title}'")

        screenshot(page, "m2_07_undo_edit")
        ctx.close()

        # ============================================================
        # TEST GROUP 6: Export / Import
        # ============================================================
        print("\n--- Test Group 6: Export / Import ---")
        ctx, page = fresh_page(browser)

        # 6.1: Export/Import buttons exist
        export_btn = page.locator("#export-btn")
        import_btn = page.locator("#import-btn")
        log_result("6.1 Export button exists", export_btn.count() == 1)
        log_result("6.2 Import button exists", import_btn.count() == 1)

        # Add test data
        add_card(page, "todo", "Export Test Card", "some description", "high")
        add_card(page, "inprogress", "IP Export", "", "medium")

        screenshot(page, "m2_08_before_export")

        # 6.3: Export - test that download is triggered
        with page.expect_download() as download_info:
            export_btn.click()
        download = download_info.value
        download_path = os.path.join(SCREENSHOT_DIR, "exported.json")
        download.save_as(download_path)
        log_result("6.3 Export triggers download", download.suggested_filename == "kanban-board-export.json",
                   f"Filename: {download.suggested_filename}")

        # 6.4: Exported file is valid JSON
        with open(download_path, 'r') as f:
            exported_data = json.load(f)
        log_result("6.4 Exported file is valid JSON", True)
        log_result("6.5 Exported data has correct structure",
                   "todo" in exported_data and "inprogress" in exported_data and "done" in exported_data,
                   f"Keys: {list(exported_data.keys())}")
        log_result("6.6 Exported data has correct cards",
                   len(exported_data["todo"]) == 1 and len(exported_data["inprogress"]) == 1,
                   f"todo={len(exported_data['todo'])}, inprog={len(exported_data['inprogress'])}")

        # 6.7: Import - clear board first, then import exported file
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")
        todo_empty = page.locator("#todo-list .card").count()
        log_result("6.7 Board cleared before import", todo_empty == 0)

        # Handle the confirm dialog
        page.on("dialog", lambda dialog: dialog.accept())

        # Import the exported file
        file_input = page.locator("#import-file")
        file_input.set_input_files(download_path)
        page.wait_for_timeout(500)

        todo_after_import = page.locator("#todo-list .card").count()
        inprog_after_import = page.locator("#inprogress-list .card").count()
        log_result("6.8 Import restores cards",
                   todo_after_import == 1 and inprog_after_import == 1,
                   f"todo={todo_after_import}, inprog={inprog_after_import}")

        # 6.9: Verify imported card content
        imported_title = page.locator("#todo-list .card .card-title").first.text_content().strip()
        log_result("6.9 Imported card title correct", imported_title == "Export Test Card",
                   f"Got: '{imported_title}'")

        # 6.10: Imported card count
        todo_count = page.locator("#todo-count").text_content().strip()
        log_result("6.10 Card count updated after import", todo_count == "(1)", f"Got: {todo_count}")

        screenshot(page, "m2_09_after_import")

        # 6.11: Invalid file import - use a new context to avoid dialog handler conflicts
        ctx.close()
        ctx, page = fresh_page(browser)
        add_card(page, "todo", "Existing Card")

        invalid_path = os.path.join(SCREENSHOT_DIR, "invalid.json")
        with open(invalid_path, 'w') as f:
            f.write('{"invalid": true}')

        alert_message = []
        page.on("dialog", lambda dialog: (alert_message.append(dialog.message), dialog.accept()))
        file_input = page.locator("#import-file")
        file_input.set_input_files(invalid_path)
        page.wait_for_timeout(500)
        log_result("6.11 Invalid format shows error",
                   len(alert_message) > 0 and "Invalid" in alert_message[-1] if alert_message else False,
                   f"Alert: '{alert_message[-1] if alert_message else 'none'}'")

        ctx.close()

        # ============================================================
        # TEST GROUP 7: M1 Regression
        # ============================================================
        print("\n--- Test Group 7: M1 Regression ---")
        ctx, page = fresh_page(browser)

        # 7.1: Three columns still present
        cols = page.locator(".column").count()
        log_result("7.1 Three columns present", cols == 3)

        # 7.2: Add card still works
        add_card(page, "todo", "Regression Card", "test desc")
        cards = page.locator("#todo-list .card").count()
        log_result("7.2 Add card works", cards == 1)

        # 7.3: Drag and drop still works
        card = page.locator("#todo-list .card").first
        target = page.locator("#inprogress .card-list")
        card.drag_to(target)
        page.wait_for_timeout(500)
        todo = page.locator("#todo-list .card").count()
        inprog = page.locator("#inprogress-list .card").count()
        log_result("7.3 Drag and drop works", todo == 0 and inprog == 1,
                   f"todo={todo}, inprog={inprog}")

        # 7.4: Delete still works
        page.locator("#inprogress-list .card .card-delete").first.click(force=True)
        page.wait_for_timeout(300)
        inprog_after = page.locator("#inprogress-list .card").count()
        log_result("7.4 Delete card works", inprog_after == 0)

        # 7.5: localStorage persistence
        add_card(page, "done", "Persist Test")
        page.reload()
        page.wait_for_load_state("networkidle")
        done_cards = page.locator("#done-list .card").count()
        log_result("7.5 localStorage persistence works", done_cards == 1)

        # 7.6: Responsive design
        ctx.close()
        ctx, page = fresh_page(browser, width=375, height=812)
        add_card(page, "todo", "Mobile test")
        flex_dir = page.evaluate("getComputedStyle(document.querySelector('.board')).flexDirection")
        log_result("7.6 Responsive layout at 375px", flex_dir == "column", f"Got: {flex_dir}")
        col_width = page.evaluate("document.querySelector('.column').getBoundingClientRect().width")
        log_result("7.7 Column full width at 375px", col_width > 300,
                   f"Column width: {col_width}px")

        screenshot(page, "m2_10_responsive_375px")

        # 7.8: Design specs preserved
        ctx.close()
        ctx, page = fresh_page(browser)
        add_card(page, "todo", "Style Check")
        bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
        card_bg = page.locator("#todo-list .card").first.evaluate("el => getComputedStyle(el).backgroundColor")
        card_radius = page.locator("#todo-list .card").first.evaluate("el => getComputedStyle(el).borderRadius")
        log_result("7.8 Background color #f5f7fa preserved", bg == "rgb(245, 247, 250)", f"Got: {bg}")
        log_result("7.9 Card white background preserved", card_bg == "rgb(255, 255, 255)", f"Got: {card_bg}")
        log_result("7.10 Card 8px border-radius preserved", card_radius == "8px", f"Got: {card_radius}")

        screenshot(page, "m2_11_desktop_final")
        ctx.close()
        browser.close()

    # ============================================================
    # Summary
    # ============================================================
    print("\n" + "=" * 60)
    passed = sum(1 for r in RESULTS if r["passed"])
    failed = sum(1 for r in RESULTS if not r["passed"])
    total = len(RESULTS)
    print(f"TOTAL: {total} tests | PASSED: {passed} | FAILED: {failed}")
    print("=" * 60)

    if failed > 0:
        print("\nFailed tests:")
        for r in RESULTS:
            if not r["passed"]:
                print(f"  - {r['name']}: {r['detail']}")

    return RESULTS


if __name__ == "__main__":
    results = run_tests()
    sys.exit(0 if all(r["passed"] for r in results) else 1)
