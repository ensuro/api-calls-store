import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { selectAPICallMultiple } from "../../store/api/selectors";

const componentApiCalls = function () {
  return [{ apiName: "gwp", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }];
};

const SubsManager = ({ gwp }) => {
  let dispatch = useDispatch();

  // Initial useEffects
  useEffect(() => {
    dispatch({ type: "API_ADD_SUBSCRIPTION", key: "subsManager", componentApiCalls: componentApiCalls() });
    return () => {
      dispatch({ type: "API_REMOVE_SUBSCRIPTION", key: "subsManager" });
    };
  }, [dispatch]);

  return (
    <React.Fragment>
      <h3>Method: gwp</h3>
      {gwp && gwp.value && (
        <>
          <h3>RESULT</h3>
          <h3>{gwp.value.toString()}</h3>
        </>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  const [gwp] = selectAPICallMultiple(state.APIReducer, componentApiCalls());
  return { gwp };
};

export default connect(mapStateToProps, null)(SubsManager);
