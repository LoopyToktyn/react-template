// src/App.tsx
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RoutesComponent from "./routes";
import AppLayout from "@components/AppLayout";

function App() {
  return (
    <>
      <AppLayout>
        <RoutesComponent />
      </AppLayout>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
