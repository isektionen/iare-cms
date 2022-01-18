import React, { useEffect, memo, useMemo, useState, useCallback } from "react";
import { useStrapi } from "../hooks/use-strapi";
import { useHistory, useParams } from "react-router-dom";
import { useTable } from "react-table";
import {
	Badge,
	ExpandedRow,
	Item,
	HStack,
	Tbody,
	Thead,
	Tfoot,
	Table,
	LeftLine,
	VStack,
} from "./components";
const conformAmount = (amount, currency, format = true) => {
	if (!format) {
		if (_.isObject(amount)) {
			return amount.amount / 100;
		}
		return amount / 100;
	}
	if (_.isObject(amount)) {
		return `${amount.amount / 100} ${amount.currency}`;
	}
	return `${amount / 100} ${currency || "SEK"}`;
};

const RenderCell = (cell) => {
	switch (cell.column.id) {
		case "status":
			return <Badge status={cell.value}>{cell.render("Cell")}</Badge>;
		default:
			return <span>{cell.render("Cell")}</span>;
	}
};

const renderOption = (option) => {
	switch (option.type) {
		case "switch":
			return option.data.join(", ");
		case "input":
			return option.data.join(", ");
		case "select":
			return option.data.map((p) => p.label).join(", ");
	}
};

const Orders = () => {
	const { isAuthorized, getEventOrders } = useStrapi();
	const router = useHistory();
	const params = useParams();

	const eventSlug = useMemo(() => params.slug, [params]);

	const [orders, setOrders] = useState([]);
	const columns = useMemo(
		() => [
			{
				Header: "Status",
				accessor: "status",
			},

			{
				Header: "Fullname",
				accessor: "fullname",
			},
			{
				Header: "Email",
				accessor: "email",
			},
			{
				Header: "Phone",
				accessor: "phone",
			},
			{
				Header: "Amount",
				accessor: "amountFormatted",
				Footer: (info) => {
					const total = useMemo(
						() =>
							info.rows.reduce(
								(sum, row) => sum + row.original.amount,
								0
							),
						[info.rows]
					);
					return <React.Fragment>{total} SEK</React.Fragment>;
				},
			},
			{
				Header: "Reference",
				accessor: "reference",
				Footer: (info) => {
					console.log(info);
					const uniqTotal = _.uniq(
						info.rows.map(({ values }) => values.reference)
					).length;
					return <React.Fragment>{uniqTotal} unique</React.Fragment>;
				},
			},
		],
		[]
	);

	const [isExpanded, setIsExpanded] = useState(0);

	const handleExandable = useCallback(
		(id) => {
			if (id === isExpanded) {
				return setIsExpanded(null);
			}
			setIsExpanded(id);
		},
		[isExpanded, setIsExpanded]
	);
	const {
		getTableProps,
		getTableBodyProps,
		rows,
		prepareRow,
		headers,
		footerGroups,
	} = useTable({
		columns,

		data: orders.map(({ data }) => ({
			__paymentId: data?.paymentData?.paymentId ?? "-",
			reference: data.order.reference,
			fullname:
				data.customerData.firstName + " " + data.customerData.lastName,
			email: data.customerData.email,
			phone:
				`(${data.customerData.phoneNumber.prefix})` +
				" " +
				data.customerData.phoneNumber.number,
			amount: conformAmount(
				data.order.amount,
				data.order.currency,
				false
			),
			amountFormatted: conformAmount(
				data.order.amount,
				data.order.currency
			),
			status: _.first(
				_.sortBy(data.status, (obj) => {
					let score = obj.timestamp;

					switch (obj.status) {
						case "completed":
							score += 1e6;
							break;
						case "refunded":
							score += 2e6;
							break;
						case "charged":
							score += 0.5e6;
							break;
						case "failed":
							score += 1e6;
							break;
						case "created":
							break;
					}
					return score;
				}).reverse()
			).status,
			__event: eventSlug,
			__expandedData: {
				products: data.order.items.reduce((acc, it) => {
					const options = data.options.filter((p) =>
						p.reference.includes(it.__reference)
					);
					const item = _.omit(it, "unit", "taxRate", "taxAmount");
					return [
						...acc,
						{
							options,
							item: {
								...item,
								unitPriceFormatted:
									item.unitPrice === 0
										? "-"
										: `${item.unitPrice / 100} ${
												data.order.currency
										  }`,
								grossTotalAmountFormatted:
									item.grossTotalAmount === 0
										? "Free"
										: `${item.grossTotalAmount / 100} ${
												data.order.currency
										  }`,
								netTotalAmountFormatted:
									item.netTotalAmount === 0
										? "Free"
										: `${item.netTotalAmount / 100} ${
												data.order.currency
										  }`,
							},
						},
					];
				}, []),
			},
		})),
	});

	useEffect(() => {
		if (!isAuthorized(eventSlug)) {
			router.goBack();
		}
	}, [eventSlug]);

	useEffect(() => {
		(async () => setOrders(await getEventOrders(eventSlug)))();
	}, [eventSlug]);

	return (
		<div>
			<Table {...getTableProps()}>
				<Thead>
					<tr>
						{headers.map((column) => (
							<th {...column.getHeaderProps()}>
								{column.render("Header")}
							</th>
						))}
					</tr>
				</Thead>
				<Tbody {...getTableBodyProps()}>
					{rows.map((row, i) => {
						prepareRow(row);

						const { key, ...props } = row.getRowProps();

						return (
							<React.Fragment key={key}>
								<tr
									onClick={() => handleExandable(i)}
									{...props}
								>
									{row.cells.map((cell) => {
										return (
											<td {...cell.getCellProps()}>
												<RenderCell {...cell} />
											</td>
										);
									})}
								</tr>
								{isExpanded === i && (
									<tr {...props} id="expanded">
										<td colSpan="8">
											<ExpandedRow>
												<LeftLine />
												<VStack>
													<h2>Details</h2>
													{row.original.__expandedData.products.map(
														(product) => (
															<HStack
																columns={6}
																gap="0.5rem"
																key={
																	product.item
																		.__reference
																}
															>
																<Item>
																	<h3>
																		Product
																	</h3>
																	<span>
																		{
																			product
																				.item
																				.name
																		}
																	</span>
																</Item>
																<Item>
																	<h3>QTY</h3>
																	<span>
																		{
																			product
																				.item
																				.quantity
																		}
																	</span>
																</Item>
																<Item>
																	<h3>
																		Price
																	</h3>
																	<span>
																		{
																			product
																				.item
																				.unitPriceFormatted
																		}
																	</span>
																</Item>
																<Item>
																	<h3>
																		Total
																	</h3>
																	<span>
																		{
																			product
																				.item
																				.netTotalAmountFormatted
																		}
																	</span>
																</Item>
																{product.options.map(
																	(
																		option,
																		i
																	) => (
																		<Item
																			key={
																				i
																			}
																		>
																			<h3>
																				{
																					option.label
																				}
																			</h3>
																			<span>
																				{renderOption(
																					option
																				)}
																			</span>
																		</Item>
																	)
																)}
															</HStack>
														)
													)}
												</VStack>
											</ExpandedRow>
										</td>
									</tr>
								)}
							</React.Fragment>
						);
					})}
				</Tbody>
				<Tfoot>
					{footerGroups.map((group) => (
						<tr {...group.getFooterGroupProps()}>
							{group.headers.map((column) => (
								<td {...column.getFooterProps()}>
									{column.render("Footer")}
								</td>
							))}
						</tr>
					))}
				</Tfoot>
			</Table>
		</div>
	);
};

export default memo(Orders);
