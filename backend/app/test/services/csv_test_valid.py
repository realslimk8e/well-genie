
from selenium import webdriver
from selenium.webdriver.common.by import By
import time, os

# --- SETUP ---
driver = webdriver.Chrome()
driver.get("http://localhost:5173/dashboard")
time.sleep(2)

# --- TEST CASE: Valid CSV upload ---
file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
csv_path = os.path.abspath("valid_data.csv")
file_input.send_keys(csv_path)

time.sleep(2)  # wait for import to process

# --- VALIDATION ---
try:
    success_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'rows imported')]")
    if success_msg.is_displayed():
        print("✅ TEST PASSED: Valid CSV imported successfully.")
    else:
        print("❌ TEST FAILED: Success message not found.")
except:
    print("❌ TEST FAILED: Could not find success message after import.")

# --- CLEAN UP ---
driver.quit()
