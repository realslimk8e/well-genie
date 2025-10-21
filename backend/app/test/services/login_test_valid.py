from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time

# --- SETUP ---
# Launch Chrome (make sure ChromeDriver is installed)
driver = webdriver.Chrome()

# Open your WellGenie login page
driver.get("http://localhost:5173/login")

# Wait a few seconds for the page to load
time.sleep(2)

# --- TEST STEPS ---
# 1. Find the email input box and type a valid email
email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
email_input.send_keys("user@wellgenie.dev")

# 2. Find the password input box and type a password
password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
password_input.send_keys("password123")

# 3. Click the Sign in button
sign_in_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
sign_in_button.click()

# Wait for redirect
time.sleep(3)

# --- VALIDATION ---
# After a successful login, you should be redirected to /dashboard
current_url = driver.current_url

if "/dashboard" in current_url:
    print("✅ TEST PASSED: Valid login redirected to Dashboard.")
else:
    print("❌ TEST FAILED: Did not redirect properly.")

# --- CLEAN UP ---
driver.quit()
