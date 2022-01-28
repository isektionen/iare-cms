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
	tr {
		cursor: pointer;
	}

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
		font-weight: bold;
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
	grid-template-columns: 40% 30% 30%;
	grid-row: 1;
`;

export const ProductDetail = styled.div`
	display: flex;
	width: 100%;
	> *:first-child {
		width: 40%;
	}
	> *:not(first-child) {
		width: 20%;
	}
	justify-content: space-between;
	grid-column: span 1;
`;

export const OptionDetail = styled.div`
	display: flex;
	margin-left: 8rem;
	> *:not(:last-of-type) {
		margin-right: 3rem;
	}
	grid-column: span 2;
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
	grid-area: ${(props) => props.area};

	h3 {
		text-transform: uppercase;
		font-weight: bold;
		font-size: 1rem;
		margin-bottom: 0.1rem;
	}
	span {
		display: inline-flex;

		> *:not(:last-of-type) {
			margin-right: 1.5rem;
		}
		font-weight: normal;
		font-size: 1.2rem;
		text-align: right;
	}
`;

export const Dot = styled.span`
	width: 0.625rem;
	height: 0.625rem;
	line-height: 0.625rem;
	border-radius: 50%;
	text-transform: capitalize;
	${(props) => {
		switch (props.status) {
			case true:
				return css`
					background-color: #22c55e;
				`;
			case false:
				return css`
					background-color: #ef4444;
				`;

			default:
				return css`
					background-color: #52525b;
				`;
		}
	}}
	*:first-child {
		margin-left: 1.5rem;
	}
`;

export const Flex = styled.div`
	display: flex;
	height: 100%;

	> *:not(:last-of-type) {
		margin-right: 1.5rem;
	}
`;

export const Tag = styled.span`
	display: inline-flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	padding-left: 0.75rem;
	padding-right: 0.75rem;
	padding-top: 0.25rem;
	padding-bottom: 0.25rem;
	height: 18px;
	border-radius: 18px;
	font-size: 0.875rem;
	color: #f4f4f5;
	text-align: center;
	background-color: #18181b;
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
					color: #3b82f6;
					background-color: #93c5fd;
				`;
			default:
				return css`
					color: #52525b;
					background-color: #a1a1aa;
				`;
		}
	}};
`;

export const Progress = styled.span`
	width: ${(props) => props.value}%;
	${({ value }) => {
		if (value < 33) {
			return css`
				background-color: #10b981;
			`;
		}

		if (value < 67) {
			return css`
				background-color: #f59e0b;
			`;
		}

		return css`
			background-color: #ef4444;
		`;
	}};
`;

export const Capacity = styled.div`
	width: 10rem;
	height: 1.2rem;
	overflow: hidden;
	border-radius: 1.2rem;
	background-color: #e4e4e7;
	position: relative;
	> ${Progress} {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
	}
`;

export const Product = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`;

export const Card = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`;

export const Spacer = styled.div`
	width: 100%;
	justify-self: stretch;
`;

export const Heading = styled.h3`
	text-transform: uppercase;
	font-weight: bold;
	font-size: 1rem;
	margin-bottom: 0.1rem;
`;

export const Header = styled.div`
	display: flex;
	width: 100%;
	justify-content: flex-end;
	align-items: center;
	padding-bottom: 3rem;
	> *:not(*:last-child) {
		margin-right: 1rem;
	}
	> ${Heading} {
		margin-right: auto;
		font-size: 2rem;
	}
`;

export const Stat = styled.div`
	display: flex;
	*:first-child {
		margin-right: 2rem;
	}
`;

export const ProductArea = styled.div`
	display: flex;

	width: 100%;
	position: relative;
	height: 25vh;
	padding: 2rem;
	justify-content: stretch;
	*:not(:last-of-type) {
		margin-right: 2rem;
	}
	margin-bottom: 1rem;
`;
