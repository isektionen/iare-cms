import { Button, Picker, Checkbox } from "@buffetjs/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, memo, useMemo, useState, useCallback } from "react";
import { useStrapi } from "../hooks/use-strapi";
import { useHistory, useParams } from "react-router-dom";
import { useTable, useGroupBy, useFilters, useGlobalFilter } from "react-table";
import matchSorter from "match-sorter";
import {
	Badge,
	ExpandedRow,
	Item,
	HStack,
	Dot,
	Flex,
	Tbody,
	Thead,
	Tfoot,
	Table,
	LeftLine,
	VStack,
	ProductDetail,
	OptionDetail,
	Tag,
	Header,
	Heading,
	Spacer,
} from "../../components";

import { BackHeader } from "strapi-helper-plugin";

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

const RenderOption = (option) => {
	switch (option.type) {
		case "switch":
			return (
				<React.Fragment>
					{option.data.map((p, i) => (
						<Flex key={i}>
							<Dot status={p}>
								<p>{p.toString()}</p>
							</Dot>
						</Flex>
					))}
				</React.Fragment>
			);
		case "input":
			return option.data.join(", ");
		case "select":
			return (
				<React.Fragment>
					{option.data.map((p) => (
						<Tag key={p.value}>{p.label}</Tag>
					))}
				</React.Fragment>
			);
	}
};

const Orders = () => {
	const { isAuthorized, getEventOrders, resetCursor, createCSV } =
		useStrapi();
	const router = useHistory();
	const params = useParams();

	const eventSlug = useMemo(() => params.slug, [params]);

	const [orders, setOrders] = useState([]);

	const defaultFilters = {
		status: [
			{ label: "completed", allow: true },
			{ label: "failed", allow: true },
			{ label: "charged", allow: true },
			{ label: "created", allow: true },
			{ label: "refunded", allow: true },
		],
	};

	const [filters, setFilters] = useState(defaultFilters);
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

	const filteredOrders = useMemo(() => {
		const { status } = filters;
		return _.reduce(
			orders,
			(acc, it) => {
				if (
					_.includes(
						_.map(
							status.filter((p) => p.allow),
							"label"
						),
						it.status
					)
				) {
					return [...acc, it];
				}
				return [...acc];
			},
			[]
		);
	}, [orders, filters]);

	const {
		getTableProps,
		getTableBodyProps,
		rows,
		prepareRow,
		headers,
		footerGroups,
	} = useTable({
		columns,
		data: filteredOrders,
	});

	const handleGoBack = useCallback(() => {
		router.goBack();
	}, [router]);

	useEffect(() => {
		if (!isAuthorized(eventSlug)) {
			handleGoBack();
		}
		return () => {
			resetCursor();
		};
	}, [eventSlug]);

	useEffect(() => {
		(async () => {
			const orders = await getEventOrders(eventSlug);
			setOrders(
				orders.map(({ data }) => ({
					__paymentId: data?.paymentData?.paymentId ?? "-",
					reference: data.order.reference,
					fullname:
						data.customerData.firstName +
						" " +
						data.customerData.lastName,
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
							const item = _.omit(
								it,
								"unit",
								"taxRate",
								"taxAmount"
							);
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
												: `${
														item.grossTotalAmount /
														100
												  } ${data.order.currency}`,
										netTotalAmountFormatted:
											item.netTotalAmount === 0
												? "Free"
												: `${
														item.netTotalAmount /
														100
												  } ${data.order.currency}`,
									},
								},
							];
						}, []),
					},
				}))
			);
		})();
	}, [eventSlug]);

	const handleStatusFilter = useCallback(
		(_status) => {
			setFilters((s) => ({
				...s,
				status: s.status.map((p) => {
					if (p.label === _status.label) {
						return {
							label: p.label,
							allow: !p.allow,
						};
					}
					return p;
				}),
			}));
		},
		[setFilters]
	);

	return (
		<React.Fragment>
			<BackHeader onClick={handleGoBack} />
			<Header>
				<Heading>{eventSlug}</Heading>
				<Picker
					renderButtonContent={(isOpen) => (
						<strong>Pick status</strong>
					)}
					renderSectionContent={(onToggle) => {
						return (
							<VStack>
								{filters.status.map((status, i) => (
									<Checkbox
										key={i}
										message={status.label}
										onChange={() =>
											handleStatusFilter(status)
										}
										value={status.allow}
									/>
								))}
							</VStack>
						);
					}}
				/>
				<Button onClick={createCSV}>Download Orders</Button>
			</Header>
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
																		product
																			.item
																			.__reference
																	}
																>
																	<ProductDetail>
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
																			<h3>
																				QTY
																			</h3>
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
																	</ProductDetail>
																	<OptionDetail>
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
																						{RenderOption(
																							option
																						)}
																					</span>
																				</Item>
																			)
																		)}
																	</OptionDetail>
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
		</React.Fragment>
	);
};

export default memo(Orders);
