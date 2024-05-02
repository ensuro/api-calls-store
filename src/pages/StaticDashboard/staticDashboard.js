import React, { useEffect, useState } from "react";
import _ from "lodash";
import { map } from "lodash";
import { Container } from "reactstrap";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { selectAPICallMultiple } from "../../store/api/selectors";
import { addRemoveApiSub } from "../../utils/helpers/store_helper";
import SubsManager from "./subsManager";

const componentApiCalls = function () {
  return [{ apiName: "activePolicies", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }];
};

const Static = ({ activePolicies, subscriptions }) => {
  let dispatch = useDispatch();
  const [sub, setSub] = useState(false);

  useEffect(() => {
    return addRemoveApiSub(dispatch, "staticDashboard", componentApiCalls());
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <h1>Dashboard to see API Subscriptions on RM Getspot</h1>
          <h3>RM Address: 0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6</h3>

          <hr />
          <h3>Method: activePolicies</h3>
          {activePolicies && activePolicies.value && (
            <>
              <h3>RESULT</h3>
              <h3>{activePolicies.value.toString()}</h3>
            </>
          )}

          {sub && (
            <>
              <hr />
              <SubsManager />
            </>
          )}

          <hr />
          {!_.isEmpty(subscriptions) && (
            <>
              <h4>Subscriptions: </h4>
              {map(Object.keys(subscriptions), (key) => (
                <React.Fragment key={key}>
                  <p>{key}</p>
                  {subscriptions[key].functions.map((s, idx) => (
                    <React.Fragment key={idx}>
                      <li>Api Name: {s.apiName}</li>
                      <li>Args: {s.args}</li>
                      <br />
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </>
          )}

          {sub ? (
            <Button onClick={() => setSub(false)}> Remove Subscription</Button>
          ) : (
            <Button onClick={() => setSub(true)}> Add Subscription</Button>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  const [activePolicies] = selectAPICallMultiple(state.APIReducer, componentApiCalls());
  const subscriptions = state.APIReducer.subscriptions;
  return { activePolicies, subscriptions };
};

export default connect(mapStateToProps, null)(Static);
