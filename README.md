# U.S. Citizenship Test Practice App

An interactive web application to help users prepare for the U.S. Citizenship Test, featuring AI-powered answer verification and dynamic question updates.

## 🌟 Features

- **Interactive Quiz Interface**: Take practice tests with 10 random questions from the official USCIS test bank
- **AI-Powered Answer Verification**: Uses LLM (Large Language Models) to intelligently evaluate user answers beyond exact matching
- **Dynamic Questions**: Automatically updates answers for time-sensitive questions (e.g., "Who is the current President?")
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Real-time Feedback**: Immediate response validation with detailed explanations
- **Progress Tracking**: Track your progress through the test with a clear indicator

## 🛠 Technology Stack

### Frontend
- React with TypeScript
- Material-UI (MUI) for component design
- Vite for build tooling and development server

### Backend
- FastAPI (Python)
- Google Gemini and Groq AI for answer verification
- Async task scheduling for dynamic question updates

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- API keys for Gemini and Groq AI

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/citizenship-test-app.git
cd citizenship-test-app
```

2. Set up the backend
```bash
# Create and activate virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your API keys
cp .env.example .env
```

3. Set up the frontend
```bash
cd client
npm install
```

### Running the Application

1. Start the backend server
```bash
uvicorn main:app --host 0.0.0.0 --port 8080
# or
fastapi dev
```

2. Start the frontend development server
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## 🌐 API Endpoints

- `GET /api/questions?n={number}` - Get n random questions
- `GET /api/questions/{id}` - Get a specific question
- `POST /api/submit-answer/{id}` - Submit an answer for verification
- `GET /api/dynamic-questions` - Get questions with dynamic answers

## 🧠 Key Features Implementation

### AI-Powered Answer Verification
The application uses LLMs to verify answers contextually, allowing for variations in correct answers while maintaining accuracy. For example:

```python
prompt = f"""
    Question: {question}
    Actual answers: {correct_answers}
    User's answer: {user_answer}
    
    Reply only with "Correct" or "Incorrect"
"""
```

### Dynamic Question Updates
Questions with time-sensitive answers (e.g., current political figures) are automatically updated through scheduled tasks:

```python
async def scheduled_dynamic_questions_update_task():
    while True:
        await questions_service.update_dynamic_questions()
        await asyncio.sleep(7 * 24 * 60 * 60)  # Weekly updates
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- USCIS for providing the official citizenship test questions
- The FastAPI and React communities for excellent documentation
- Material-UI team for the component library
