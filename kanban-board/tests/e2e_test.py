"""
Kanban Board M1 - E2E Test Suite
Tests all acceptance criteria using Playwright (real Chromium browser).
"""

import os
import sys
import time
import json
from playwright.sync_api import sync_playwright, expect

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
    print(f"    Screenshot saved: tests/screenshots/{name}.png")
    return path


def run_tests():
    print("=" * 60)
    print("Kanban Board M1 - E2E Test Suite")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ============================================================
        # TEST GROUP 1: Three-column layout and visual design
        # ============================================================
        print("\n--- Test Group 1: Three-Column Layout & Visual Design ---")

        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # Test 1.1: Page loads with title
        title = page.title()
        log_result("1.1 Page title is 'Kanban Board'", title == "Kanban Board", f"Got: '{title}'")

        # Test 1.2: Three columns exist
        columns = page.locator(".column")
        col_count = columns.count()
        log_result("1.2 Three columns present", col_count == 3, f"Found {col_count} columns")

        # Test 1.3: Column headers correct
        headers = page.locator(".column-header h2")
        h_texts = [headers.nth(i).text_content().strip() for i in range(headers.count())]
        expected = ["To Do", "In Progress", "Done"]
        log_result("1.3 Column headers: To Do / In Progress / Done",
                   [t.upper() for t in h_texts] == [t.upper() for t in expected],
                   f"Got: {h_texts}")

        # Test 1.4: Background color
        bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
        log_result("1.4 Body background is #f5f7fa", bg == "rgb(245, 247, 250)", f"Got: {bg}")

        # Test 1.5: Column header colors (blue, orange, green)
        todo_color = page.evaluate("getComputedStyle(document.querySelector('.column-header--todo h2')).color")
        inprog_color = page.evaluate("getComputedStyle(document.querySelector('.column-header--inprogress h2')).color")
        done_color = page.evaluate("getComputedStyle(document.querySelector('.column-header--done h2')).color")
        log_result("1.5 To Do header is blue (#3498db)", todo_color == "rgb(52, 152, 219)", f"Got: {todo_color}")
        log_result("1.6 In Progress header is orange (#e67e22)", inprog_color == "rgb(230, 126, 34)", f"Got: {inprog_color}")
        log_result("1.7 Done header is green (#27ae60)", done_color == "rgb(39, 174, 96)", f"Got: {done_color}")

        # Test 1.8: Font family
        font = page.evaluate("getComputedStyle(document.body).fontFamily")
        log_result("1.8 System font stack used", "-apple-system" in font or "BlinkMacSystemFont" in font or "Segoe UI" in font,
                   f"Got: {font}")

        # Test 1.9: Three columns displayed horizontally (flexbox)
        board_display = page.evaluate("getComputedStyle(document.querySelector('.board')).display")
        log_result("1.9 Board uses flexbox for horizontal layout", board_display == "flex", f"Got: {board_display}")

        # Take screenshot of initial layout
        screenshot(page, "01_initial_layout_desktop")

        context.close()

        # ============================================================
        # TEST GROUP 2: Add Card Functionality
        # ============================================================
        print("\n--- Test Group 2: Add Card Functionality ---")

        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        # Clear localStorage first
        page.goto(BASE_URL)
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        # Test 2.1: Add card buttons exist
        add_btns = page.locator(".add-card-btn")
        log_result("2.1 Three '+ Add Card' buttons present", add_btns.count() == 3, f"Found {add_btns.count()}")

        # Test 2.2: Click '+ Add Card' on To Do column - form appears
        todo_add_btn = page.locator("#todo .add-card-btn")
        todo_add_btn.click()
        todo_form = page.locator("#todo .add-card-form")
        is_visible = not todo_form.evaluate("el => el.classList.contains('hidden')")
        log_result("2.2 Clicking '+ Add Card' shows form", is_visible)

        # Test 2.3: Empty title validation - clicking Add with empty title should not create card
        confirm_btn = page.locator("#todo .btn-confirm")
        confirm_btn.click()
        cards_in_todo = page.locator("#todo-list .card")
        log_result("2.3 Empty title rejected (no card created)", cards_in_todo.count() == 0,
                   f"Cards: {cards_in_todo.count()}")

        # Test 2.4: Add card with title only
        title_input = page.locator("#todo .card-title-input")
        title_input.fill("Test Task 1")
        confirm_btn.click()
        page.wait_for_timeout(300)
        cards_in_todo = page.locator("#todo-list .card")
        log_result("2.4 Card added with title", cards_in_todo.count() == 1, f"Cards: {cards_in_todo.count()}")

        # Verify card title
        card_title = page.locator("#todo-list .card .card-title").first.text_content()
        log_result("2.5 Card title correct", card_title.strip() == "Test Task 1", f"Got: '{card_title}'")

        # Test 2.6: Add card with title + description
        todo_add_btn = page.locator("#todo .add-card-btn")
        todo_add_btn.click()
        title_input = page.locator("#todo .card-title-input")
        desc_input = page.locator("#todo .card-desc-input")
        title_input.fill("Task With Description")
        desc_input.fill("This is a detailed description")
        page.locator("#todo .btn-confirm").click()
        page.wait_for_timeout(300)
        cards_in_todo = page.locator("#todo-list .card")
        log_result("2.6 Second card added", cards_in_todo.count() == 2, f"Cards: {cards_in_todo.count()}")

        # Check description rendered
        desc_el = page.locator("#todo-list .card .card-description").first
        has_desc = desc_el.count() > 0
        log_result("2.7 Card description rendered", has_desc,
                   f"Description: '{desc_el.text_content().strip()}" if has_desc else "No description element")

        # Test 2.8: Add card to In Progress column
        page.locator("#inprogress .add-card-btn").click()
        page.locator("#inprogress .card-title-input").fill("In Progress Task")
        page.locator("#inprogress .btn-confirm").click()
        page.wait_for_timeout(300)
        cards_in_progress = page.locator("#inprogress-list .card")
        log_result("2.8 Card added to In Progress", cards_in_progress.count() == 1)

        # Test 2.9: Add card to Done column
        page.locator("#done .add-card-btn").click()
        page.locator("#done .card-title-input").fill("Done Task")
        page.locator("#done .btn-confirm").click()
        page.wait_for_timeout(300)
        cards_in_done = page.locator("#done-list .card")
        log_result("2.9 Card added to Done", cards_in_done.count() == 1)

        # Test 2.10: Cancel button works
        page.locator("#todo .add-card-btn").click()
        page.locator("#todo .card-title-input").fill("Should be cancelled")
        page.locator("#todo .btn-cancel").click()
        page.wait_for_timeout(300)
        cards_in_todo = page.locator("#todo-list .card")
        log_result("2.10 Cancel button discards form", cards_in_todo.count() == 2, f"Cards: {cards_in_todo.count()}")

        # Test 2.11: Enter key submits form
        page.locator("#todo .add-card-btn").click()
        title_input = page.locator("#todo .card-title-input")
        title_input.fill("Added via Enter")
        title_input.press("Enter")
        page.wait_for_timeout(300)
        cards_in_todo = page.locator("#todo-list .card")
        log_result("2.11 Enter key submits card", cards_in_todo.count() == 3, f"Cards: {cards_in_todo.count()}")

        screenshot(page, "02_cards_added_all_columns")

        # Test 2.12: Card has white background, 8px border-radius, box-shadow
        card_el = page.locator("#todo-list .card").first
        card_bg = card_el.evaluate("el => getComputedStyle(el).backgroundColor")
        card_radius = card_el.evaluate("el => getComputedStyle(el).borderRadius")
        card_shadow = card_el.evaluate("el => getComputedStyle(el).boxShadow")
        log_result("2.12 Card background white", card_bg == "rgb(255, 255, 255)", f"Got: {card_bg}")
        log_result("2.13 Card border-radius 8px", card_radius == "8px", f"Got: {card_radius}")
        log_result("2.14 Card has box-shadow", "rgba(0, 0, 0" in card_shadow and card_shadow != "none",
                   f"Got: {card_shadow}")

        context.close()

        # ============================================================
        # TEST GROUP 3: Drag & Drop
        # ============================================================
        print("\n--- Test Group 3: Drag & Drop ---")

        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        page.goto(BASE_URL)
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        # Add test cards
        page.locator("#todo .add-card-btn").click()
        page.locator("#todo .card-title-input").fill("Drag Me Card")
        page.locator("#todo .btn-confirm").click()
        page.wait_for_timeout(300)

        # Verify card is in To Do
        todo_cards = page.locator("#todo-list .card")
        log_result("3.1 Card in To Do before drag", todo_cards.count() == 1)

        # Test 3.2: Drag card from To Do to In Progress
        card = page.locator("#todo-list .card").first
        target = page.locator("#inprogress .card-list")

        # Use Playwright's drag_to
        card.drag_to(target)
        page.wait_for_timeout(500)

        todo_cards_after = page.locator("#todo-list .card").count()
        inprog_cards_after = page.locator("#inprogress-list .card").count()
        log_result("3.2 Card moved from To Do to In Progress",
                   todo_cards_after == 0 and inprog_cards_after == 1,
                   f"To Do: {todo_cards_after}, In Progress: {inprog_cards_after}")

        screenshot(page, "03_after_drag_to_inprogress")

        # Test 3.3: Drag card from In Progress to Done
        card2 = page.locator("#inprogress-list .card").first
        target2 = page.locator("#done .card-list")
        card2.drag_to(target2)
        page.wait_for_timeout(500)

        inprog_after2 = page.locator("#inprogress-list .card").count()
        done_after2 = page.locator("#done-list .card").count()
        log_result("3.3 Card moved from In Progress to Done",
                   inprog_after2 == 0 and done_after2 == 1,
                   f"In Progress: {inprog_after2}, Done: {done_after2}")

        screenshot(page, "04_after_drag_to_done")

        # Test 3.4: Verify dragging CSS classes exist in code (visual feedback)
        has_dragging_class = page.evaluate("""() => {
            const style = document.querySelector('link[rel=stylesheet]');
            const sheets = document.styleSheets;
            for (let s of sheets) {
                try {
                    for (let r of s.cssRules) {
                        if (r.selectorText && r.selectorText.includes('.dragging')) return true;
                    }
                } catch(e) {}
            }
            return false;
        }""")
        log_result("3.4 CSS .dragging class defined (opacity 0.5)", has_dragging_class)

        has_dragover_class = page.evaluate("""() => {
            const sheets = document.styleSheets;
            for (let s of sheets) {
                try {
                    for (let r of s.cssRules) {
                        if (r.selectorText && r.selectorText.includes('.drag-over')) return true;
                    }
                } catch(e) {}
            }
            return false;
        }""")
        log_result("3.5 CSS .drag-over class defined (column highlight)", has_dragover_class)

        # Verify the dragging class has opacity 0.5
        drag_opacity = page.evaluate("""() => {
            const sheets = document.styleSheets;
            for (let s of sheets) {
                try {
                    for (let r of s.cssRules) {
                        if (r.selectorText && r.selectorText.includes('.dragging')) {
                            return r.style.opacity;
                        }
                    }
                } catch(e) {}
            }
            return null;
        }""")
        log_result("3.6 Dragging opacity is 0.5", drag_opacity == "0.5", f"Got: {drag_opacity}")

        context.close()

        # ============================================================
        # TEST GROUP 4: Delete Card
        # ============================================================
        print("\n--- Test Group 4: Delete Card ---")

        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        page.goto(BASE_URL)
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        # Add two test cards
        page.locator("#todo .add-card-btn").click()
        page.locator("#todo .card-title-input").fill("Card To Delete")
        page.locator("#todo .btn-confirm").click()
        page.wait_for_timeout(300)

        page.locator("#todo .add-card-btn").click()
        page.locator("#todo .card-title-input").fill("Card To Keep")
        page.locator("#todo .btn-confirm").click()
        page.wait_for_timeout(300)

        log_result("4.1 Two cards added for delete test", page.locator("#todo-list .card").count() == 2)

        # Test 4.2: Delete button hidden by default
        delete_btn = page.locator("#todo-list .card .card-delete").first
        opacity = delete_btn.evaluate("el => getComputedStyle(el).opacity")
        log_result("4.2 Delete button hidden by default (opacity 0)", opacity == "0", f"Got opacity: {opacity}")

        # Test 4.3: Delete button visible on hover
        card = page.locator("#todo-list .card").first
        card.hover()
        page.wait_for_timeout(300)
        opacity_hover = delete_btn.evaluate("el => getComputedStyle(el).opacity")
        log_result("4.3 Delete button visible on hover (opacity 1)", opacity_hover == "1", f"Got opacity: {opacity_hover}")

        screenshot(page, "05_delete_button_on_hover")

        # Test 4.4: Click delete removes card
        delete_btn.click(force=True)
        page.wait_for_timeout(300)
        remaining = page.locator("#todo-list .card").count()
        log_result("4.4 Card deleted on click", remaining == 1, f"Remaining cards: {remaining}")

        # Verify the correct card remains
        remaining_title = page.locator("#todo-list .card .card-title").first.text_content().strip()
        log_result("4.5 Correct card remains after delete", remaining_title == "Card To Keep",
                   f"Got: '{remaining_title}'")

        screenshot(page, "06_after_card_deleted")

        context.close()

        # ============================================================
        # TEST GROUP 5: localStorage Persistence
        # ============================================================
        print("\n--- Test Group 5: localStorage Persistence ---")

        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        page.goto(BASE_URL)
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        # Add cards to each column
        page.locator("#todo .add-card-btn").click()
        page.locator("#todo .card-title-input").fill("Persist Todo")
        page.locator("#todo .btn-confirm").click()
        page.wait_for_timeout(200)

        page.locator("#inprogress .add-card-btn").click()
        page.locator("#inprogress .card-title-input").fill("Persist InProgress")
        page.locator("#inprogress .btn-confirm").click()
        page.wait_for_timeout(200)

        page.locator("#done .add-card-btn").click()
        page.locator("#done .card-title-input").fill("Persist Done")
        page.locator("#done .btn-confirm").click()
        page.wait_for_timeout(200)

        # Test 5.1: Data saved to localStorage
        stored = page.evaluate("localStorage.getItem('kanban-board-data')")
        log_result("5.1 Data saved to localStorage", stored is not None and len(stored) > 10,
                   f"Stored {len(stored)} chars" if stored else "Nothing stored")

        # Parse and verify structure
        if stored:
            data = json.loads(stored)
            log_result("5.2 localStorage has correct structure",
                       "todo" in data and "inprogress" in data and "done" in data,
                       f"Keys: {list(data.keys())}")
            log_result("5.3 localStorage has correct card counts",
                       len(data.get("todo", [])) == 1 and len(data.get("inprogress", [])) == 1 and len(data.get("done", [])) == 1,
                       f"todo:{len(data.get('todo',[]))}, inprogress:{len(data.get('inprogress',[]))}, done:{len(data.get('done',[]))}")

        # Test 5.4: Reload page and verify data persists
        page.reload()
        page.wait_for_load_state("networkidle")

        todo_after = page.locator("#todo-list .card").count()
        inprog_after = page.locator("#inprogress-list .card").count()
        done_after = page.locator("#done-list .card").count()
        log_result("5.4 Data persists after reload",
                   todo_after == 1 and inprog_after == 1 and done_after == 1,
                   f"todo:{todo_after}, inprogress:{inprog_after}, done:{done_after}")

        # Verify card titles preserved
        todo_title = page.locator("#todo-list .card .card-title").first.text_content().strip()
        inprog_title = page.locator("#inprogress-list .card .card-title").first.text_content().strip()
        done_title = page.locator("#done-list .card .card-title").first.text_content().strip()
        log_result("5.5 Card titles preserved after reload",
                   todo_title == "Persist Todo" and inprog_title == "Persist InProgress" and done_title == "Persist Done",
                   f"Got: [{todo_title}, {inprog_title}, {done_title}]")

        screenshot(page, "07_after_reload_data_persisted")

        context.close()

        # ============================================================
        # TEST GROUP 6: Responsive Design
        # ============================================================
        print("\n--- Test Group 6: Responsive Design ---")

        # Test at 375px (iPhone SE)
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()
        page.goto(BASE_URL)
        page.evaluate("localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        # Add a card to each column for visual reference
        for col in ["todo", "inprogress", "done"]:
            page.locator(f"#{col} .add-card-btn").click()
            page.locator(f"#{col} .card-title-input").fill(f"Mobile {col}")
            page.locator(f"#{col} .btn-confirm").click()
            page.wait_for_timeout(200)

        # Test 6.1: Board flex-direction changes to column
        flex_dir = page.evaluate("getComputedStyle(document.querySelector('.board')).flexDirection")
        log_result("6.1 Board flex-direction is column at 375px", flex_dir == "column", f"Got: {flex_dir}")

        # Test 6.2: Columns stack vertically (each column should be roughly full width)
        col_width = page.evaluate("document.querySelector('.column').getBoundingClientRect().width")
        viewport_width = 375
        log_result("6.2 Column takes full width at 375px",
                   col_width > viewport_width * 0.8,
                   f"Column width: {col_width}px, viewport: {viewport_width}px")

        # Test 6.3: All three columns are visible (stacked)
        cols_visible = page.locator(".column")
        all_visible = all(cols_visible.nth(i).is_visible() for i in range(3))
        log_result("6.3 All three columns visible at 375px", all_visible)

        screenshot(page, "08_responsive_375px")

        # Test at 768px boundary
        context.close()
        context = browser.new_context(viewport={"width": 768, "height": 1024})
        page = context.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        flex_dir_768 = page.evaluate("getComputedStyle(document.querySelector('.board')).flexDirection")
        log_result("6.4 At 768px flex-direction is column (boundary)", flex_dir_768 == "column", f"Got: {flex_dir_768}")

        screenshot(page, "09_responsive_768px")

        # Test at 769px (above breakpoint)
        context.close()
        context = browser.new_context(viewport={"width": 769, "height": 1024})
        page = context.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        flex_dir_769 = page.evaluate("getComputedStyle(document.querySelector('.board')).flexDirection")
        log_result("6.5 At 769px flex-direction is row (desktop)", flex_dir_769 == "row", f"Got: {flex_dir_769}")

        screenshot(page, "10_responsive_769px_desktop")

        context.close()
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
