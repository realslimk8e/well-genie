from selenium import webdriver
from selenium.webdriver.common.by import By
import time

# --- SETUP ---
driver = webdriver.Chrome()  # make sure ChromeDriver is installed
driver.get("http://localhost:5173/login")

time.sleep(2)  # wait for page to load

# --- TEST: Try logging in with empty fields ---
sign_in_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
sign_in_button.click()

time.sleep(1)  # wait for the form to update

# --- VALIDATION ---
try:
    error_message = driver.find_element(By.XPATH, "//*[contains(text(), 'Please enter email and password')]")
    if error_message.is_displayed():
        print("✅ TEST PASSED: Error message displayed for empty login fields.")
    else:
        print("❌ TEST FAILED: No error message shown.")
except:
    print("❌ TEST FAILED: Error message element not found.")

# --- CLEAN UP ---
driver.quit()
