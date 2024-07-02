import { createRoot } from "react-dom/client";
const root = createRoot(document.querySelector("#demo"));
export default Demo => root.render(<Demo />);
