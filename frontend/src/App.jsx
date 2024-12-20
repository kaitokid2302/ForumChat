import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  return (
    <div
      className="text-red-900"
      onClick={() => {
        setCount(count + 1);
      }}
    >
      lam dep trai
      {count}
    </div>
  );
}

export default App;
