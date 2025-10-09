# WellGenie

WellGenie is a Java desktop health companion app with a chatbot that consolidates scattered wellness data into clear, actionable insights. The system makes health tracking simple, engaging, and secure for students and young adults.

**Team Members**  
- Katherine Bauchman  
- Katherine Arnaud  
- Quinn Nguyen  

## 🛠 Repository Structure
- **main branch** → Stable code releases  
- **development branch** → Active development and integration  
- **feature branches** → Separate branches for each feature under development  

---

## 🚀 Getting Started
0. Install [uv](https://docs.astral.sh/uv/) & [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
1. Clone the repository:
   ```bash
   https://github.com/realslimk8e/well-genie.git
   ```
2. Setting up & run local dev:   
   A. First terminal
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   B. Second terminal
   ```bash
   cd backend
   uv sync
   uv run uvicorn app.main:app --reload
   ```
   
