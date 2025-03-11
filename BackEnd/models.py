from openai import OpenAI
import os

CHAT_KEY = os.getenv("CHAT_KEY")

client = OpenAI(api_key=CHAT_KEY)

def generate_response(prompt: str):
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            store=True,
            messages=[{"role": "user", "content": prompt}]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"