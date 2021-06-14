/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

// Components
import React, { useEffect } from "react";
import { Route, Switch } from "react-router-dom";
// State
import {
  RecoilRoot,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
} from "recoil";
import { NotFound } from "strapi-helper-plugin";
import styled from "styled-components";
// Utils
import pluginId from "../../pluginId";
import Event from "../Event";
// Containers
import HomePage from "../HomePage";
import {
  committeesState,
  currentCommittee,
  currentCommitteeIDState,
  tokenState,
} from "../state/user";

const Flex = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  padding: 3rem;
`;

const AppContent = () => {
  const [token, setToken] = useRecoilState(tokenState);
  const committee = useRecoilValue(currentCommittee);

  const hydrateApp = useRecoilCallback(({ set, snapshot }) => async () => {
    const [{ id }, ...rest] = await snapshot.getPromise(committeesState);
    if (id) {
      set(currentCommitteeIDState, id);
    }
  });

  useEffect(() => {
    if (localStorage["jwtToken"]) {
      setToken(JSON.parse(localStorage.getItem("jwtToken")));
    } else if (sessionStorage["jwtToken"]) {
      setToken(JSON.parse(sessionStorage.getItem("jwtToken")));
    }
  }, []);

  useEffect(() => {
    if (token) hydrateApp();
  }, [token]);
  return (
    <Flex>
      <Container>
        <Switch>
          <Route path={`/plugins/${pluginId}`} component={HomePage} exact />
          <Route path={`/plugins/${pluginId}/:slug`} component={Event} exact />

          <Route component={NotFound} />
        </Switch>
      </Container>
    </Flex>
  );
};

const App = () => {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<div>loading, lol...</div>}>
        <AppContent />
      </React.Suspense>
    </RecoilRoot>
  );
};

export default App;
