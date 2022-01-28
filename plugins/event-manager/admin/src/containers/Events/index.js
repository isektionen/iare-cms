import { Button } from "@buffetjs/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import pluginId from "../../pluginId";
import { useStrapi } from "../hooks/use-strapi";

import { useTable } from "react-table";
import { Table, Tbody, Thead, Badge, Header } from "../../components/index";
import { format } from "date-fns";

const RenderCell = (cell) => {
	switch (cell.column.id) {
		case "publishState":
			return (
				<Badge
					status={
						cell.value === "Published" ? "completed" : "created"
					}
				>
					{cell.render("Cell")}
				</Badge>
			);
		case "created":
			return <span>{format(new Date(cell.value), "dd MMMM yyyy")}</span>;
		default:
			return <span>{cell.render("Cell")}</span>;
	}
};

const HomePage = () => {
	const router = useHistory();
	const { authenticate, events, createCSV, isAdmin } = useStrapi();

	const columns = useMemo(
		() => [
			{
				Header: "Committee",
				accessor: "committee",
			},
			{
				Header: "Event",
				accessor: "eventTitle",
			},
			{
				Header: "Public",
				accessor: "eventPublic",
			},
			{
				Header: "State",
				accessor: "publishState",
			},
			{
				Header: "Created",
				accessor: "created",
			},
		],
		[]
	);
	const { getTableProps, getTableBodyProps, rows, prepareRow, headers } =
		useTable({
			columns,
			data: events.map((e) => ({
				committee: e?.committee?.name ?? "N/A",
				eventTitle: e.title,
				eventPublic: e.public ? "Public" : "Private",
				publishState: e.published_at ? "Published" : "Draft",
				created: e?.created_at ?? "-",
				__slug: e.slug,
			})),
		});

	const handleRowClick = useCallback((slug) => {
		router.push(`/plugins/${pluginId}/${slug}/orders`);
	}, []);

	const handleCreateEvent = useCallback(() => {
		router.push(
			"/plugins/content-manager/collectionType/application::event.event/create"
		);
	});

	useEffect(() => {
		authenticate();
	}, []);
	return (
		<div>
			<Header>
				<Button
					onClick={handleCreateEvent}
					icon={<FontAwesomeIcon icon={faPlus} />}
				>
					Create new Event
				</Button>
				{isAdmin && <Button onClick={createCSV}>Download all</Button>}
			</Header>
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
						return (
							<tr
								onClick={() =>
									handleRowClick(row.original.__slug)
								}
								{...row.getRowProps()}
							>
								{row.cells.map((cell) => {
									return (
										<td {...cell.getCellProps()}>
											<RenderCell {...cell} />
										</td>
									);
								})}
							</tr>
						);
					})}
				</Tbody>
			</Table>
		</div>
	);
};

export default memo(HomePage);
