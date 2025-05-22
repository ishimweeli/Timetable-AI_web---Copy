import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./style/Ui/index.css";
import "./style/Ui/base.css";
import "./style/palettes/pallete.css";
import "./style/ui-settings.css";

createRoot(document.getElementById("root")!).render(<App />);
