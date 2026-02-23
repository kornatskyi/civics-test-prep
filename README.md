# U.S. Civics Test Prep

This is a web application designed to help users prepare for the U.S. Civics Test. It features a modern, interactive interface, AI-powered answer evaluation, and automatic updates for questions with dynamic answers.

Access it on [civics-test-prep-1.onrender.com](civics-test-prep-1.onrender.com) (it's deployed to a free tier instance, so it has cold start, the first request will take a minute or so for the service to stand up)

## 🌟 Features

- **Two Test Versions**: Supports both the 2008 and 2025 versions of the U.S. Civics Test.
- **Interactive Quizzes**: Users can take practice quizzes with a random selection of questions.
- **AI-Powered Answer Grading**: Utilizes a Google Gemini LLM to intelligently grade user answers, allowing for variations in phrasing and spelling.
- **Dynamic Question Updates**: Automatically scrapes reliable web sources (like Wikipedia and government websites) to update answers to questions that change over time (e.g., "What is the name of the President of the United States now?").
- **Responsive Design**: The application is fully responsive and works on both desktop and mobile devices.

## 🛠️ Technology Stack

- **Frontend**:
  - React
  - TypeScript
  - Vite
  - Material-UI (MUI)
- **Backend**:
  - Python
  - FastAPI
  - Google Gemini (for answer grading and data extraction)

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Google Gemini API key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/civics-test-prep.git
    cd civics-test-prep
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Backend Setup:**
    It is recommended to use a virtual environment for the Python dependencies.
    ```bash
    # Create and activate a virtual environment
    python -m venv .venv
    source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`

    # Install Python dependencies
    pip install -r requirements.txt
    ```

4.  **Frontend Setup:**
    ```bash
    cd client
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    Navigate to the root of the project and run:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be running at `http://localhost:8000`.

2.  **Start the Frontend Development Server:**
    In a separate terminal, navigate to the `client` directory and run:
    ```bash
    npm run dev
    ```
    The frontend development server will be running at `http://localhost:5173`. The application will be accessible at this address. API requests will be proxied to the backend server.

## 📦 Deployment

This project is configured for deployment on [Render](https://render.com/). The `render.yaml` file defines the services and build commands.

The `build.sh` script handles the build process:
1.  Installs frontend dependencies (`npm install` in the `client` directory).
2.  Builds the frontend for production (`npm run build` in the `client` directory).
3.  Installs backend dependencies (`pip install -r requirements.txt`).

The `startCommand` in `render.yaml` starts the application using `uvicorn`.

## 🤖 API Endpoints

The backend exposes the following API endpoints:

-   `GET /api/test-configs`: Returns the available test configurations (2008 and 2025).
-   `GET /api/questions?n={number_of_questions}&testType={test_type}`: Returns a specified number of random questions for a given test type.
-   `GET /api/questions/{question_id}?testType={test_type}`: Returns a specific question by its ID.
-   `POST /api/submit-answer/{question_id}?testType={test_type}`: Submits a user's answer for grading.
-   `GET /api/dynamic-questions?testType={test_type}`: Returns a list of questions with dynamically updated answers.

## ⚖️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
