/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import "./App.css";
import styles from "./assets/styles/Test.module.css";

function App() {

  return (
    <>
      <div className={styles.testContainer}>
        <h1>US naturalization test</h1>
        <h2>Civics Test</h2>
        <p>This is some question</p>
        <input placeholder="Input your answer here" />
        <br />
        <button>Submit</button>
      </div>
    </>
  );
}

export default App;
