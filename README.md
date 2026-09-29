# Adspirer for Microsoft Copilot

A Microsoft 365 Copilot declarative agent for Adspirer's hosted advertising MCP service. Review performance, investigate wasted spend, research campaigns, and prepare approved changes across connected Google, Meta, Amazon, TikTok, LinkedIn, and ChatGPT advertising accounts.

**Status: initial implementation, pending Microsoft tenant verification.** Local builds produce a review-only preview ZIP. A configured package requires Microsoft app and OAuth configuration IDs. OAuth, tool execution, installation, certification, and store availability have not been verified.

## Build from the terminal

Requires Node.js 22+ and npm. VS Code is optional.

```sh
npm ci
npm run check
```

The preview is written to `dist/preview/adspirer-copilot-preview.zip`. It uses synthetic registration IDs, is labeled **Adspirer Preview**, and must not be uploaded as an installable app. `build-report.json` records its checksum and verification limits.

`npm run package` refuses to build without real registration references. See [setup](docs/setup.md) for configuring a tenant build. `npm run check:metadata` separately checks public OAuth discovery endpoints without signing in, registering clients, or calling advertising tools.

## Included

- Microsoft app manifest, declarative agent, and remote MCP plugin.
- Dynamic tool discovery and OAuth through Microsoft's token store.
- Generated advertising instructions covering accounts, routers, decimal budget units, live reports, approval before mutations, paused creation, and readback.
- Adspirer icons derived from the existing Cursor brand asset.
- Pinned dependencies, deterministic ZIP packaging, local schema checks, regression tests, and GitHub Actions.
- A [tenant evaluation checklist](docs/evaluation.md).

The agent uses the context and tools available in Copilot. It does not assume Cursor's filesystem, Hermes cron, persistent local memory, or unconfigured Microsoft mail/document capabilities. Prompt instructions guide behavior; they do not replace backend authorization or host confirmations.

## Source ownership

Shared advertising guidance remains owned by [ads-mcp](https://github.com/amekala/ads-mcp). Selected sources are vendored at recorded revisions in [sources/lock.json](sources/lock.json). `npm run generate` combines selected sections with a Microsoft-specific adaptation, checking source hashes and Microsoft's instruction length limit.

The [Cursor plugin](https://github.com/Adspirer/adspirer-cursor-plugin) supplied branding and the distribution pattern. The [Hermes plugin](https://github.com/Adspirer/adspirer-hermes-plugin) informed the approval and verification workflow. See [design and provenance](docs/design.md).

| Location | Purpose |
| --- | --- |
| [agent/](agent/README.md) | Implemented declarative-agent package and registration configuration |
| [connector/](connector/README.md) | Separate Copilot Studio connector track; not implemented yet |
| `scripts/` | Generation, validation, packaging, and public metadata checks |
| `sources/` | Pinned shared instructions and provenance |

## Support

[Documentation](https://www.adspirer.com/docs) · [Privacy](https://www.adspirer.com/privacy) · [Terms](https://www.adspirer.com/terms) · [support@adspirer.com](mailto:support@adspirer.com) · [Security](SECURITY.md)

Licensed under the [MIT License](LICENSE). No Microsoft certification or endorsement is claimed.
