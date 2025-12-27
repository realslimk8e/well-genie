"""
System prompts and tool definitions for WellGenie chat
"""

SYSTEM_PROMPT = """You are WellGenie, a health and wellness assistant.

Your role:
- Help users understand their health data (sleep, exercise, diet)
- Answer questions using ONLY available tools
- Be conversational and helpful

CRITICAL RULES:
1. Always use tools to get data - never guess or estimate
2. "last week" means the most recent complete Monday-Sunday calendar week
3. If you don't have a tool for something, explain what you CAN help with

When you get data from tools, explain it clearly and conversationally to the user."""

# Tool definitions for Gemini function calling
# Format for models.generate_content API
TOOLS = [
    {
        "function_declarations": [
            {
                "name": "get_sleep_last_week",
                "description": "Get total hours of sleep for last week (Monday-Sunday). Returns total hours and days recorded.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "get_steps_last_week",
                "description": "Get average daily steps for last week (Monday-Sunday). Returns average steps per day.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "get_calories_last_week",
                "description": "Get total calories consumed last week (Monday-Sunday). Returns total calories and days recorded.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        ]
    }
]