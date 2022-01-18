import { Button, Select, Picker, Text, Padded } from "@buffetjs/core";
import { Header } from "@buffetjs/custom";
import { GlobalPagination } from "strapi-helper-plugin";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useQueryParams } from "strapi-helper-plugin";
import pluginPkg from "../../../../package.json";
import Search from "../../components/Search";
import Table from "../../components/Table";
import pluginId from "../../pluginId";
import { useManager } from "../hooks/use-manager";
import styled from "styled-components";
import { useStrapi } from "../hooks/use-strapi";

import { useTable } from "react-table";
const HomePage = () => {
	const router = useHistory();
	const { authenticate, events } = useStrapi();

	const columns = useMemo(
		() => [
			{
				Header: "Committee",
				accessor: "committee",
			},
			{
				Header: "Title",
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
		],
		[]
	);
	const { getTableProps, getTableBodyProps, rows, prepareRow, headers } =
		useTable({
			columns,
			data: events.map((e) => ({
				committee: e.committee.name,
				eventTitle: e.title,
				eventPublic: e.public ? "Public" : "Private",
				publishState: e.published_at ? "Published" : "Draft",
				__slug: e.slug,
			})),
		});

	const handleRowClick = useCallback((slug) => {
		router.push(`/plugins/${pluginId}/${slug}/orders`);
	}, []);

	useEffect(() => {
		authenticate();
	}, []);
	return (
		<div>
			<table {...getTableProps()}>
				<thead>
					<tr>
						{headers.map((column) => (
							<th {...column.getHeaderProps()}>
								{column.render("Header")}
							</th>
						))}
					</tr>
				</thead>
				<tbody {...getTableBodyProps()}>
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
											{cell.render("Cell")}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default memo(HomePage);
