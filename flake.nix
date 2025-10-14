{
  description = "BIP Keychain - HD Wallet Key Derivation Tool";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        nodejs = pkgs.nodejs_20;

        buildInputs = with pkgs; [
          nodejs
          nodePackages.npm
        ];

        nativeBuildInputs = with pkgs; [
          git
        ];

      in
      {
        # Development shell with all dependencies
        devShells.default = pkgs.mkShell {
          inherit buildInputs nativeBuildInputs;

          shellHook = ''
            echo "BIP Keychain Development Environment"
            echo "====================================="
            echo "Node.js: $(node --version)"
            echo "npm: $(npm --version)"
            echo ""
            echo "Available commands:"
            echo "  npm start  - Start development server"
            echo "  npm build  - Build production bundle"
            echo "  npm test   - Run tests"
            echo ""

            # Install dependencies if node_modules doesn't exist
            if [ ! -d "node_modules" ]; then
              echo "Installing dependencies..."
              npm install
            fi
          '';

          # Environment variables
          NPM_CONFIG_PREFIX = toString ./npm-global;
        };

        # Package build
        packages.default = pkgs.buildNpmPackage {
          pname = "bip-keychain";
          version = "0.1.0";

          src = ./.;

          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

          buildInputs = [ nodejs ];

          buildPhase = ''
            npm run build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r build/* $out/
          '';

          meta = with pkgs.lib; {
            description = "HD wallet key derivation tool implementing Bitcoin Improvement Proposals";
            homepage = "https://github.com/openintegrityproject-core/bip-keychain-ref";
            license = licenses.mit;
            maintainers = [];
            platforms = platforms.all;
          };
        };

        # Apps for easy execution
        apps = {
          dev = {
            type = "app";
            program = toString (pkgs.writeShellScript "dev" ''
              ${nodejs}/bin/npm start
            '');
          };

          build = {
            type = "app";
            program = toString (pkgs.writeShellScript "build" ''
              ${nodejs}/bin/npm run build
            '');
          };

          test = {
            type = "app";
            program = toString (pkgs.writeShellScript "test" ''
              ${nodejs}/bin/npm test
            '');
          };
        };
      }
    );
}
