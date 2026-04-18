(function () {
  var registrationKey = "__notiflyWebMcpRegistrations";

  window.__notiflyWebMcpLoaded = true;

  if (window[registrationKey]) {
    return;
  }

  var origin = window.location.origin;
  var urls = {
    apiCatalog: origin + "/.well-known/api-catalog",
    apiCatalogJson: origin + "/.well-known/api-catalog.json",
    apiCatalogAsset: origin + "/assets/api-catalog.json",
    mcpServerCard: origin + "/.well-known/mcp/server-card.json",
    mcpServerCardAsset: origin + "/assets/mcp-server-card.json",
    openapi: origin + "/ko/api-reference/openapi.yaml",
    apiReference: origin + "/ko/api-reference/getting-started",
    docsHome: origin + "/ko",
    mcpDocs: origin + "/ko/devtools/notifly-mcp-server",
    skillsDocs: origin + "/ko/devtools/notifly-agent-skills"
  };

  var installTargets = {
    generic: {
      label: "Generic stdio MCP client",
      command: "npx -y notifly-mcp-server@latest"
    },
    "claude-code": {
      label: "Claude Code CLI",
      command:
        "claude mcp add --transport stdio notifly-mcp-server -- npx -y notifly-mcp-server@latest"
    },
    codex: {
      label: "Codex CLI",
      configPath: "~/.codex/config.toml",
      snippet:
        '[mcp_servers]\n  [mcp_servers.notifly]\n  command = "npx"\n  args = ["-y", "notifly-mcp-server@latest"]'
    },
    cursor: {
      label: "Cursor",
      docsUrl: urls.mcpDocs
    },
    vscode: {
      label: "VS Code",
      docsUrl: urls.mcpDocs
    },
    "gemini-cli": {
      label: "Gemini CLI",
      command:
        "gemini mcp add --scope project notifly-mcp-server npx -y notifly-mcp-server@latest"
    }
  };

  function toTextResult(payload) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(payload, null, 2)
        }
      ]
    };
  }

  async function fetchText(url) {
    var response = await fetch(url, {
      headers: {
        Accept: "text/yaml, text/plain, application/yaml, application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Request failed (" + response.status + ") for " + url);
    }

    return response.text();
  }

  function registerTools() {
    if (
      !navigator.modelContext ||
      typeof navigator.modelContext.registerTool !== "function"
    ) {
      return false;
    }

    var tools = [
      {
        name: "get_notifly_api_spec",
        description:
          "Get the canonical Notifly OpenAPI specification URL and optionally include the raw YAML document.",
        inputSchema: {
          type: "object",
          properties: {
            includeSpec: {
              type: "boolean",
              description:
                "When true, include the raw OpenAPI YAML document in the response."
            }
          },
          additionalProperties: false
        },
        execute: async function (input) {
          var includeSpec = Boolean(input && input.includeSpec);
          var payload = {
            openapiUrl: urls.openapi,
            apiReferenceUrl: urls.apiReference
          };

          if (includeSpec) {
            payload.openapiYaml = await fetchText(urls.openapi);
          }

          return toTextResult(payload);
        }
      },
      {
        name: "get_notifly_ai_discovery",
        description:
          "Get the Notifly docs site's machine-readable discovery endpoints for API and MCP clients.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false
        },
        execute: async function () {
          return toTextResult({
            docsHomeUrl: urls.docsHome,
            apiCatalogUrl: urls.apiCatalog,
            apiCatalogJsonUrl: urls.apiCatalogJson,
            apiCatalogAssetUrl: urls.apiCatalogAsset,
            mcpServerCardUrl: urls.mcpServerCard,
            mcpServerCardAssetUrl: urls.mcpServerCardAsset,
            openapiUrl: urls.openapi,
            apiReferenceUrl: urls.apiReference
          });
        }
      },
      {
        name: "get_notifly_mcp_install",
        description:
          "Get installation commands and documentation links for the Notifly MCP server.",
        inputSchema: {
          type: "object",
          properties: {
            client: {
              type: "string",
              description:
                "Optional client identifier. Supported values: generic, claude-code, codex, cursor, vscode, gemini-cli."
            }
          },
          additionalProperties: false
        },
        execute: async function (input) {
          var client = input && input.client ? String(input.client) : "generic";
          var target = installTargets[client] || installTargets.generic;

          return toTextResult({
            client: client,
            install: target,
            packageName: "notifly-mcp-server",
            docsUrl: urls.mcpDocs,
            skillsDocsUrl: urls.skillsDocs
          });
        }
      }
    ];

    window[registrationKey] = [];

    tools.forEach(function (tool) {
      try {
        var registration = navigator.modelContext.registerTool(tool);
        if (registration && typeof registration.unregister === "function") {
          window[registrationKey].push(registration);
        }
      } catch (error) {
        console.error("[Notifly WebMCP] Failed to register " + tool.name, error);
      }
    });

    window.__notiflyWebMcpRegistered = true;
    return true;
  }

  if (registerTools()) {
    return;
  }

  var attempts = 0;
  var maxAttempts = 20;
  var intervalId = window.setInterval(function () {
    attempts += 1;

    if (registerTools() || attempts >= maxAttempts) {
      window.clearInterval(intervalId);
    }
  }, 500);
})();
