const fs = require("fs");
const path = require("path");
const customGroupCommands = require("./customGroupCommands.json");
const configurations = {};

for (const key in customGroupCommands) {
  const group = customGroupCommands[key];
  for (const { label, children } of group) {
    for (const child of children) {
      configurations["laravelCommandSuite.askForConfirmation." + child.command.split(".").pop()] = {
        type: "boolean",
        default: true,
        markdownDescription: `Enable confirmation for \`${
          key[0].toUpperCase() + key.slice(1)
        } > ${label} > ${child.label}\` command`
      };
    }
  }
}

const packageJson = require("../package.json");
packageJson.contributes.configuration.properties = {
  ...packageJson.contributes.configuration.properties,
  ...configurations
};

fs.writeFileSync(
  path.resolve(__dirname, "../package.json"),
  JSON.stringify(packageJson, null, 2)
);

console.log("Configuration properties generated successfully");
