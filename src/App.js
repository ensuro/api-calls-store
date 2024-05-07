import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
// Import Routes all
import { userRoutes } from "./routes/allRoutes";

function App() {
  let dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "API_DISPATCH_CLOCK" });
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <React.Fragment>
      <Routes>
        {userRoutes.map((route) => (
          <Route path={route.path} key={route.path} element={<route.component />} />
        ))}
      </Routes>
    </React.Fragment>
  );
}

export default App;
