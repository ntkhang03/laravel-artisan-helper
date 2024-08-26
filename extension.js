const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const customGroupCommands = require('./customGroupCommands.js');

function activate(context) {
	// Đăng ký LaravelCommandProvider
	vscode.window.createTreeView('laravel-support.commands', { treeDataProvider: new LaravelCommandProvider() });

	// Tự động đăng ký các lệnh Artisan từ mảng cấu hình
	customGroupCommands.forEach(group => {
		group.children.forEach(cmd => {
			context.subscriptions.push(vscode.commands.registerCommand(cmd.command, async () => {
				if (cmd.terminalCommand === 'php artisan route:list') {
					// Mở một tab mới với Webview
					const panel = vscode.window.createWebviewPanel(
						'routeList',
						'Route List',
						vscode.ViewColumn.One,
						{
							enableScripts: true
						}
					);

					// Chạy lệnh Artisan và lấy dữ liệu
					exec("cd " + vscode.workspace.rootPath + " && " + cmd.terminalCommand, (error, stdout, stderr) => {
						if (error) {
							console.error(`exec error: ${error}`);
							return;
						}

						// Tạo nội dung HTML cho Webview
						const htmlContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Route List</title>
                <style>
                  table {
                    width: 100%;
                    border-collapse: collapse;
                  }
                  table, th, td {
                    border: 1px solid black;
                  }
                  th, td {
                    padding: 8px;
                    text-align: left;
                  }
                  th {
                    
                  }
                </style>
              </head>
              <body>
                <h1>Route List</h1>
                <button id="refreshButton">Refresh</button>
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>URI</th>
                      <th>Path</th>
                    </tr>
                  </thead>
                  <tbody id="routeTableBody">
                    ${formatRouteList(stdout)}
                  </tbody>
                </table>
                <script>
                  const vscode = acquireVsCodeApi();
                  document.getElementById('refreshButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'refresh' });
                  });
                </script>
              </body>
              </html>
            `;

						// Cài đặt nội dung cho Webview
						panel.webview.html = htmlContent;

						// Lắng nghe các thông điệp từ webview
						panel.webview.onDidReceiveMessage(
							message => {
								if (message.command === 'refresh') {
									// Gửi lệnh để làm mới
									exec(cmd.terminalCommand, (error, stdout) => {
										if (error) {
											console.error(`exec error: ${error}`);
											return;
										}
										panel.webview.postMessage({ command: 'update', data: formatRouteList(stdout) });
									});
								}
							},
							undefined,
							context.subscriptions
						);
					});

				} else {
					const name = cmd.prompt ? await vscode.window.showInputBox({ prompt: cmd.prompt }) : null;
					const terminal = vscode.window.createTerminal('Laravel Artisan');
					terminal.sendText(name ? `${cmd.terminalCommand} ${name}` : cmd.terminalCommand);
					terminal.show();
				}
			}));
		});
	});
}

// Hàm định dạng dữ liệu route list thành các hàng bảng
function formatRouteList(routeList) {
	const lines = routeList.split(/\r?\n/).filter(Boolean);
	const routes = lines.map(line => {
		const parts = line.trim().split(/\s/).filter(Boolean);
		// check if is "Showing"
		if (parts[0] == 'Showing') {
			return null;
		}
		const method = parts[0];
		const uri = parts[1];
		const path = parts.slice((parts[2] || "").startsWith('.') ? 3 : 2).join(' ');

		return { method, uri, path };
	}).filter((route) => route !== null && Object.keys(route).every(key => route[key]));

	let rows = '';
	for (let i = 1; i < routes.length; i++) {
		rows += `
      <tr>
        <td>${routes[i].method}</td>
        <td>${routes[i].uri}</td>
        <td>${routes[i].path}</td>
      </tr>
    `;
	}

	return rows;
}


// LaravelCommandProvider class
class LaravelCommandProvider {
	getTreeItem(element) {
		return element;
	}

	getChildren(element) {
		// check if the current workspace is a Laravel project
		if (!isLaravelProject(vscode.workspace.rootPath)) {
			return [new vscode.TreeItem('This is not a Laravel project')];
		}

		if (!element) {
			return customGroupCommands.map(group => new LaravelCommandDropdown(group));
		} else if (element instanceof LaravelCommandDropdown) {
			return element.children.map(cmd => new LaravelCommandItem(cmd));
		}
	}
}

// LaravelCommandDropdown class
class LaravelCommandDropdown extends vscode.TreeItem {
	constructor(option) {
		super(option.label, vscode.TreeItemCollapsibleState.Collapsed);
		this.iconPath = option.icon ? new vscode.ThemeIcon(option.icon) : undefined;
		this.description = option.description;
		this.contextValue = 'dropdown'; // Để có thể tùy chỉnh nếu cần
		this.children = option.children || [];
	}
}

// LaravelCommandItem class
class LaravelCommandItem extends vscode.TreeItem {
	constructor(option) {
		super(option.label, vscode.TreeItemCollapsibleState.None);  // None: không có các mục con
		this.command = { command: option.command, title: option.label, tooltip: option.label };
		this.description = option.description;
	}
}

function isLaravelProject(rootPath) {
	const artisanPath = path.join(rootPath, 'artisan');
	return fs.existsSync(artisanPath);
}

exports.activate = activate;
