type Question = {
  id: number;
  question: string;
};

export const getRandomQuestion = async (): Promise<Question> => {
  const res = await fetch("/api/questions/-1");
  const j = await res.json();
  console.log(j);

  return {
    id: j["id"],
    question: j["question"],
  };
};
