import styled, { css } from "styled-components";

export const Table = styled.table`
	width: 100%;
	padding-left: 1rem;
	padding-right: 1rem;
	border-radius: 7px;
	border-collapse: separate;
	border: 1px solid #e4e4e7;
`;

export const Tbody = styled.tbody`
	tr:not(#expanded) {
		background-color: #fafafb;
	}

	td:not(tr:last-child) {
		border-bottom: 1px solid #e4e4e7;
	}

	tr:not(#expanded) td:first-child {
		padding-left: 2rem;
	}
	tr:not(#expanded) td:last-child {
		padding-right: 2rem;
	}

	tr:not(#expanded) td {
		padding-top: 3rem;
		padding-bottom: 3rem;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}
`;

export const Thead = styled.tbody`
	th:first-child {
		padding-left: 2rem;
	}
	th:last-child {
		padding-right: 2rem;
	}
	th {
		font-size: 1.2rem;
		text-transform: uppercase;
		padding-top: 2rem;

		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}
`;

export const Tfoot = styled.tfoot`
	tr:first-child {
		padding-left: 2rem;
	}
	tr:last-child {
		padding-right: 2rem;
	}
	td {
		font-size: 1.2rem;
		text-transform: uppercase;
		padding-bottom: 2rem;
		padding-top: 2rem;

		padding-left: 0.5rem;
		padding-right: 0.5rem;
	}
`;

export const ExpandedRow = styled.div`
	padding-top: 2rem;
	padding-bottom: 2rem;
	margin-bottom: 1rem;
	display: flex;
	border: 1px solid #e4e4e7;
	background-color: #f4f4f5;
	border-top: 0;
	border-bottom-left-radius: 7px;
	border-bottom-right-radius: 7px;
	h2 {
		font-size: 1.5rem;
		margin-bottom: 2rem;
	}
	> *:not(:last-of-type) {
		margin-bottom: 1rem;
	}
`;

export const LeftLine = styled.div`
	height: auto;
	width: 2.5rem;
	border-right: 2px solid #a1a1aa;
	margin-right: 1.25rem;
`;

export const HStack = styled.div`
	display: grid;
	width: 100%;
	gap: ${(props) => props.gap};
	grid-template-columns: repeat(${(props) => props.columns}, 1fr);
	grid-row: 1;
`;

export const VStack = styled.div`
	display: flex;
	width: 100%;
	flex-direction: column;

	> * {
		margin-bottom: 1rem;
	}
`;

export const Item = styled.div`
	display: block;

	h3 {
		text-transform: uppercase;
		font-weight: bold;
		font-size: 1rem;
		margin-bottom: 0.1rem;
	}
	span {
		font-weight: normal;
		font-size: 1.2rem;
		text-align: right;
	}
`;

export const Badge = styled.span`
	text-transform: uppercase;
	padding-left: 0.5rem;
	padding-right: 0.5rem;
	padding-top: 0.25rem;
	padding-bottom: 0.25rem;
	border-radius: 3px;
	font-size: 0.875rem;
	font-weight: bold;

	${(props) => {
		switch (props.status) {
			case "completed":
				return css`
					color: #22c55e;
					background-color: #86efac;
				`;
			case "failed":
				return css`
					color: #ef4444;
					background-color: #fca5a5;
				`;
			case "created":
				return css`
					color: #6366f1;
					background-color: #c4b5fd;
				`;
			case "refunded":
				return css`
					color: #eab308;
					background-color: #fde047;
				`;
			case "charged":
				return css`
					color: #06b6d4;
					background-color: #67e8f9;
				`;
			default:
				return css`
					color: inherit;
					background-color: inherit;
				`;
		}
	}};
`;
