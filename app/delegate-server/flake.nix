{
  description = "POCRE delegate server";
  nixConfig = {
    extra-substituters = [ "https://cache.iog.io" ];
    extra-trusted-public-keys = [ "hydra.iohk.io:f/Ea+s+dFdN+3Y/G+FDgSq+a5NEWhJGzdjvKNGv0/EQ=" ];

    allow-import-from-derivation = true;
    impure = true;
  };

  inputs = {
    # when you upgrade `hydra` input remember to also upgrade revs under
    # `source-repository-package`s in `cabal.project`
    hydra.url = "github:input-output-hk/hydra/8bc7a98220d6a33befa7a2ea52858923a4272143";
    haskellNix.url = "github:input-output-hk/haskell.nix";
    # The "empty-flake" is needed until the following is fixed
    # https://github.com/input-output-hk/cardano-node/issues/4525
    cardano-node.follows = "hydra/cardano-node";
    empty.url = "github:mlabs-haskell/empty-flake";
    iohk-nix.follows = "hydra/iohk-nix";
    CHaP.follows = "hydra/CHaP";
    nixpkgs.follows = "hydra/nixpkgs";
    flake-utils.follows = "hydra/flake-utils";
    pre-commit-hooks.url = "github:cachix/pre-commit-hooks.nix";
  };

  outputs =
    { hydra
    , haskellNix
    , pre-commit-hooks
    , iohk-nix
    , CHaP
    , nixpkgs
    , flake-utils
    , cardano-node
    , ...
    }:
    let
      # nix flake (show|check) --allow-import-from-derivation --impure
      systems =
        if builtins.hasAttr "currentSystem" builtins
        then [ builtins.currentSystem ]
        else nixpkgs.lib.systems.flakeExposed;
      overlays = [
        haskellNix.overlay
        iohk-nix.overlays.crypto
        (final: prev: {
          hydraProject =
            final.haskell-nix.cabalProject {
              src = final.haskell-nix.haskellLib.cleanGit {
                src = ./.;
                name = "pocre-delegate-server";
              };
              inputMap."https://input-output-hk.github.io/cardano-haskell-packages" = CHaP;

              compiler-nix-name = "ghc8107";

              shell.tools = {
                cabal = "3.10.1.0";
                fourmolu = "0.9.0.0";
                # haskell-language-server = "latest";
              };
              shell.buildInputs = with final; [
                nixpkgs-fmt
                haskellPackages.apply-refact
                haskellPackages.cabal-fmt
                haskellPackages.hlint
                cardano-node.packages.${prev.system}.cardano-node
                cardano-node.packages.${prev.system}.cardano-cli
                hydra.packages.${prev.system}.hydra-node
              ];
              modules = [
                # Set libsodium-vrf on cardano-crypto-{praos,class}. Otherwise
                # they depend on libsodium, which lacks the vrf functionality.
                ({ pkgs, lib, ... }:
                  # Override libsodium with local 'pkgs' to make sure it's using
                  # overriden 'pkgs', e.g. musl64 packages
                  {
                    packages.cardano-crypto-class.components.library.pkgconfig =
                      lib.mkForce [ [ pkgs.libsodium-vrf pkgs.secp256k1 ] ];
                    packages.cardano-crypto-praos.components.library.pkgconfig =
                      lib.mkForce [ [ pkgs.libsodium-vrf ] ];

                    # disable the dev flag in the nix code, s.t. warnings are becoming errors
                    # the dev flag implies PlutusTx defer plugin error and disabling -Werror
                    packages.hydra-auction.allComponent.configureFlags = [ "-f-dev" ];
                  }
                )
              ];
            };
        })
      ];
      removeIncompatibleAttrs = pkgNames: attrName: systems: flake:
        let
          f = attrset: system:
            nixpkgs.lib.updateManyAttrsByPath [{
              path = [ "${attrName}" "${system}" ];
              update = set: (builtins.removeAttrs set pkgNames);
            }]
              attrset;
        in
        builtins.foldl' f flake systems;
    in
    removeIncompatibleAttrs [ "cliImage" "delegateImage" ] "packages" (builtins.filter (sys: sys != "x86_64-linux") systems)
      (flake-utils.lib.eachSystem systems
        (system:
        let
          pkgs = import nixpkgs {
            inherit system overlays;
            inherit (haskellNix) config;
          };
          haskellNixFlake = pkgs.hydraProject.flake { };

          preCommitHook = pre-commit-hooks.lib.${system}.run
            {
              src = ./.;
              hooks = {
                nixpkgs-fmt.enable = true;
                statix.enable = true;
                deadnix.enable = true;
                fourmolu.enable = true;
                hlint.enable = true;
                cabal-fmt.enable = true;
              };
              tools.fourmolu = pkgs.lib.mkForce pkgs.haskell.packages.ghc92.fourmolu;
              settings = {
                ormolu.defaultExtensions = [
                  "BangPatterns"
                  "TypeApplications"
                  "QualifiedDo"
                  "NondecreasingIndentation"
                  "PatternSynonyms"
                  "ImportQualifiedPost"
                  "TemplateHaskell"
                ];
              };
            };
        in
        rec {
          inherit haskellNixFlake;
          packages = {
            # default = haskellNixFlake.packages."pocre-delegate-server:exe:pocre-delegate";
            delegateImage = pkgs.dockerTools.buildLayeredImage
              {
                name = "pocre-delegate";
                tag = "latest";
                contents = [ haskellNixFlake.packages."pocre-delegate-server:exe:pocre-delegate" ];
                config = {
                  Cmd = [ "pocre-delegate" ];
                };
              };
          };

          devShells = builtins.mapAttrs
            (_: shell: shell.overrideAttrs (old: {
              shellHook = old.shellHook + preCommitHook.shellHook;
              buildInputs = old.buildInputs ++ [
                pkgs.docker-compose
                pkgs.jq
              ];
            }))
            haskellNixFlake.devShells;

        }) // {
        inherit removeIncompatibleAttrs;
        herculesCI.ciSystems = [ "x86_64-linux" ];
      });
}
