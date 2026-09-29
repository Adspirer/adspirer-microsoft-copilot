# Adspirer for Microsoft Copilot

Microsoft integration workspace for Adspirer's hosted advertising MCP service.

**Status: initial repository setup.** No installable Microsoft package is included yet. The integration has not been tested in a Microsoft tenant, submitted for certification, or published to a Microsoft store.

## Planned packages

| Package | Purpose | Location |
| --- | --- | --- |
| Adspirer Advertising Agent | A Microsoft 365 Copilot declarative agent that uses Adspirer MCP tools | [agent/](agent/README.md) |
| Adspirer MCP connector | A connector for customers building agents in Copilot Studio, prepared for Microsoft's certification process | [connector/](connector/README.md) |

Both packages will connect to `https://mcp.adspirer.com/mcp`. The hosted service continues to handle authentication and advertising API operations.

## Source ownership

- [ads-mcp](https://github.com/amekala/ads-mcp) owns shared advertising instructions, skills, and MCP connection definitions.
- This repository owns Microsoft-specific manifests, packaging, setup documentation, and release artifacts.
- Shared content should be generated from a recorded `ads-mcp` revision. A synchronization script has not been implemented yet.

## Development

Development can use the terminal; VS Code is optional. Start with [the setup checklist](docs/setup.md). Microsoft account setup and an authenticated test tenant are required for end-to-end verification.

No Microsoft tenant, publisher account, or cloud resources are provisioned by this repository.

## Support and policies

- [Adspirer documentation](https://www.adspirer.com/docs)
- [Privacy policy](https://www.adspirer.com/privacy)
- [Terms of service](https://www.adspirer.com/terms)
- Support: [support@adspirer.com](mailto:support@adspirer.com)
- [Security reporting](SECURITY.md)

Licensed under the [MIT License](LICENSE). Microsoft certification and publisher verification are separate from this repository's public availability.
