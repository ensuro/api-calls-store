import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { selectAPICallMultiple } from "../../store/api/selectors";
import { addRemoveApiSub } from "../../utils/helpers/store_helper";

const componentApiCalls = function () {
  return [{ apiName: "ethPrice", args: [] }];
};

const SubsManager = ({ ethPrice }) => {
  let dispatch = useDispatch();

  useEffect(() => {
    return addRemoveApiSub(dispatch, "subsManager", componentApiCalls());
  }, [dispatch]);

  return (
    <React.Fragment>
      <h3>Method: ethPrice</h3>
      {ethPrice && ethPrice.value && (
        <>
          <h3>RESULT</h3>
          <h3>{ethPrice.value.toString()}</h3>
        </>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  const [ethPrice] = selectAPICallMultiple(state.APIReducer, componentApiCalls());
  return { ethPrice };
};

export default connect(mapStateToProps, null)(SubsManager);
