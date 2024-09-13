const vscode = require("vscode");
const { commands } = vscode;
const outputChannel = vscode.window.createOutputChannel(
  "Laravel Command Suite"
);
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const config = vscode.workspace.getConfiguration("laravelCommandSuite");
const tableTemplateRouteList = require("./utils/tableTemplateRouteList.js");
const {
  artisan: customGroupCommandArtisans,
  composer: customGroupCommandComposers
} = require("./utils/customGroupCommands.json");

vscode.window.onDidCloseTerminal((terminal) => {
  process.emit("terminalClosed", terminal);
});

const commandsRegister = [
  {
    command: "laravel-command-suite.template.execute-custom-command",
    action: async (fn) => {
      if (typeof fn === "function") {
        fn();
      }
    }
  },
  {
    command: "laravel-command-suite.template.exec-command",
    action: async (templateItem) => {
      const input = await vscode.window.showInputBox({
        prompt: "Please enter the project name"
      });

      if (!input) {
        return vscode.window.showErrorMessage("Please enter a valid input");
      }

      const terminal = getOrCreateTerminal("Laravel Command Suite");
      terminal.sendText(
        `composer create-project ${templateItem.label} ${input}`
      );
      terminal.show();

      let terminalCLosed = false;
      process.on("terminalClosed", (terminal) => {
        if (terminal.processId == terminal.processId) {
          terminalCLosed = true;
        }
      });

      const newWorkspacePath = path.join(vscode.workspace.rootPath, input);
      const maxWaitTime = 10 * 60 * 1000; // 5 minutes
      const startTime = Date.now();

      const interval = setInterval(() => {
        if (terminalCLosed || Date.now() - startTime > maxWaitTime) {
          clearInterval(interval);
          return;
        }

        if (fs.existsSync(newWorkspacePath)) {
          clearInterval(interval);
          vscode.workspace.updateWorkspaceFolders(0, 0, {
            uri: vscode.Uri.file(newWorkspacePath)
          });

          vscode.window.showInformationMessage(
            `Project ${input} created successfully, opening project...`
          );
        }
      }, 1000);
    }
  },
  {
    command: "laravel-command-suite--db-migrate-command.runMigrateThisFolder",
    action: runMigrateCommand
  },
  {
    command: "laravel-command-suite--db-migrate-command.runMigrateThisFile",
    action: runMigrateCommand
  },
  {
    command: "laravel-command-suite.template.add-template",
    action: async () => {
      const templateName = await vscode.window.showInputBox({
        prompt: "Enter template name"
      });
      if (templateName) {
        const templates = getConfigInspect("composerCustomPackages", []);
        if (templates.includes(templateName)) {
          return vscode.window.showErrorMessage("Template name already exists");
        }
        templates.push(templateName);
        refreshComposerTemplateDropdown(templates);
      }
    }
  },
  {
    command: "laravel-command-suite.template.edit-template",
    action: async (templateItem) => {
      const newTemplateName = await vscode.window.showInputBox({
        prompt: "Edit template name",
        value: templateItem.label
      });
      if (newTemplateName) {
        const templates = getConfigInspect("composerCustomPackages", []);
        if (templates.includes(newTemplateName)) {
          return vscode.window.showErrorMessage("Template name already exists");
        }
        templates[templateItem.index] = newTemplateName;
        refreshComposerTemplateDropdown(templates);
      }
    }
  },
  {
    command: "laravel-command-suite.template.delete-template",
    action: async (templateItem) => {
      // ask for confirmation
      const answer = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: "Are you sure you want to delete this template?"
      });
      if (answer === "Yes") {
        const templates = getConfigInspect("composerCustomPackages", []);
        templates.splice(templateItem.index, 1);
        refreshComposerTemplateDropdown(templates);
      }
    }
  }
];

function activate(context) {
  // listener when setting is changed in user or workspace
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration("laravelCommandSuite")) {
        return;
      }
      const templates = getConfigInspect("composerCustomPackages", []);
      refreshComposerTemplateDropdown(templates, false);
    })
  );

  const laravelProjectLoaded = isLaravelProject(vscode.workspace.rootPath);
  commands.executeCommand(
    "setContext",
    "laravelProjectLoaded",
    laravelProjectLoaded
  );

  try {
    vscode.window.createTreeView("laravel-command-suite.commands", {
      treeDataProvider: new ArtisanCommandProvider()
    });

    vscode.window.createTreeView("laravel-command-suite.composer-commands", {
      treeDataProvider: new ComposerCommandProvider()
    });

    // Register commands from the configuration arrays
    [...customGroupCommandArtisans, ...customGroupCommandComposers].forEach(
      (group) => {
        group.children.forEach((cmd) => {
          context.subscriptions.push(
            vscode.commands.registerCommand(cmd.command, async () => {
              if (cmd.terminalCommand === "php artisan route:list") {
                registerCommandRouteList(cmd, context);
              } else {
                registerCommandBasic(cmd, context);
              }
            })
          );
        });
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      "An error occurred while activating the Laravel Command Suite extension, please check the output."
    );
    outputChannel.appendLine(typeof error === "string" ? error : error.stack);
  }

  for (const { command, action } of commandsRegister) {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, action)
    );
  }
}

function getOrCreateTerminal(name) {
  const terminals = vscode.window.terminals;
  for (let i = 0; i < terminals.length; i++) {
    if (terminals[i].name === name && terminals[i]._exitStatus === undefined) {
      return terminals[i];
    }
  }

  return vscode.window.createTerminal(name);
}

function runMigrateCommand(resource) {
  const srcPath = resource.fsPath;
  const terminal = getOrCreateTerminal("Laravel Command Suite");
  terminal.sendText(`php artisan migrate --path=${srcPath}`);
  terminal.show();
}

async function refreshComposerTemplateDropdown(templates, updateConfig = true) {
  const workspaceConfig = config.inspect("composerCustomPackages");
  if (updateConfig) {
    await config.update(
      "composerCustomPackages",
      templates,
      workspaceConfig.workspaceValue
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global
    );
  }

  const treeDataProvider = new ComposerCommandProvider();
  vscode.window.createTreeView("laravel-command-suite.composer-commands", {
    treeDataProvider
  });

  // Refresh the composer template dropdown
  treeDataProvider.getChildren();
}

// inspect the configuration and return the value
function getConfigInspect(configKey, defaultValue) {
  const workspaceConfig = config.inspect(configKey);
  const value = workspaceConfig.workspaceValue
    ? workspaceConfig.workspaceValue
    : workspaceConfig.globalValue;

  if (defaultValue && value == undefined) {
    return defaultValue;
  }

  return value;
}

function registerCommandRouteList(cmd, context) {
  const routeListPanels = {}; // Global variable to store panels per project
  const projectName = path.basename(vscode.workspace.rootPath);

  if (routeListPanels[projectName]) {
    const existingPanel = routeListPanels[projectName];
    existingPanel.reveal(vscode.ViewColumn.One);
    executeCommandAndUpdateWebview(existingPanel, cmd, projectName);
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    "routeList",
    "Route List Of: " + projectName,
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  );

  routeListPanels[projectName] = panel;
  executeCommandAndUpdateWebview(panel, cmd, projectName);

  panel.webview.onDidReceiveMessage(
    (message) => {
      if (message.command === "refreshRouteList") {
        executeCommandAndUpdateWebview(panel, cmd, projectName);
      }
      // openInBrowser
      else if (message.command === "openInBrowser") {
        vscode.env.openExternal(vscode.Uri.parse(message.uri));
      }
      // showInfo
      else if (message.command === "showInfo") {
        vscode.window.showInformationMessage(message.message);
      }
      // updateHost
      else if (message.command === "updateHost") {
        const hostNames = getConfigInspect("hostNames", {});
        const host = message.host;
        const rootPath = vscode.workspace.rootPath;

        hostNames[rootPath] = host;
        config.update(
          "hostNames",
          hostNames,
          vscode.ConfigurationTarget.Global
        );
      }
    },
    undefined,
    context.subscriptions
  );

  panel.onDidDispose(
    () => {
      delete routeListPanels[projectName];
    },
    null,
    context.subscriptions
  );
}

async function registerCommandBasic(cmd) {
  const { workspacePath, withoutWorkspace } = await getWorkspaceStatus();
  if (!workspacePath) {
    return vscode.window.showErrorMessage(
      "Please browse to a folder to run this command"
    );
  }

  if (cmd.prompt) {
    const input = cmd.prompt
      ? await vscode.window.showInputBox({
          prompt: cmd.prompt
        })
      : null;
    if (!input) {
      return vscode.window.showErrorMessage("Please enter a valid input");
    }

    const terminal = getOrCreateTerminal("Laravel Command Suite");

    if (withoutWorkspace) {
      terminal.sendText(`cd ${workspacePath}`);
    }
    terminal.sendText(`${cmd.terminalCommand} ${input}`);
    terminal.show();

    // Open workspace if command is "composer create-project"
    if (cmd.terminalCommand === "composer create-project laravel/laravel") {
      const newWorkspacePath = path.join(workspacePath, input);

      let terminalCLosed = false;
      process.on("terminalClosed", (terminal) => {
        if (terminal.processId == terminal.processId) {
          terminalCLosed = true;
        }
      });

      const maxWaitTime = 10 * 60 * 1000; // 5 minutes
      const startTime = Date.now();

      const interval = setInterval(() => {
        if (terminalCLosed || Date.now() - startTime > maxWaitTime) {
          clearInterval(interval);
          return;
        }

        if (fs.existsSync(newWorkspacePath)) {
          clearInterval(interval);
          vscode.workspace.updateWorkspaceFolders(0, 0, {
            uri: vscode.Uri.file(newWorkspacePath)
          });

          vscode.window.showInformationMessage(
            `Project ${input} created successfully, opening project...`
          );
        }
      }, 1000);
    }
  } else {
    const askForConfirmationAll = getConfigInspect("confirmationEnabled", true);

    if (askForConfirmationAll) {
      const askForConfirmation = getConfigInspect(
        "askForConfirmation." + cmd.command.split(".").pop(),
        true
      );

      if (askForConfirmation) {
        const answer = await vscode.window.showQuickPick(["Yes", "No"], {
          placeHolder: "Are you sure you want to run this command?"
        });
        if (answer === "Yes") {
          const terminal = getOrCreateTerminal("Laravel Command Suite");
          if (withoutWorkspace) {
            terminal.sendText(`cd ${workspacePath}`);
          }
          terminal.sendText(`${cmd.terminalCommand}`);
          terminal.show();
        }

        return;
      }
    }

    const terminal = getOrCreateTerminal("Laravel Command Suite");
    if (withoutWorkspace) {
      terminal.sendText(`cd ${workspacePath}`);
    }
    terminal.sendText(`${cmd.terminalCommand}`);
    terminal.show();
  }
}

function executeCommandAndUpdateWebview(panel, cmd, projectName) {
  // set icon for webview
  panel.iconPath = vscode.Uri.file(path.join(__dirname, "assets", "icon.png"));

  panel.webview.html = `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Route List</title>
				<style>
					.loading {
						display: flex;
						justify-content: center;
						align-items: center;
						height: 100vh;
						font-size: 24px;
					}
					.loader {
						width: 45px;
						aspect-ratio: .75;
						--c: no-repeat linear-gradient(#fff 0 0);
						background: 
							var(--c) 0%   50%,
							var(--c) 50%  50%,
							var(--c) 100% 50%;
						animation: l7 1s infinite linear alternate;
					}
					@keyframes l7 {
						0%  {background-size: 20% 50% ,20% 50% ,20% 50% }
						20% {background-size: 20% 20% ,20% 50% ,20% 50% }
						40% {background-size: 20% 100%,20% 20% ,20% 50% }
						60% {background-size: 20% 50% ,20% 100%,20% 20% }
						80% {background-size: 20% 50% ,20% 50% ,20% 100%}
						100%{background-size: 20% 50% ,20% 50% ,20% 50% }
					}
				</style>
			</head>
			<body>
				<div class="loading">
					<div class="loader"></div>
				</div>
			</body>
		</html>
	`;

  exec(
    `php ${JSON.stringify(
      vscode.workspace.rootPath + path.sep + "artisan"
    )} route:list`,
    (error, stdout) => {
      if (error) {
        vscode.window.showErrorMessage(
          "An error occurred while running the command, please check the output."
        );
        outputChannel.appendLine(`exec error: ${error}`);
        outputChannel.appendLine(JSON.stringify(error));
        return;
      }
      const hostName = getConfigInspect("hostNames", {})[
        vscode.workspace.rootPath
      ];
      const htmlContent = tableTemplateRouteList(projectName, stdout, hostName);
      panel.webview.html = htmlContent;
    }
  );
}

class ArtisanCommandProvider {
  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (!isLaravelProject(vscode.workspace.rootPath)) {
      return [];
    }

    if (!element) {
      return customGroupCommandArtisans.map(
        (group) => new CommandDropdown(group)
      );
    } else if (element instanceof CommandDropdown) {
      return element.children.map((cmd) => {
        return new LaravelCommandItem(cmd);
      });
    }
  }
}

class ComposerCommandProvider {
  getTreeItem(element) {
    return element;
  }

  async getChildren(element) {
    if (!element) {
      return customGroupCommandComposers.map((group) => {
        return new CommandDropdown(group);
      });
    } else if (element instanceof CommandDropdown) {
      return element.children.map((cmd) => {
        if (cmd.terminalCommand === "<CREATE_PROJECT_WITH_CUSTOM_PACKAGE>") {
          const templates = getConfigInspect("composerCustomPackages", []);
          return new ComposerTemplateDropdown({
            ...cmd,
            templates
          });
        }

        return new LaravelCommandItem(cmd);
      });
    } else if (element instanceof ComposerTemplateDropdown) {
      return element.getChildren();
    }
  }
}

// CommandDropdown class
class CommandDropdown extends vscode.TreeItem {
  constructor(option) {
    super(option.label, vscode.TreeItemCollapsibleState.Collapsed);
    this.iconPath = option.icon ? new vscode.ThemeIcon(option.icon) : undefined;
    this.description = option.description;
    this.contextValue = "dropdown"; // Để có thể tùy chỉnh nếu cần
    this.children = option.children || [];
  }
}

// LaravelCommandItem class
class LaravelCommandItem extends vscode.TreeItem {
  constructor(option) {
    super(option.label, vscode.TreeItemCollapsibleState.None); // None: không có các mục con
    this.command = {
      command: option.command,
      title: option.label,
      tooltip: option.terminalCommand + (option.prompt ? " <input>" : "")
    };
    this.label = option.label + (option.prompt ? " <input>" : "");
    this.description = option.description;
    this.tooltip = option.terminalCommand + (option.prompt ? " <input>" : "");
  }
}

// New class to handle Composer template group
class ComposerTemplateDropdown extends vscode.TreeItem {
  constructor(options) {
    super(options.label, vscode.TreeItemCollapsibleState.Collapsed);
    this.templates = options.templates;
    this.contextValue = "composerTemplateDropdown";
  }

  getChildren() {
    return this.templates.map(
      (template, index) => new TemplateItem(template, index, this)
    );
  }
}

// Template item with edit and delete options
class TemplateItem extends vscode.TreeItem {
  constructor(label, index, parent) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.label = label;
    this.index = index;
    this.parent = parent;
    this.contextValue = "templateItem";
    this.tooltip = "composer create-project " + label + " <project-name>";
    this.command = {
      command: "laravel-command-suite.template.execute-custom-command",
      title: "Create project with " + label,
      arguments: [
        async function () {
          const input = await vscode.window.showInputBox({
            prompt: "Please enter the project name"
          });

          if (!input) {
            return vscode.window.showErrorMessage("Please enter a valid input");
          }

          const terminal = getOrCreateTerminal("Laravel Command Suite");
          terminal.sendText(`composer create-project ${label} ${input}`);
          terminal.show();

          let terminalCLosed = false;
          process.on("terminalClosed", (terminal) => {
            if (terminal.processId == terminal.processId) {
              terminalCLosed = true;
            }
          });

          const newWorkspacePath = path.join(vscode.workspace.rootPath, input);
          const maxWaitTime = 10 * 60 * 1000; // 5 minutes
          const startTime = Date.now();

          const interval = setInterval(() => {
            if (terminalCLosed || Date.now() - startTime > maxWaitTime) {
              clearInterval(interval);
              return;
            }

            if (fs.existsSync(newWorkspacePath)) {
              clearInterval(interval);
              vscode.workspace.updateWorkspaceFolders(0, 0, {
                uri: vscode.Uri.file(newWorkspacePath)
              });

              vscode.window.showInformationMessage(
                `Project ${input} created successfully, opening project...`
              );
            }
          }, 1000);
        }
      ],
      tooltip: "composer create-project " + label + " <project-name>"
    };
  }
}

function isLaravelProject(rootPath = "") {
  const artisanPath = path.join(rootPath, "artisan");
  return fs.existsSync(artisanPath);
}

async function getWorkspaceStatus() {
  let workspacePath = vscode.workspace.rootPath;

  if (!workspacePath) {
    vscode.window.showInformationMessage(
      "Please browse to a folder to run this command"
    );

    const uri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false
    });

    if (!uri) {
      return {
        workspacePath: "",
        withoutWorkspace: true
      };
    }

    workspacePath = uri[0].fsPath || uri[0].path;
    outputChannel.appendLine("workspacePath: " + workspacePath);

    return {
      workspacePath,
      withoutWorkspace: true
    };
  }

  return {
    workspacePath,
    withoutWorkspace: false
  };
}

exports.activate = activate;
