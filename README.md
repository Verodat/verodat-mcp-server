# Verodat MCP Layer Architecture Diagram

![image](https://github.com/user-attachments/assets/3778fae4-2e84-470c-b5a9-a79a6f3dc1ce)



# Model Context Protocol and Verodat

This document guides on how to use Verodat (https://verodat.io) in a Model Context Protocol server (used for plugging code and data into A.I. systems such as Claude Desktop).

Current Verodat MCP server provides below tools:

* Account and Workspace Management:
  * get-accounts - Lists available accounts you can access
  * get-workspaces - Lists all workspaces within a specified account
* Dataset Operations:
  * create-dataset - Creates a new dataset with defined schema and validation rules
  * get-datasets - Retrieves datasets from a workspace with filtering capabilities
  * get-dataset-output - Retrieves actual data records from a dataset
* AI and Context:
  * get-ai-context - Retrieves workspace context including dataset configurations
  * execute-ai-query - Executes AI-powered queries on dataset data


# Installation


## **1. Install Node.js**  

### **Mac (Using Homebrew or Manual Download)**  
#### **Method 1: Using Homebrew (Recommended)**  
1. Open **Terminal** (`Cmd + Space` → Search "Terminal").  
2. Run the following command to install Node.js:  
   ```sh
   brew install node
   ```
3. Wait for the installation to complete.  

#### **Method 2: Manual Download**  
1. Visit [Node.js official website](https://nodejs.org/).  
2. Download the **macOS Installer** (`.pkg` file).  
3. Open the downloaded file and follow the installation prompts.  
4. Restart your Terminal for changes to take effect.  

#### **Verification (Mac)**  
1. Open **Terminal**.  
2. Run:  
   ```sh
   node -v
   ```
   It should display the installed version, e.g., `v18.17.1`.  
3. Also, verify npm (Node Package Manager) with:  
   ```sh
   npm -v
   ```
   It should display an npm version, e.g., `9.6.7`.  

---

### **Windows (Using Installer or Winget)**  
#### **Method 1: Using Windows Installer (Recommended)**  
1. Visit [Node.js official website](https://nodejs.org/).  
2. Download the **Windows Installer** (`.msi` file).  
3. Run the installer and follow the setup wizard.  
4. Restart your computer after installation.  

#### **Method 2: Using Winget (Windows Package Manager)**  
1. Open **Command Prompt** (`Win + R` → Type `cmd` → Press Enter).  
2. Run:  
   ```sh
   winget install OpenJS.NodeJS
   ```
3. Wait for the installation to complete.  

#### **Verification (Windows)**  
1. Open **Command Prompt (cmd)** or **PowerShell**.  
2. Run:  
   ```sh
   node -v
   ```
   It should return the installed version.  
3. Also, check npm:  
   ```sh
   npm -v
   ```

---

## **2. Install Git**  

### **Mac (Using Homebrew or Manual Download)**  
#### **Method 1: Using Homebrew (Recommended)**  
1. Open **Terminal**.  
2. Run:  
   ```sh
   brew install git
   ```
3. Wait for the installation to complete.  

#### **Method 2: Manual Download**  
1. Download the **Mac Git Installer** from [Git official site](https://git-scm.com/downloads).  
2. Open the downloaded `.dmg` file and follow the installation steps.  
3. Restart **Terminal** after installation.  

#### **Verification (Mac)**  
1. Open **Terminal** and run:  
   ```sh
   git --version
   ```
2. If installed correctly, it will display something like `git version 2.40.1`.  

---

### **Windows (Using Installer or Winget)**  
#### **Method 1: Using Windows Installer (Recommended)**  
1. Download the **Git for Windows** installer from [Git official site](https://git-scm.com/downloads).  
2. Run the installer and select **Git Bash** during installation.  
3. Complete the setup and restart your computer if required.  

#### **Method 2: Using Winget**  
1. Open **Command Prompt (cmd)** and run:  
   ```sh
   winget install Git.Git
   ```
2. Wait for the installation to complete.  

#### **Verification (Windows)**  
1. Open **Command Prompt** or **Git Bash**.  
2. Run:  
   ```sh
   git --version
   ```
3. It should return the installed Git version.  

---

## **3. Install Claude Desktop**  

### **Mac (Using `.dmg` File)**  
1. Visit [Claude's official website](https://claude.ai/download) (or Anthropic's site).  
2. Download the **Claude Desktop macOS `.dmg` installer**.  
3. Open the `.dmg` file and drag the **Claude.app** into the **Applications** folder.  
4. Open **Claude.app** from Applications and sign in.  

#### **Verification (Mac)**  
1. Press **Cmd + Space** and search for **Claude**.  
2. Open the app and check if it runs correctly.  

---

### **Windows (Using `.exe` File)**  
1. Visit [Claude's official website](https://claude.ai/download).  
2. Download the **Windows `.exe` installer**.  
3. Run the installer and follow the on-screen instructions.  
4. Open the **Claude** app after installation.  

#### **Verification (Windows)**  
1. Press **Win + S** and search for **Claude**.  
2. Open the app and check if it runs correctly.  

---

## **Final Checks & Summary**  
✅ **Node.js Installed:** `node -v` → Displays version.  
✅ **Git Installed:** `git --version` → Displays version.  
✅ **Claude Desktop Installed:** Search & open the app.  

## **4. Download Verodat MCP Server on your Local Machine from below command**
```json
git clone https://github.com/Verodat/verodat-mcp-server.git
```
Navigate to the `path/to/verodat-mcp-server` directory on your local machine and run the following commands in your terminal or command prompt to install the dependencies & build the project.

```json
npm install
npm run build
```

## **5. Configure Verodat MCP-Server in Claude Desktop**
To use with Claude Desktop, add the server config:

On MacOS: ~/Library/Application Support/Claude/claude_desktop_config.json On Windows: %APPDATA%/Claude/claude_desktop_config.json

```json
{
    "mcpServers": {
        "verodat": {
            "command": "node",
            "args": [
                **"path/to/verodat-mcp-server/build/src/index.js"**
            ],
            "env": {
                **"VERODAT_AI_API_KEY": "<<your-verodat-ai-api-key>>"**
            }
        }
    }
}
```
## Sign-up to Verodat.

You can sign up for a Verodat account here (https://verodat.com)

## Get an AI API key

Login into your Verodat account. Generate your AI API Key and replace the same in  
```json
**"VERODAT_AI_API_KEY": "<<your-verodat-ai-api-key>>"**
```
config file of your Claude Desktop.

## Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the MCP Inspector, which is available as a package script:

```json
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
