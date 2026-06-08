import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Factiuni from "./pages/Factiuni";
import Jucatori from "./pages/Jucatori";
import Masini from "./pages/Masini";
import Case from "./pages/Case";
import Afaceri from "./pages/Afaceri";
import Payday from "./pages/Payday";
import Alegeri from "./pages/Alegeri";
import Consola from "./pages/Consola";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/factiuni" element={<Factiuni />} />
          <Route path="/jucatori" element={<Jucatori />} />
          <Route path="/masini" element={<Masini />} />
          <Route path="/case" element={<Case />} />
          <Route path="/afaceri" element={<Afaceri />} />
          <Route path="/payday" element={<Payday />} />
          <Route path="/alegeri" element={<Alegeri />} />
          <Route path="/consola" element={<Consola />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
