# E2E Testing with Playwright

## Setup

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Add to your `package.json`:
```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed"
}
```

Create the auth state directory:
```bash
mkdir -p e2e/.auth
echo '{"cookies":[],"origins":[]}' > e2e/.auth/user.json
```

Add `e2e/.auth/` to `.gitignore` — it contains session tokens.

---

## Seeding a test user

Before running tests you need a user in the DB. Add this script as `scripts/seed_test_user.py`:

```python
from sqlmodel import Session, select, create_engine
from app.models import User
from app.services.auth import hash_password

engine = create_engine("sqlite:///./test.db")

with Session(engine) as session:
    existing = session.exec(select(User).where(User.username == "admin")).first()
    if not existing:
        user = User(
            username="admin",
            hashed_password=hash_password("123"),
            email="admin@example.com",
        )
        session.add(user)
        session.commit()
        print("Test user created.")
    else:
        print("Test user already exists.")
```

Run it once before the test suite:
```bash
python scripts/seed_test_user.py
```

---

## Environment variables

```bash
# .env.test
TEST_USERNAME=admin
TEST_PASSWORD=123
BASE_URL=http://localhost:3000
```

---

## Before running tests

Start both servers manually in separate terminals before running the test suite.
Playwright does not auto-start servers — this avoids Windows shell spawning issues.

```bash
# Terminal 1 — backend (from the folder that contains the app/ package)
cd backend
uvicorn app.main:app --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev
```

---

## File structure

```
e2e/
  .auth/
    user.json           # saved session state (gitignored)
  auth.setup.ts         # logs in once, saves cookie
  auth.spec.ts          # login/logout flow tests
  diet.spec.ts          # DietPanel tests
  sleep.spec.ts         # SleepPanel tests
  exercise.spec.ts      # ExercisePanel tests
  settings.spec.ts      # SettingsPanel + DataManagement tests
  chat.spec.ts          # Chatbot tests (mocked API only)
playwright.config.ts
```

---

## Running

```bash
# All tests (headless)
npm run test:e2e

# With browser UI visible
npm run test:e2e:headed

# Interactive Playwright UI
npm run test:e2e:ui

# Just one file
npx playwright test e2e/diet.spec.ts

# Mocked chat tests only
npx playwright test --grep "mocked API"
```