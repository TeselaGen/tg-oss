import { createRoot } from "react-dom/client";
export default Demo =>
  createRoot(document.querySelector("#demo")).render(<Demo />);
