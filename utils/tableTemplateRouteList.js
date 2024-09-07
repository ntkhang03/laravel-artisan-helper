module.exports = (projectName, content) => {
  return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Route List</title>
			<style>
				table {
					width: 100%;
					border-collapse: collapse;
				}
				table,
				th,
				td {
					border: 1px solid var(--vscode-editor-foreground, black);
				}
				th,
				td {
					padding: 8px;
					text-align: left;
				}
				th {
				}
				.method {
					padding-left: 6px;
					padding-right: 6px;
					padding-bottom: 2px;
					border-radius: 4px;
				}
				.method+.method {
					margin-left: 4px;
				}
				.method-get {
					background-color: #4CAF50;
					color: white;
				}
				.method-post {
					background-color: #2196F3;
					color: white;
				}
				.method-put {
					background-color: #ff9800;
					color: white;
				}
				.method-patch {
					background-color: #ffeb3b;
					color: black;
				}
				.method-delete {
					background-color: #f44336;
					color: white;
				}
				.method-head {
					background-color: #9c27b0;
					color: white;
				}
			</style>
		</head>
		<body>
			<h1>Route List Of: ${projectName}</h1>
			<button id="refreshButton"
			style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; cursor: pointer; margin-bottom: 16px; border-radius: 4px;"
			>Refresh</button>
			<table>
				<thead>
					<tr>
						<th>#</th>
						<th>Method</th>
						<th>URI</th>
						<th>Path</th>
					</tr>
				</thead>
				<tbody id="routeTableBody">
					${content}
				</tbody>
			</table>
			<script>
				const vscode = acquireVsCodeApi();
				document.getElementById("refreshButton").addEventListener("click", () => {
					vscode.postMessage({ command: "refreshRouteList" });
				});
			</script>
		</body>
	</html>
	`;
};
