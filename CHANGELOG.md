# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Session reuse (multiple messages in single session)
- Polling implementation for long-running tasks
- Webhook support (receive responses via callback)
- Rate limiting and backpressure
- Metrics collection (response times, token usage)
- Multi-agent support
- Advanced retry strategies

## [0.1.0] - 2026-05-10

### Added
- Initial project structure and documentation
- OpenCode node implementation with:
  - Session management (create session per request)
  - Prompt sending with configurable timeout
  - Automatic retry logic (up to 3 attempts)
  - Error handling and validation
- Credential type for OpenCode API configuration
- TypeScript interfaces for type safety
- Unit tests for node properties and validation
- Support for batch processing multiple items
- Support for n8n expressions in prompt field
- Docker Compose example configuration
- Comprehensive documentation:
  - README.md - User guide
  - DEVELOPMENT.md - Developer guide
  - INSTALL.md - Installation & testing guide
  - CONTEXT.md - Project context

### Fixed
- N/A (initial release)

### Removed
- N/A (initial release)

### Security
- Session IDs not logged by default
- No credentials in workflow exports
- API URLs from secure credential storage

---

## Release Notes Format

### For Future Releases

**When adding features:**
```markdown
### Added
- Feature description
- Another feature
```

**When fixing bugs:**
```markdown
### Fixed
- Bug description
- Another fix
```

**When making changes:**
```markdown
### Changed
- Changed behavior
```

**When deprecating:**
```markdown
### Deprecated
- Deprecated feature (removed in x.x.x)
```

---

**Version History:**
- v0.1.0 - Initial release (May 10, 2026)

**Next Version:** v0.2.0 (Planned: Session reuse & polling)
