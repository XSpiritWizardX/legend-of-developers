import json
import os
import unittest

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BASE_URL = os.environ.get("E2E_BASE_URL", "http://127.0.0.1:5000")
WAIT_SECONDS = 10


class ReleaseBrowserE2E(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1440,1000")
        options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
        cls.driver = webdriver.Chrome(options=options)
        cls.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                window.__e2eFailures = [];
                window.addEventListener('error', (event) => {
                  window.__e2eFailures.push(`window-error: ${event.message}`);
                });
                window.addEventListener('unhandledrejection', (event) => {
                  window.__e2eFailures.push(`unhandled-rejection: ${String(event.reason)}`);
                });
                const originalFetch = window.fetch;
                window.fetch = async (...args) => {
                  try { return await originalFetch(...args); }
                  catch (error) {
                    window.__e2eFailures.push(`fetch-failure: ${args[0]}: ${String(error)}`);
                    throw error;
                  }
                };
            """
        })
        cls.wait = WebDriverWait(cls.driver, WAIT_SECONDS)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def setUp(self):
        self.driver.delete_all_cookies()
        self.driver.get(f"{BASE_URL}/")
        self.driver.execute_script("localStorage.clear(); sessionStorage.clear();")

    def tearDown(self):
        failures = self.driver.execute_script("return window.__e2eFailures || [];") or []
        severe_logs = [
            entry["message"] for entry in self.driver.get_log("browser")
            if entry.get("level") == "SEVERE"
            and "favicon" not in entry.get("message", "").lower()
        ]
        self.assertEqual(failures, [], f"Browser runtime failures: {failures}")
        self.assertEqual(severe_logs, [], f"Browser console errors: {severe_logs}")

    def wait_for_text(self, text):
        self.wait.until(EC.presence_of_element_located((By.XPATH, f"//*[contains(normalize-space(), {json.dumps(text)})]")))

    def api(self, method, path, body=None):
        script = """
            const [method, path, body, done] = arguments;
            const csrf = document.cookie.split('; ').find((item) => item.startsWith('csrf_token='))?.split('=')[1];
            const options = { method, credentials: 'include', headers: {} };
            if (method !== 'GET') options.headers['X-CSRFToken'] = decodeURIComponent(csrf || '');
            if (body !== null) {
              options.headers['Content-Type'] = 'application/json';
              options.body = JSON.stringify(body);
            }
            fetch(path, options)
              .then(async (response) => done({ status: response.status, body: await response.json() }))
              .catch((error) => done({ status: 0, body: { error: String(error) } }));
        """
        return self.driver.execute_async_script(script, method, path, body)

    def test_landing_and_guest_game_boot_with_local_save_restore(self):
        self.driver.get(f"{BASE_URL}/")
        self.wait_for_text("The Legend of Developer: The Blight of AI")
        self.wait_for_text("Play as a guest")

        guest_save = {
            "version": 3,
            "mapId": "overworld",
            "player": {
                "x": 1568,
                "y": 992,
                "hp": 6,
                "maxHp": 6,
                "coins": 17,
                "keys": 0,
                "inventory": {"htmlSword": True, "maps": {}},
                "equippedSlots": [None, None],
            },
            "flags": {},
        }
        self.driver.execute_script(
            "localStorage.setItem('legend-of-devs-save-1', JSON.stringify(arguments[0]));",
            guest_save,
        )
        self.driver.get(f"{BASE_URL}/game")
        self.wait_for_text("Select a File")
        self.wait_for_text("Guest files are saved on this device")
        self.wait_for_text("BEARER OF THE BLADE")
        self.wait_for_text("◆ 17")

        self.driver.refresh()
        self.wait_for_text("BEARER OF THE BLADE")
        file_one = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[.//*[contains(text(),'FILE 1')]]")))
        file_one.click()
        self.wait_for_text("Continue the Quest")
        self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "canvas[aria-label*='Legend of Developer']")))

    def test_demo_login_session_restore_and_cloud_save_crud(self):
        self.driver.get(f"{BASE_URL}/login")
        demo_button = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Demo Login']")))
        demo_button.click()
        self.wait.until(lambda driver: "/game" in driver.current_url)
        self.wait_for_text("Your adventure is saved to your account")

        auth = self.api("GET", "/api/auth/")
        self.assertEqual(auth["status"], 200)
        self.assertEqual(auth["body"]["email"], "demo@aa.io")

        cloud_save = {
            "version": 3,
            "mapId": "overworld",
            "player": {
                "x": 1568,
                "y": 992,
                "hp": 6,
                "maxHp": 8,
                "coins": 42,
                "keys": 1,
                "inventory": {"htmlSword": True, "maps": {}},
                "equippedSlots": [None, None],
            },
            "flags": {"firstWebpage": True},
        }
        created = self.api("PUT", "/api/game/saves/1", {"data": cloud_save})
        self.assertEqual(created["status"], 200)
        self.assertEqual(created["body"]["save"]["slot"], 1)

        listed = self.api("GET", "/api/game/saves")
        self.assertEqual(listed["status"], 200)
        self.assertTrue(any(save["slot"] == 1 for save in listed["body"]["saves"]))

        self.driver.refresh()
        self.wait_for_text("GROVE SIGIL CLAIMED")
        self.wait_for_text("◆ 42")

        self.driver.get(f"{BASE_URL}/")
        self.wait_for_text("Your progress saves to your account")
        self.driver.refresh()
        self.wait_for_text("Your progress saves to your account")

        deleted = self.api("DELETE", "/api/game/saves/1")
        self.assertEqual(deleted["status"], 200)
        self.driver.get(f"{BASE_URL}/game")
        self.wait_for_text("NEW GAME")


if __name__ == "__main__":
    unittest.main(verbosity=2)
