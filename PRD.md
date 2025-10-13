# BIP Keychain Implementation

A secure hierarchical deterministic (HD) wallet key derivation tool that implements Bitcoin Improvement Proposals for generating and managing cryptographic keys from a single master seed.

**Experience Qualities**:
1. **Secure** - Cryptographic operations handled safely with clear security indicators and warnings
2. **Educational** - Complex BIP concepts presented in an approachable way with explanations
3. **Professional** - Clean, precise interface that instills confidence in handling sensitive key material

**Complexity Level**: Light Application (multiple features with basic state)
- Handles key generation, derivation paths, and multiple BIP standards while maintaining focused functionality around HD wallet operations

## Essential Features

### Mnemonic Seed Generation
- **Functionality**: Generate BIP39 compliant mnemonic phrases (12/24 words)
- **Purpose**: Create secure entropy source for all key derivation
- **Trigger**: User clicks "Generate New Seed" or inputs existing mnemonic
- **Progression**: Select word count → Generate/Input mnemonic → Validate → Display with security warnings → Store temporarily
- **Success criteria**: Valid BIP39 mnemonic generated/validated, entropy properly calculated

### HD Key Derivation
- **Functionality**: Derive keys using BIP32/44/49/84 hierarchical paths
- **Purpose**: Generate addresses and private keys for different cryptocurrency standards
- **Trigger**: Valid mnemonic entered, derivation path specified
- **Progression**: Input derivation path → Select BIP standard → Generate master key → Derive child keys → Display results
- **Success criteria**: Correct extended public/private keys generated, addresses match standard formats

### Multi-Standard Support
- **Functionality**: Support BIP44 (legacy), BIP49 (SegWit), BIP84 (native SegWit), and BIP-Keychain semantic paths
- **Purpose**: Handle different Bitcoin address formats, standards, and revolutionary semantic derivation using JSON-LD entities
- **Trigger**: User selects BIP standard or semantic path from dropdown
- **Progression**: Select standard → Update derivation path format → Generate appropriate addresses → Display with format explanation
- **Success criteria**: Correct address formats generated for each BIP standard, semantic paths properly derive from m/83696968'/67797668'/semantic_images structure

### Path Explorer
- **Functionality**: Interactive derivation path builder and explorer supporting standard BIP paths and BIP-Keychain semantic paths
- **Purpose**: Help users understand and construct valid derivation paths, including revolutionary semantic paths using JSON-LD entities
- **Trigger**: User interacts with path components, enters custom path, or selects semantic path template
- **Progression**: Select account/change/index values OR semantic JSON-LD entities → Build path string → Validate format → Preview derived keys → Apply derivation
- **Success criteria**: Valid paths constructed, clear explanation of each path component, semantic paths properly implement BIP-Keychain specification with JSON-LD to child index mapping

### Semantic Keychain (BIP-Keychain)
- **Functionality**: Revolutionary semantic derivation using JSON-LD entities that map to BIP32 child indices via HMAC-SHA512
- **Purpose**: Create meaningful, semantic key-value stores where keys are human-readable JSON-LD entities instead of arbitrary numbers
- **Trigger**: User selects semantic path tab, chooses template, or creates custom JSON-LD entities
- **Progression**: Select template OR create custom JSON-LD → Add semantic segments → Configure derivation → Generate semantic keys → View results
- **Success criteria**: JSON-LD entities properly canonicalized and mapped to child indices, semantic paths follow m/83696968'/67797668'/semantic_images/index format

## Edge Case Handling

- **Invalid Mnemonic Input**: Clear error messages with specific validation feedback and suggestions
- **Malformed Derivation Paths**: Path syntax validation with helpful correction hints
- **Large Index Values**: Handle and warn about derivation paths that may take significant computation time
- **Security Warnings**: Prominent warnings about never sharing private keys or seeds online
- **Browser Security**: Clear notices about the risks of generating keys in a browser environment

## Design Direction

The design should feel professional and secure, like a specialized cryptographic tool used by developers and crypto enthusiasts, with a clean, technical aesthetic that builds trust through precision and clarity rather than flashy elements.

## Color Selection

Complementary (opposite colors) - Using a blue/orange palette to create strong contrast and clear visual hierarchy, with blue conveying trust and security, orange for important warnings and calls-to-action.

- **Primary Color**: Deep Blue (#1e3a8a) - Conveys security, trust, and professionalism for the main interface
- **Secondary Colors**: Light Gray (#f8fafc) and Medium Gray (#64748b) - Clean, neutral backgrounds and supporting text
- **Accent Color**: Warm Orange (#ea580c) - Attention-grabbing color for warnings, important actions, and security alerts
- **Foreground/Background Pairings**:
  - Background (Light Gray #f8fafc): Dark text (#1e293b) - Ratio 12.6:1 ✓
  - Card (White #ffffff): Dark text (#1e293b) - Ratio 13.4:1 ✓
  - Primary (Deep Blue #1e3a8a): White text (#ffffff) - Ratio 8.2:1 ✓
  - Secondary (Light Gray #f1f5f9): Dark text (#1e293b) - Ratio 11.8:1 ✓
  - Accent (Warm Orange #ea580c): White text (#ffffff) - Ratio 4.9:1 ✓

## Font Selection

Typography should convey technical precision and readability, using a clean monospace font for cryptographic data (keys, addresses, paths) and a modern sans-serif for interface elements.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing
  - H3 (Feature Labels): Inter Medium/18px/normal spacing
  - Body Text: Inter Regular/16px/relaxed line height
  - Code/Keys: JetBrains Mono/14px/monospace for cryptographic data
  - Captions: Inter Regular/14px/muted color for explanations

## Animations

Subtle and functional animations that guide attention to important state changes and provide feedback during cryptographic operations, maintaining the professional tone while adding moments of polish.

- **Purposeful Meaning**: Smooth transitions during key generation to show progress, subtle highlights when copying sensitive data, gentle fade-ins for warnings
- **Hierarchy of Movement**: Priority on security-related feedback (copying keys, showing warnings), secondary on navigation and form interactions

## Component Selection

- **Components**: 
  - Card components for organizing different BIP sections and key displays
  - Button variants for primary actions (generate), secondary (copy), and destructive (clear)
  - Input components with validation states for mnemonic and path entry
  - Select dropdowns for BIP standard selection
  - Alert components for security warnings and validation errors
  - Tabs for organizing different BIP standards and views
  - Separator components for clear visual organization

- **Customizations**: 
  - Monospace text containers for displaying keys, addresses, and paths
  - Copy-to-clipboard buttons with success feedback
  - Security warning banners with prominent styling
  - Path builder components with interactive segments

- **States**: 
  - Loading states during key derivation with progress indicators
  - Success states with checkmarks for validation
  - Warning states for security notices
  - Error states for invalid inputs with specific guidance
  - Hover states with subtle elevation for interactive elements

- **Icon Selection**: 
  - Key icon for cryptographic operations
  - Copy icon for clipboard actions  
  - Eye/EyeSlash for showing/hiding sensitive data
  - Warning triangle for security alerts
  - Check circle for validation success
  - Shield for security-related features

- **Spacing**: 
  - Generous padding (p-6) for main content areas
  - Consistent gap-4 for form elements
  - Larger gap-6 for section separation
  - Tight spacing (gap-2) for related form controls

- **Mobile**: 
  - Stack cards vertically on mobile with full width
  - Larger touch targets for buttons and inputs
  - Collapsible sections for complex derivation options
  - Horizontal scroll for long cryptographic strings
  - Bottom-sheet style modals for mobile interactions
