"""
Minimal Chat Service - Just make it work
Handles Gemini API calls with function calling for health metrics
"""
import os
from datetime import date, timedelta
from typing import Optional
from google import genai
from google.genai import types
from sqlmodel import Session, select, func
from app.models import SleepEntry, ExerciseEntry, DietEntry
from app.llm.prompt import SYSTEM_PROMPT, TOOLS


class ChatService:
    """Minimal chat service with function calling"""
    
    def __init__(self, session: Session):
        self.session = session
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.5-flash"
    
    def get_last_week_bounds(self) -> tuple[date, date]:
        """Get last week's Monday-Sunday"""
        today = date.today()
        days_since_monday = today.weekday()
        last_monday = today - timedelta(days=days_since_monday + 7)
        last_sunday = last_monday + timedelta(days=6)
        return last_monday, last_sunday
    
    def execute_function(self, function_name: str) -> dict:
        """Execute a function call and return result"""
        start_date, end_date = self.get_last_week_bounds()
        
        if function_name == "get_sleep_last_week":
            query = select(func.sum(SleepEntry.hours), func.count(SleepEntry.id)).where(  # type: ignore
                SleepEntry.date >= start_date,
                SleepEntry.date <= end_date
            )
            result = self.session.exec(query).first()
            row = result or (0.0, 0)
            total_hours = row[0] or 0.0
            days = row[1] or 0
            
            return {
                "total_hours": round(total_hours, 1),
                "days_recorded": days,
                "week": f"{start_date} to {end_date}"
            }
        
        elif function_name == "get_steps_last_week":
            query = select(func.avg(ExerciseEntry.steps), func.count(ExerciseEntry.id)).where(  # type: ignore
                ExerciseEntry.date >= start_date,
                ExerciseEntry.date <= end_date
            )
            result = self.session.exec(query).first()
            row = result or (0.0, 0)
            avg_steps = row[0] or 0.0
            days = row[1] or 0
            
            return {
                "average_steps": round(avg_steps, 0),
                "days_recorded": days,
                "week": f"{start_date} to {end_date}"
            }
        
        elif function_name == "get_calories_last_week":
            query = select(func.sum(DietEntry.calories), func.count(DietEntry.id)).where(  # type: ignore
                DietEntry.date >= start_date,
                DietEntry.date <= end_date
            )
            result = self.session.exec(query).first()
            row = result or (0.0, 0)
            total_calories = row[0] or 0.0
            days = row[1] or 0
            
            return {
                "total_calories": round(total_calories, 0),
                "days_recorded": days,
                "week": f"{start_date} to {end_date}"
            }
        
        return {"error": f"Unknown function: {function_name}"}
    
    def chat(self, user_message: str, history: Optional[list] = None) -> dict:
        """
        Main chat method - handles one turn of conversation
        
        Returns:
            {"message": str, "function_called": str or None}
        """
        try:
            # Build contents array for the request
            contents = []
            
            # Add conversation history if provided
            if history:
                contents.extend(history)
            
            # Add current user message
            contents.append({
                "role": "user",
                "parts": [{"text": user_message}]
            })
            
            # Configure the request with system instruction and tools
            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=TOOLS,
                temperature=1.0
            )
            
            # Call Gemini with function calling enabled
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config
            )
            
            # Check if model wants to call a function
            function_called = None
            
            if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    # Check for function call
                    if hasattr(part, 'function_call') and part.function_call and part.function_call.name:
                        function_called = part.function_call.name
                        
                        # Execute the function
                        function_result = self.execute_function(function_called)
                        
                        # Build new contents with function result
                        new_contents = contents.copy()
                        
                        # Add model's function call to history
                        new_contents.append({
                            "role": "model",
                            "parts": [{
                                "function_call": {
                                    "name": function_called,
                                    "args": dict(part.function_call.args) if part.function_call.args else {}
                                }
                            }]
                        })
                        
                        # Add function result
                        new_contents.append({
                            "role": "user",
                            "parts": [{
                                "function_response": {
                                    "name": function_called,
                                    "response": function_result
                                }
                            }]
                        })
                        
                        # Get final response from model
                        final_response = self.client.models.generate_content(
                            model=self.model,
                            contents=new_contents,
                            config=types.GenerateContentConfig(
                                system_instruction=SYSTEM_PROMPT,
                                temperature=1.0
                            )
                        )
                        
                        # Extract text from final response
                        if final_response.text:
                            return {
                                "message": final_response.text,
                                "function_called": function_called
                            }
            
            # No function call - return direct text response
            if response.text:
                return {
                    "message": response.text,
                    "function_called": None
                }
            
            return {
                "message": "I'm not sure how to respond to that.",
                "function_called": None
            }
        
        except Exception as e:
            # User-friendly error messages
            error_str = str(e).lower()
            
            if "429" in error_str or "quota" in error_str or "resource_exhausted" in error_str:
                message = "I'm currently experiencing high demand. Please try again in a few moments."
            elif "401" in error_str or "unauthorized" in error_str or "api key" in error_str:
                message = "I'm having trouble connecting right now. Please contact support."
            elif "timeout" in error_str:
                message = "The request took too long. Please try asking a simpler question."
            elif "network" in error_str or "connection" in error_str:
                message = "I'm having trouble connecting. Please check your internet connection."
            else:
                message = "I'm having trouble processing your request right now. Please try again."
            
            return {
                "message": message,
                "function_called": None
            }