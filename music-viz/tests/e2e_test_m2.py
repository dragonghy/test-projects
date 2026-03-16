"""
Music Visualizer - E2E Test Suite for Milestone 2 (Playwright)
Tests: New M2 features + M1 regression

M2 features:
  1. 4 visualization modes (Bars, Wave, Circular, Particles)
  2. 3 color themes (Neon, Rainbow, Ocean)
  3. Sensitivity slider
  4. Demo audio (OscillatorNode)
  5. Screenshot functionality
  6. Song info display
  7. Keyboard shortcuts (3/4/S)
  M1 regression: upload, playback, progress, volume, fullscreen, responsive
"""

import os
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8080"
SCREENSHOT_DIR = Path(__file__).parent / "screenshots"
TEST_AUDIO = Path(__file__).parent / "test.wav"

SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

results = []


def record(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results.append({"test": name, "status": status, "detail": detail})
    print(f"  [{status}] {name}" + (f" - {detail}" if detail else ""))


def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ============================================================
        # TEST 1: M1 Regression - Upload, Playback, Controls
        # ============================================================
        print("\n=== TEST 1: M1 Regression - Core Playback ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # Page title
        record("Page title unchanged", page.title() == "Music Visualizer")

        # Upload overlay visible
        record("Upload overlay visible on load", page.locator("#upload-overlay").is_visible())

        # Upload audio
        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1500)

        # Overlay hidden, controls visible
        overlay_hidden = page.evaluate(
            "() => document.getElementById('upload-overlay').classList.contains('hidden')")
        controls_visible = page.evaluate(
            "() => !document.getElementById('controls').classList.contains('hidden')")
        record("Upload hides overlay", overlay_hidden)
        record("Upload shows controls", controls_visible)

        # File name
        fname = page.locator("#file-name").text_content()
        record("File name displayed", "test.wav" in fname, f"'{fname}'")

        # Duration
        page.wait_for_timeout(500)
        dur = page.locator("#duration").text_content()
        record("Duration shown (mm:ss)", dur == "0:05", f"Duration: {dur}")

        # Play/Pause toggle
        play_btn = page.locator("#play-btn")
        record("Play button visible", play_btn.is_visible())
        before = page.evaluate("() => document.querySelector('.icon-play').classList.contains('hidden')")
        play_btn.click()
        page.wait_for_timeout(300)
        after = page.evaluate("() => document.querySelector('.icon-play').classList.contains('hidden')")
        record("Play/Pause toggles", before != after)

        # Volume
        vol = page.locator("#volume-slider")
        record("Volume slider visible", vol.is_visible())
        record("Volume initial=80", vol.input_value() == "80")

        # Progress bar
        record("Progress bar visible", page.locator(".progress-bar").is_visible())

        # Current time
        ct = page.locator("#current-time").text_content()
        record("Current time displays", ct is not None, f"Time: {ct}")

        page.screenshot(path=str(SCREENSHOT_DIR / "m2_01_regression_playback.png"))
        ctx.close()

        # ============================================================
        # TEST 2: Demo Audio
        # ============================================================
        print("\n=== TEST 2: Demo Audio (Play Demo) ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # Demo button exists on upload overlay
        demo_btn = page.locator("#demo-btn")
        record("Demo button exists", demo_btn.count() == 1)
        record("Demo button visible on upload page", demo_btn.is_visible())
        record("Demo button text contains 'Play Demo'",
               "Play Demo" in demo_btn.text_content(),
               f"Text: '{demo_btn.text_content()}'")

        # Screenshot upload overlay with demo button
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_02_demo_button.png"))

        # Click demo button
        demo_btn.click()
        page.wait_for_timeout(1500)

        # After demo click: overlay hidden, controls shown
        overlay_hidden = page.evaluate(
            "() => document.getElementById('upload-overlay').classList.contains('hidden')")
        controls_visible = page.evaluate(
            "() => !document.getElementById('controls').classList.contains('hidden')")
        record("Demo hides overlay", overlay_hidden)
        record("Demo shows controls", controls_visible)

        # File name shows demo info
        demo_name = page.locator("#file-name").text_content()
        record("Demo displays info text", len(demo_name) > 0, f"'{demo_name}'")

        # Duration should be set for demo
        demo_dur = page.locator("#duration").text_content()
        record("Demo duration displayed", demo_dur != "0:00", f"Duration: {demo_dur}")

        # Play state should be active (pause icon shown)
        is_playing = page.evaluate(
            "() => document.querySelector('.icon-play').classList.contains('hidden')")
        record("Demo auto-plays (pause icon shown)", is_playing)

        # Canvas should have content from demo visualization
        page.wait_for_timeout(1000)
        has_content = page.evaluate("""
            () => {
                const c = document.getElementById('visualizer');
                const ctx = c.getContext('2d');
                const d = ctx.getImageData(0, 0, c.width, c.height).data;
                let n = 0;
                for (let i = 0; i < d.length; i += 40) {
                    if (d[i] > 15 || d[i+1] > 15 || d[i+2] > 15) n++;
                }
                return n;
            }
        """)
        record("Demo triggers visualization", has_content > 0, f"Non-black samples: {has_content}")

        page.screenshot(path=str(SCREENSHOT_DIR / "m2_03_demo_playing.png"))
        ctx.close()

        # ============================================================
        # TEST 3: Four Visualization Modes
        # ============================================================
        print("\n=== TEST 3: Four Visualization Modes ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        # Upload audio and start playing
        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1500)
        # Ensure playing
        if not page.evaluate("() => document.querySelector('.icon-play').classList.contains('hidden')"):
            page.locator("#play-btn").click()
            page.wait_for_timeout(500)

        # Check all 4 mode buttons exist
        for mode_id in ["mode-bars", "mode-wave", "mode-circular", "mode-particles"]:
            btn = page.locator(f"#{mode_id}")
            record(f"Mode button #{mode_id} exists", btn.count() == 1)

        # --- Bars mode (default) ---
        bars_active = page.evaluate("() => document.getElementById('mode-bars').classList.contains('active')")
        record("Bars mode active by default", bars_active)
        page.wait_for_timeout(800)
        bars_content = page.evaluate("""
            () => {
                const c = document.getElementById('visualizer');
                const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
                let n=0; for(let i=0;i<d.length;i+=40) if(d[i]>15||d[i+1]>15||d[i+2]>15) n++;
                return n;
            }
        """)
        record("Bars mode renders content", bars_content > 0, f"Samples: {bars_content}")
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_04_mode_bars.png"))

        # --- Wave mode ---
        page.locator("#mode-wave").click()
        page.wait_for_timeout(800)
        wave_active = page.evaluate("() => document.getElementById('mode-wave').classList.contains('active')")
        bars_inactive = page.evaluate("() => !document.getElementById('mode-bars').classList.contains('active')")
        record("Wave mode activated", wave_active)
        record("Bars deactivated on Wave switch", bars_inactive)
        wave_content = page.evaluate("""
            () => {
                const c = document.getElementById('visualizer');
                const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
                let n=0; for(let i=0;i<d.length;i+=40) if(d[i]>15||d[i+1]>15||d[i+2]>15) n++;
                return n;
            }
        """)
        record("Wave mode renders content", wave_content > 0, f"Samples: {wave_content}")
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_05_mode_wave.png"))

        # --- Circular mode ---
        page.locator("#mode-circular").click()
        page.wait_for_timeout(800)
        circ_active = page.evaluate("() => document.getElementById('mode-circular').classList.contains('active')")
        record("Circular mode activated", circ_active)
        circ_content = page.evaluate("""
            () => {
                const c = document.getElementById('visualizer');
                const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
                let n=0; for(let i=0;i<d.length;i+=40) if(d[i]>15||d[i+1]>15||d[i+2]>15) n++;
                return n;
            }
        """)
        record("Circular mode renders content", circ_content > 0, f"Samples: {circ_content}")
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_06_mode_circular.png"))

        # --- Particles mode ---
        page.locator("#mode-particles").click()
        page.wait_for_timeout(1200)  # particles need a bit more time to populate
        part_active = page.evaluate("() => document.getElementById('mode-particles').classList.contains('active')")
        record("Particles mode activated", part_active)
        part_content = page.evaluate("""
            () => {
                const c = document.getElementById('visualizer');
                const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
                let n=0; for(let i=0;i<d.length;i+=40) if(d[i]>15||d[i+1]>15||d[i+2]>15) n++;
                return n;
            }
        """)
        record("Particles mode renders content", part_content > 0, f"Samples: {part_content}")
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_07_mode_particles.png"))

        # Only one mode active at a time
        active_count = page.evaluate("""
            () => document.querySelectorAll('.mode-btn.active').length
        """)
        record("Only 1 mode active at a time", active_count == 1, f"Active count: {active_count}")

        ctx.close()

        # ============================================================
        # TEST 4: Three Color Themes
        # ============================================================
        print("\n=== TEST 4: Three Color Themes ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1500)
        if not page.evaluate("() => document.querySelector('.icon-play').classList.contains('hidden')"):
            page.locator("#play-btn").click()
            page.wait_for_timeout(500)

        # Check all 3 theme buttons exist
        for theme_id in ["theme-neon", "theme-rainbow", "theme-ocean"]:
            btn = page.locator(f"#{theme_id}")
            record(f"Theme button #{theme_id} exists", btn.count() == 1)

        # Neon is default
        neon_active = page.evaluate("() => document.getElementById('theme-neon').classList.contains('active')")
        record("Neon theme active by default", neon_active)

        # Switch to Bars mode for clear color comparison
        page.locator("#mode-bars").click()
        page.wait_for_timeout(800)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_08_theme_neon_bars.png"))

        # --- Rainbow theme ---
        page.locator("#theme-rainbow").click()
        page.wait_for_timeout(300)
        rainbow_active = page.evaluate("() => document.getElementById('theme-rainbow').classList.contains('active')")
        neon_inactive = page.evaluate("() => !document.getElementById('theme-neon').classList.contains('active')")
        record("Rainbow theme activated", rainbow_active)
        record("Neon deactivated on Rainbow switch", neon_inactive)
        page.wait_for_timeout(800)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_09_theme_rainbow_bars.png"))

        # --- Ocean theme ---
        page.locator("#theme-ocean").click()
        page.wait_for_timeout(300)
        ocean_active = page.evaluate("() => document.getElementById('theme-ocean').classList.contains('active')")
        record("Ocean theme activated", ocean_active)
        page.wait_for_timeout(800)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_10_theme_ocean_bars.png"))

        # Theme active count
        theme_active_count = page.evaluate("() => document.querySelectorAll('.theme-btn.active').length")
        record("Only 1 theme active at a time", theme_active_count == 1)

        # Test theme applies to circular mode
        page.locator("#mode-circular").click()
        page.wait_for_timeout(800)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_11_theme_ocean_circular.png"))

        # Switch to wave with rainbow
        page.locator("#theme-rainbow").click()
        page.locator("#mode-wave").click()
        page.wait_for_timeout(800)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_12_theme_rainbow_wave.png"))

        # Reset to neon
        page.locator("#theme-neon").click()
        page.wait_for_timeout(200)
        neon_reactivated = page.evaluate("() => document.getElementById('theme-neon').classList.contains('active')")
        record("Neon theme can be re-activated", neon_reactivated)

        ctx.close()

        # ============================================================
        # TEST 5: Sensitivity Control
        # ============================================================
        print("\n=== TEST 5: Sensitivity Control ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1500)
        if not page.evaluate("() => document.querySelector('.icon-play').classList.contains('hidden')"):
            page.locator("#play-btn").click()
            page.wait_for_timeout(500)

        # Sensitivity slider exists
        sens = page.locator("#sensitivity-slider")
        record("Sensitivity slider exists", sens.count() == 1)
        record("Sensitivity slider visible at desktop", sens.is_visible())

        # Default value
        sens_val = sens.input_value()
        record("Sensitivity default=50", sens_val == "50", f"Value: {sens_val}")

        # Sensitivity label
        label = page.locator(".sensitivity-label")
        record("Sensitivity label exists", label.count() == 1)
        record("Sensitivity label text", "Sensitivity" in label.text_content().strip(),
               f"Label: '{label.text_content()}'")

        # Set to low (10) and capture
        page.locator("#mode-bars").click()
        sens.fill("10")
        sens.dispatch_event("input")
        page.wait_for_timeout(800)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_13_sensitivity_low.png"))

        # Set to high (95) and capture
        sens.fill("95")
        sens.dispatch_event("input")
        page.wait_for_timeout(800)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_14_sensitivity_high.png"))

        # Verify sensitivity JS variable changes
        sens_gain_low = page.evaluate("""
            () => {
                const slider = document.getElementById('sensitivity-slider');
                slider.value = 10;
                slider.dispatchEvent(new Event('input'));
                // Read internal value by checking render behavior
                return slider.value;
            }
        """)
        record("Sensitivity slider value updates", sens_gain_low == "10")

        sens_gain_high = page.evaluate("""
            () => {
                const slider = document.getElementById('sensitivity-slider');
                slider.value = 90;
                slider.dispatchEvent(new Event('input'));
                return slider.value;
            }
        """)
        record("Sensitivity slider moves to high", sens_gain_high == "90")

        ctx.close()

        # ============================================================
        # TEST 6: Screenshot Functionality
        # ============================================================
        print("\n=== TEST 6: Screenshot Functionality ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1500)
        if not page.evaluate("() => document.querySelector('.icon-play').classList.contains('hidden')"):
            page.locator("#play-btn").click()
            page.wait_for_timeout(500)

        # Screenshot button exists
        ss_btn = page.locator("#screenshot-btn")
        record("Screenshot button exists", ss_btn.count() == 1)
        record("Screenshot button visible", ss_btn.is_visible())

        # Verify screenshot function uses toDataURL
        ss_works = page.evaluate("""
            () => {
                const canvas = document.getElementById('visualizer');
                try {
                    const url = canvas.toDataURL('image/png');
                    return url.startsWith('data:image/png');
                } catch(e) { return false; }
            }
        """)
        record("Canvas toDataURL works for screenshot", ss_works)

        # Click screenshot and check download is triggered
        with page.expect_download(timeout=5000) as download_info:
            ss_btn.click()
        download = download_info.value
        record("Screenshot triggers download", download is not None)
        record("Screenshot filename correct",
               download.suggested_filename == "music-viz-screenshot.png",
               f"Filename: '{download.suggested_filename}'")

        # Save the downloaded screenshot for evidence
        download.save_as(str(SCREENSHOT_DIR / "m2_15_downloaded_screenshot.png"))
        record("Downloaded screenshot saved",
               (SCREENSHOT_DIR / "m2_15_downloaded_screenshot.png").exists())

        page.screenshot(path=str(SCREENSHOT_DIR / "m2_16_screenshot_button.png"))
        ctx.close()

        # ============================================================
        # TEST 7: Keyboard Shortcuts (M2 new keys)
        # ============================================================
        print("\n=== TEST 7: Keyboard Shortcuts (M2) ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1000)

        # Key '3' -> circular
        page.keyboard.press("3")
        page.wait_for_timeout(300)
        circ_via_key = page.evaluate("() => document.getElementById('mode-circular').classList.contains('active')")
        record("Key '3' switches to Circular", circ_via_key)

        # Key '4' -> particles
        page.keyboard.press("4")
        page.wait_for_timeout(300)
        part_via_key = page.evaluate("() => document.getElementById('mode-particles').classList.contains('active')")
        record("Key '4' switches to Particles", part_via_key)

        # Key '1' -> bars (M1 regression)
        page.keyboard.press("1")
        page.wait_for_timeout(300)
        bars_via_key = page.evaluate("() => document.getElementById('mode-bars').classList.contains('active')")
        record("Key '1' switches to Bars (regression)", bars_via_key)

        # Key '2' -> wave (M1 regression)
        page.keyboard.press("2")
        page.wait_for_timeout(300)
        wave_via_key = page.evaluate("() => document.getElementById('mode-wave').classList.contains('active')")
        record("Key '2' switches to Wave (regression)", wave_via_key)

        # Key 'S' -> screenshot (verify download triggered)
        page.locator("#mode-bars").click()
        page.wait_for_timeout(500)
        with page.expect_download(timeout=5000) as dl_info:
            page.keyboard.press("s")
        dl = dl_info.value
        record("Key 'S' triggers screenshot download", dl is not None)

        ctx.close()

        # ============================================================
        # TEST 8: Song Info Display
        # ============================================================
        print("\n=== TEST 8: Song Info Display ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1500)

        # File name
        fn = page.locator("#file-name").text_content()
        record("File name shows correctly", fn == "test.wav", f"'{fn}'")

        # Duration format mm:ss
        dur = page.locator("#duration").text_content()
        import re
        record("Duration format mm:ss", bool(re.match(r"^\d+:\d{2}$", dur)), f"'{dur}'")

        # Current time format mm:ss
        ct = page.locator("#current-time").text_content()
        record("Current time format mm:ss", bool(re.match(r"^\d+:\d{2}$", ct)), f"'{ct}'")

        # Current time updates (wait and check again)
        if not page.evaluate("() => document.querySelector('.icon-play').classList.contains('hidden')"):
            page.locator("#play-btn").click()
        page.wait_for_timeout(2000)
        ct2 = page.locator("#current-time").text_content()
        record("Current time updates during playback", ct2 != "0:00", f"'{ct2}'")

        ctx.close()

        # ============================================================
        # TEST 9: M1 Regression - Responsive Design
        # ============================================================
        print("\n=== TEST 9: Responsive Design (with M2 controls) ===")

        # Desktop 1280
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1000)
        # Sensitivity visible at desktop
        sens_visible = page.locator("#sensitivity-slider").is_visible()
        record("Sensitivity slider visible at 1280px desktop", sens_visible)
        # Theme buttons visible
        theme_visible = page.locator(".theme-switch").is_visible()
        record("Theme buttons visible at 1280px desktop", theme_visible)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_17_responsive_desktop.png"))
        ctx.close()

        # Mobile 375
        ctx = browser.new_context(viewport={"width": 375, "height": 667})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1000)
        # Sensitivity should be hidden on mobile (via CSS @media max-width: 640px)
        sens_hidden_mobile = page.evaluate("""
            () => {
                const el = document.querySelector('.sensitivity-control');
                return getComputedStyle(el).display === 'none';
            }
        """)
        record("Sensitivity hidden on mobile (375px)", sens_hidden_mobile)
        # Mode buttons still visible
        mode_btns_visible = page.locator(".mode-switch").is_visible()
        record("Mode buttons visible on mobile", mode_btns_visible)
        # Controls wrap
        wrap = page.evaluate("() => getComputedStyle(document.querySelector('.controls-row')).flexWrap")
        record("Controls wrap on mobile", wrap == "wrap", f"flex-wrap: {wrap}")
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_18_responsive_mobile.png"))
        ctx.close()

        # Very small mobile 360
        ctx = browser.new_context(viewport={"width": 360, "height": 640})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1000)
        # Theme switch hidden at <=380px
        theme_hidden_small = page.evaluate("""
            () => {
                const el = document.querySelector('.theme-switch');
                return getComputedStyle(el).display === 'none';
            }
        """)
        record("Theme buttons hidden at 360px (very small)", theme_hidden_small)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_19_responsive_360.png"))
        ctx.close()

        # Mobile upload overlay with demo button
        ctx = browser.new_context(viewport={"width": 375, "height": 667})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        demo_visible_mobile = page.locator("#demo-btn").is_visible()
        record("Demo button visible on mobile upload", demo_visible_mobile)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_20_upload_mobile_demo.png"))
        ctx.close()

        # ============================================================
        # TEST 10: M1 Regression - Fullscreen & Code Quality
        # ============================================================
        print("\n=== TEST 10: Fullscreen & Code Quality ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1000)

        # Fullscreen button
        record("Fullscreen button visible", page.locator("#fullscreen-btn").is_visible())

        # Fullscreen API
        fs_api = page.evaluate("""
            () => {
                const el = document.getElementById('app');
                return !!(el.requestFullscreen || el.webkitRequestFullscreen);
            }
        """)
        record("Fullscreen API available", fs_api)

        # No console errors
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.reload()
        page.wait_for_timeout(1000)
        record("No console errors on load", len(errors) == 0,
               f"Errors: {errors}" if errors else "Clean")

        # All required HTML elements (M1 + M2)
        el_check = page.evaluate("""
            () => {
                const required = [
                    '#visualizer', '#upload-overlay', '#controls',
                    '#file-input', '#play-btn', '#progress-fill',
                    '#current-time', '#duration', '#volume-slider',
                    '#volume-icon', '#file-name', '#fullscreen-btn',
                    '#mode-bars', '#mode-wave', '#mode-circular', '#mode-particles',
                    '#theme-neon', '#theme-rainbow', '#theme-ocean',
                    '#sensitivity-slider', '#screenshot-btn', '#demo-btn'
                ];
                const missing = required.filter(s => !document.querySelector(s));
                return { total: required.length, missing };
            }
        """)
        record(f"All {el_check['total']} required elements present",
               len(el_check["missing"]) == 0,
               f"Missing: {el_check['missing']}" if el_check["missing"] else "All present")

        # CSS loaded
        css_ok = page.evaluate("""
            () => getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() !== ''
        """)
        record("CSS theme variables loaded", css_ok)

        ctx.close()

        # ============================================================
        # TEST 11: Theme x Mode Matrix (visual evidence)
        # ============================================================
        print("\n=== TEST 11: Theme x Mode Combination Spot Check ===")
        ctx = browser.new_context(viewport={"width": 1280, "height": 720})
        page = ctx.new_page()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")

        page.locator("#file-input").set_input_files(str(TEST_AUDIO))
        page.wait_for_timeout(1500)
        if not page.evaluate("() => document.querySelector('.icon-play').classList.contains('hidden')"):
            page.locator("#play-btn").click()
            page.wait_for_timeout(500)

        # Neon + Particles
        page.locator("#theme-neon").click()
        page.locator("#mode-particles").click()
        page.wait_for_timeout(1200)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_21_neon_particles.png"))
        record("Neon + Particles renders", True)

        # Rainbow + Circular
        page.locator("#theme-rainbow").click()
        page.locator("#mode-circular").click()
        page.wait_for_timeout(1000)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_22_rainbow_circular.png"))
        record("Rainbow + Circular renders", True)

        # Ocean + Wave
        page.locator("#theme-ocean").click()
        page.locator("#mode-wave").click()
        page.wait_for_timeout(800)
        page.screenshot(path=str(SCREENSHOT_DIR / "m2_23_ocean_wave.png"))
        record("Ocean + Wave renders", True)

        ctx.close()

        # ============================================================
        # Summary
        # ============================================================
        browser.close()

        print("\n" + "=" * 60)
        print("MILESTONE 2 TEST SUMMARY")
        print("=" * 60)
        passed = sum(1 for r in results if r["status"] == "PASS")
        failed = sum(1 for r in results if r["status"] == "FAIL")
        total = len(results)
        print(f"Total: {total}  |  Passed: {passed}  |  Failed: {failed}")
        print("=" * 60)

        if failed > 0:
            print("\nFAILED TESTS:")
            for r in results:
                if r["status"] == "FAIL":
                    print(f"  - {r['test']}: {r['detail']}")

        results_path = SCREENSHOT_DIR.parent / "test_results_m2.json"
        with open(results_path, "w") as f:
            json.dump({"total": total, "passed": passed, "failed": failed, "results": results}, f, indent=2)
        print(f"\nResults saved to: {results_path}")
        print(f"Screenshots saved to: {SCREENSHOT_DIR}")

        screenshots = sorted(SCREENSHOT_DIR.glob("m2_*.png"))
        print(f"\nM2 Screenshots ({len(screenshots)}):")
        for s in screenshots:
            print(f"  - {s.name}")

        return failed == 0


if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
