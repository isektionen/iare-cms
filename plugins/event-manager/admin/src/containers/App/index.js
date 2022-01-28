/**
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

// Components
import React from "react";
import { Route, Switch } from "react-router-dom";
// State
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil";
import { NotFound, CheckPagePermissions } from "strapi-helper-plugin";
import styled from "styled-components";
// Utils
import pluginId from "../../pluginId";
// Containers
import Events from "../Events";
import pluginPermissions from "../../permissions";

import Orders from "../Orders/index";
import { useStrapi } from "../hooks/use-strapi";

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
	return (
		<CheckPagePermissions permissions={pluginPermissions.main}>
			<Flex>
				<Container>
					<Switch>
						<Route
							path={`/plugins/${pluginId}`}
							component={Events}
							exact
						/>
						<Route
							path={`/plugins/${pluginId}/:slug/orders`}
							component={Orders}
							exact
						/>

						<Route component={NotFound} />
					</Switch>
				</Container>
			</Flex>
		</CheckPagePermissions>
	);
};

const App = () => {
	return (
		<RecoilRoot>
			<React.Suspense fallback={<div></div>}>
				<AppContent />
			</React.Suspense>
		</RecoilRoot>
	);
};

export default App;
