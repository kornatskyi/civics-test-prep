/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import "./App.css";
import styles from "./assets/styles/Test.module.css";
import { getRandomQuestion } from "./api";

function App() {

  const [question, setQuestion] = useState("")

  useEffect(() => {
    async function startFetching() {
      const result = await getRandomQuestion();
      if (!ignore) {
        setQuestion(result.question);
      }
    }

    let ignore = false;
    startFetching();
    return () => {
      ignore = true;
    }

  }, [])

  return (
    <>
      <div className={styles.testContainer}>
        <h1>US naturalization test</h1>
        <h2>Civics Test</h2>
        <p>{question}</p>
        <input placeholder="Input your answer here" />
        <br />
        <button>Submit</button>
      </div>
    </>
  );
}

export default App;
