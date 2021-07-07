# d-art.contracts

## Introduction:

    Tool to help compile and deploy tezos contracts.

## Install the CLI (TypeScript):

    To install all the dependencies of the project please run:
        
        $ cd /d-art.contracts 
        $ npm install
        $ npm run-script build
        $ npm install -g
            
    The different available commands are:

        $ tezos.contracts compile-contract
            (Compile the contract contained in the project)

        $ tezos.contracts deploy-contract
            (Deploy the contract previously compiled in the project)

        $ tezos.contracts -v
            (Get the current version of the project)