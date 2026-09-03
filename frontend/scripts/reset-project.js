#!/usr/bin/env node
const fs = require("fs"); const path = require("path"); const readline = require("readline");
const root = process.cwd(); const oldDirs = ["app","components","hooks","constants","scripts"]; const exampleDir = "app-example";
const newAppDir = "app"; const exampleDirPath = path.join(root, exampleDir);
const indexContent = `import { Text, View } from "react-native";
export default function Index() { return (<View style={{flex:1,justifyContent:"center",alignItems:"center"}}><Text>Edit app/index.tsx to edit this screen.</Text></View>); }
`;
const layoutContent = `import { Stack } from "expo-router";
export default function RootLayout() { return <Stack />; }
`;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") { await fs.promises.mkdir(exampleDirPath, { recursive: true }); console.log(`/${exampleDir} created.`); }
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") { await fs.promises.rename(oldDirPath, path.join(root, exampleDir, dir)); console.log(`/${dir} moved`); }
        else { await fs.promises.rm(oldDirPath, { recursive: true, force: true }); console.log(`/${dir} deleted`); }
      }
    }
    const newAppDirPath = path.join(root, newAppDir);
    await fs.promises.mkdir(newAppDirPath, { recursive: true });
    await fs.promises.writeFile(path.join(newAppDirPath, "index.tsx"), indexContent);
    await fs.promises.writeFile(path.join(newAppDirPath, "_layout.tsx"), layoutContent);
    console.log("Project reset complete.");
  } catch (error) { console.error(`Error: ${error.message}`); }
};
rl.question("Move existing files to /app-example? (Y/n): ", (answer) => {
  const ui = answer.trim().toLowerCase() || "y";
  if (ui === "y" || ui === "n") moveDirectories(ui).finally(() => rl.close());
  else { console.log("Invalid input."); rl.close(); }
});
