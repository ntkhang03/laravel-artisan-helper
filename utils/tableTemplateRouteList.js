module.exports = (projectName, routeListContent, hostName) => {
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
					text-align: center;
				}
				.text-no-wrap {
					white-space: nowrap;
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
			style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; cursor: pointer; margin-bottom: .4rem; border-radius: 4px;"
			>
			Refresh Route List
			</button>
			<br>
			<label for="host">&nbsp;Input your host (this helps to copy the route link or open in browser)</label>
			<br>
			<input type="text" id="host" placeholder="Host" style="padding: 8px 16px; border: 1px solid var(--vscode-input-border, black); border-radius: 4px; margin-bottom: 16px; margin-top: .3rem; background-color: var(--vscode-input-background, white); color: var(--vscode-input-foreground, black);" value="${
        hostName || "http://localhost:8000"
      }">
			<table>
				<thead>
					<tr>
						<th>#</th>
						<th>Method</th>
						<th>URI</th>
						<th>Path</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody id="routeTableBody">
					${formatRouteList(routeListContent)}
				</tbody>
			</table>
			<script>
				const vscode = acquireVsCodeApi();
				document.getElementById("refreshButton").addEventListener("click", () => {
					vscode.postMessage({ command: "refreshRouteList" });
				});

				const events = ["input", "change", "paste"];
				for (const event of events) {
					document.getElementById("host").addEventListener(event, handleHostChange);
				}

				function handleHostChange() {
					vscode.postMessage({ command: "updateHost", host: getHost() });
				}

				function getHost() {
					return document.getElementById("host").value;
				}

				function copyToClipboard(text, messageNotification) {
					navigator.clipboard.writeText(text).then(() => {
						vscode.postMessage({ command: "showInfo", message: messageNotification || "[Larvel Command Suite] Copied to your clipboard" });
					});
				}

				function openInBrowser(uri) {
					const host = document.getElementById("host").value;
					vscode.postMessage({ command: "openInBrowser", uri: generateUrl(host, uri) });
				}

				function generateUrl(host, uri) {
					return host + (host.endsWith("/") ? "" : "/") + (uri.startsWith("/") ? uri.slice(1) : (uri == "/" ? "" : uri));
				}

				function getResourseFromAssets(name) {
					return vscode.getState().assets[name];
				}
			</script>
		</body>
	</html>
	`;
};

function formatRouteList(routeList) {
  const lines = routeList.split(/\r?\n/).filter(Boolean);
  const routes = lines
    .map((line) => {
      const parts = line.trim().split(/\s/).filter(Boolean);
      if (parts[0] == "Showing") {
        return null;
      }
      const method = parts[0];
      const uri = parts[1];
      const path = parts
        .slice((parts[2] || "").startsWith(".") ? 3 : 2)
        .join(" ");

      return { method, uri, path };
    })
    .filter(
      (route) => route !== null && Object.keys(route).every((key) => route[key])
    );

  let rows = "";
  for (let i = 0; i < routes.length; i++) {
    rows += `
      <tr>
				<td>${i + 1}</td>
        <td class="text-no-wrap">${routes[i].method
          .split("|")
          .map(
            (m) => `<span class="method method-${m.toLowerCase()}">${m}</span>`
          )
          .join(" ")}</td>
        <td>${routes[i].uri}</td>
        <td>${routes[i].path}</td>
				<td style="text-align: center;">
					<button onclick="copyToClipboard(generateUrl(getHost(), '${
            routes[i].uri
          }'), '[Larvel Command Suite] Route link copied to clipboard')"
					style="padding-top: 5px; background-color: #ffffff; color: black; border: none; cursor: pointer; border-radius: 4px;" title="Copy route link to clipboard">
						<svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M17.5 14H19C20.1046 14 21 13.1046 21 12V5C21 3.89543 20.1046 3 19 3H12C10.8954 3 10 3.89543 10 5V6.5M5 10H12C13.1046 10 14 10.8954 14 12V19C14 20.1046 13.1046 21 12 21H5C3.89543 21 3 20.1046 3 19V12C3 10.8954 3.89543 10 5 10Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					${
            routes[i].method.includes("GET")
              ? `<button onclick="openInBrowser('${routes[i].uri}')" style="padding-top: 5px; background-color: #2196F3; color: white; border: none; cursor: pointer; border-radius: 4px;" title="Open route in browser">
									<svg width="1rem" height="1rem" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000" stroke="#000000">
										<g id="SVGRepo_bgCarrier" stroke-width="0"/>
										<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
										<g id="SVGRepo_iconCarrier"> <title>icon/20/icon-open-in-new</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Output-svg" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="out" transform="translate(-838.000000, -29.000000)" fill="#000000"> <path d="M855,46 L841,46 L841,32 L848,32 L848,30 L841,30 C839.89,30 839,30.9 839,32 L839,46 C839,47.1 839.89,48 841,48 L855,48 C856.1,48 857,47.1 857,46 L857,39 L855,39 L855,46 L855,46 Z M850,30 L850,32 L853.59,32 L843.76,41.83 L845.17,43.24 L855,33.41 L855,37 L857,37 L857,30 L850,30 L850,30 Z" id="path"> </path> </g> </g> </g>
										</svg>
							</button>`
              : ""
          }
				</td>
      </tr>
    `;
  }

  return rows;
}
