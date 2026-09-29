# Microsoft integration setup

Initial planning baseline: September 28, 2026. Check linked Microsoft requirements again before provisioning or submitting.

## Existing foundation

The [ads-mcp repository](https://github.com/amekala/ads-mcp) declares the hosted HTTPS endpoint, Streamable HTTP transport, OAuth with PKCE, dynamic client registration, and tool safety annotations. These declarations are a starting point; Microsoft compatibility has not been demonstrated by this repository.

## Development prerequisites

- A Microsoft 365 test tenant with an administrator able to enable custom app uploads and the intended Copilot experience.
- Licensing or usage billing appropriate to the selected capabilities. A free developer sandbox is eligibility-dependent; do not assume enrollment guarantees one.
- Node.js/npm compatible with the selected Agents Toolkit CLI release.
- A test Adspirer account with suitable advertising account access and controlled test data.

Microsoft documents a terminal workflow through the Agents Toolkit CLI. VS Code is optional.

```sh
npm install -g @microsoft/m365agentstoolkit-cli
atk --help
atk doctor
atk list templates
```

These are setup instructions, not commands already executed for this repository. Pin the selected CLI version when implementing reproducible build tooling.

Generate the project under `agent/` after reviewing the current `atk new --help` options. The later lifecycle uses `atk validate`, `atk package`, and provisioning commands against the generated project configuration. Those commands cannot yet build this documentation-only repository.

Browser interaction is still expected for sign-in/consent, account verification, tenant settings, submission, and validating the real Copilot experience.

## Public distribution prerequisites

- Partner Center business verification and Microsoft 365 and Copilot program enrollment.
- Proof of service/endpoint control and appropriate domain ownership.
- Complete package metadata, privacy/terms/support links, icons, and accurate tool descriptions.
- Reviewer setup instructions, test credentials supplied privately, and expected outcomes for each submitted capability.
- Tested OAuth, account isolation, least-privilege access, and authorization for tool actions.

Public GitHub availability, tenant installation, connector certification, and Agent Store publication are separate milestones. Record evidence for each as work progresses.

## Next implementation step

Scaffold the declarative agent, select its initial tools, and prepare the local package while the Microsoft test tenant and publisher account are set up. Validate OAuth and a read-only account/performance flow before testing authorized campaign changes. Prepare the Copilot Studio connector package separately.

## Official references

- [Agents Toolkit CLI](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli)
- [Development prerequisites](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/prerequisites)
- [MCP plugin integration](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-mcp-plugins)
- [MCP connector certification](https://learn.microsoft.com/en-us/microsoft-copilot-studio/mcp-server-certification)
