import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import LandingPage from "./components/landing/LandingPage/LandingPage";
import FreePostDetail from "./components/boards/Detail/FreePostDetail";
import FreePostList from "./components/boards/List/FreePostList";
import FreePostCreate from "./components/boards/Create/FreePostCreate";
import FreePostEdit from "./components/boards/Edit/FreePostEdit";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  let navigate = useNavigate();

  if (!token) {
    navigate("/");
    return null;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/FreePostCreate"
            element={
              <PrivateRoute>
                <FreePostCreate />
              </PrivateRoute>
            }
          />
          <Route
            path="/FreePostList"
            element={
              <PrivateRoute>
                <FreePostList />
              </PrivateRoute>
            }
          />
          <Route path="/FreePostDetail" element={<FreePostDetail />} />
          <Route path="/FreePostEdit" element={<FreePostEdit />} />
          <Route path="/FreePostDetail/:id" element={<FreePostDetail />} />
          <Route path="/FreePostEdit/:id" element={<FreePostEdit />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
