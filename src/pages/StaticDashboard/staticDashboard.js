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
  return [{ apiName: "ethBalance", args: ["0x72E425D9cBec1709b290d9bbf7a5Ec9c27dfb7F1"] }];
};

const Static = ({ ethBalance, subscriptions }) => {
  let dispatch = useDispatch();
  const [sub, setSub] = useState(false);

  useEffect(() => {
    return addRemoveApiSub(dispatch, "staticDashboard", componentApiCalls());
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <h1>Dashboard to see API Subscriptions</h1>
          <h3>Wallet: 0x72E425D9cBec1709b290d9bbf7a5Ec9c27dfb7F1</h3>

          <hr />
          <h3>Method: ethBalance</h3>
          {ethBalance && ethBalance.value && (
            <>
              <h3>RESULT</h3>
              <h3>{ethBalance.value.toString()}</h3>
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
  const [ethBalance] = selectAPICallMultiple(state.APIReducer, componentApiCalls());
  const subscriptions = state.APIReducer.subscriptions;
  return { ethBalance, subscriptions };
};

export default connect(mapStateToProps, null)(Static);
