import React, { useEffect, useState } from "react";
import _ from "lodash";
import { Container } from "reactstrap";
import { Form, InputGroup, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { connect } from "react-redux";
import { selectAPICall } from "../../store/api/selectors";
import { map } from "lodash";

const DynamicDashboard = ({ state, subscriptions }) => {
  let dispatch = useDispatch();
  const [address, setAddress] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [result, setResult] = useState("");
  const [clicked, setClicked] = useState(false);

  const dispatchCall = () => {
    if (address && endpoint) dispatch({ type: "API_CALL", apiName: endpoint, args: [address] });
    setClicked(true);
  };

  useEffect(() => {
    if (address && endpoint && clicked) {
      const res = selectAPICall(state, endpoint, [address]);
      if (res) {
        setResult(res);
        setClicked(false);
      }
    }
  }, [clicked, address, endpoint, state]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <h1>API Endpoints - Sepolia</h1>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Wallet Address</Form.Label>
              <InputGroup>
                <Form.Control
                  placeholder="0x00"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value || "")}
                />
              </InputGroup>
            </Form.Group>
            <br />
            <Form.Group className="mb-3">
              <Form.Label>API endpoint</Form.Label>
              <InputGroup>
                <Form.Select onChange={(e) => setEndpoint(e.target.value || "")} aria-label="Select the API endpoint">
                  <option value="">Select the API endpoint</option>
                  <option value="ethBalance">ETH Balance (Sepolia)</option>
                  <option value="ethPrice">ETH Price</option>
                </Form.Select>
              </InputGroup>
            </Form.Group>
          </Form>
          <br />
          <Button onClick={dispatchCall} disabled={!address || !endpoint}>
            Dispatch call
          </Button>

          {address && endpoint && result && (
            <>
              <hr />
              <h1>RESULT</h1>
              <h3>{result.toString()}</h3>
            </>
          )}
          <hr />
          {!_.isEmpty(subscriptions) && (
            <>
              <h5>Subscriptions: </h5>
              {map(Object.keys(subscriptions), (key) => (
                <React.Fragment key={key}>
                  <p>{key}</p>
                  <p>{subscriptions[key]}</p>
                </React.Fragment>
              ))}
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  const subscriptions = state.APIReducer.subscriptions;

  return { state: state.APIReducer, subscriptions };
};

export default connect(mapStateToProps, null)(DynamicDashboard);
