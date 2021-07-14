import React from "react";
import { Link } from "react-router-dom";

import Wrapper from "./Wrapper";
import styled from "styled-components";

const ProjectWrapper = styled.div`
  margin-left: 25%;
`;

const LeftMenuHeader = () => (
  <Wrapper>
    <Link to="/" className="leftMenuHeaderLink">
      <ProjectWrapper>
        <div className="projectName" />
      </ProjectWrapper>
    </Link>
  </Wrapper>
);

export default LeftMenuHeader;
