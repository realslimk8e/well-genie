from selenium import webdriverpi
from selenium.webdriver.common.by import By
import time, os

# --- SETUP ---
driver = webdriver.Chrome()
driver.get("http://localhost:5173/dashboard")
time.sleep(2)

# --- TEST CASE: Invalid CSV upload (missing headers) ---
file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
csv_path = os.path.abspath("invalid_data.csv")
file_input.send_keys(csv_path)

time.sleep(2)  # wait for response

# --- VALIDATION ---
try:
    error_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'Import failed')]")
    if error_msg.is_displayed():
        print("✅ TEST PASSED: Error message shown for invalid CSV.")
    else:
        print("❌ TEST FAILED: No error message for invalid CSV.")
except:
    print("❌ TEST FAILED: Error message element not found.")

# --- CLEAN UP ---
driver.quit()
