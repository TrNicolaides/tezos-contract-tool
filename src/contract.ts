import * as fs from 'fs';
import * as kleur from 'kleur';
import * as path from 'path';
import * as child from 'child_process';
import { InMemorySigner } from '@taquito/signer';
import { loadFile } from './helper';
import { createToolkit } from './bootstrap';
import BigNumber from 'bignumber.js';
import { exit } from 'process';
import { MichelsonMap, TezosToolkit } from '@taquito/taquito';

export async function compileContract(): Promise<void> {
    await new Promise<void>((resolve, reject) =>
        // Compile the contract
        child.exec(
            path.join(__dirname, "../ligo/exec_ligo compile-contract " + path.join(__dirname,  "../ligo/src/minter_collection/nft/fa2_multi_nft_asset_multi_admin.mligo") + " nft_asset_main "),
            (err, stdout, errout) => {
                if (err) {
                    console.log(kleur.red('Failed to compile the contract.'));
                    console.log(kleur.yellow().dim(err.toString()))
                    console.log(kleur.red().dim(errout));
                    reject();
                } else {
                    console.log(kleur.green('Contract compiled succesfully at:'))
                    // Write json contract into json file
                    console.log('  ' + path.join(__dirname, '../ligo/src/minter_collection/nft/fa2_multi_nft_asset_multi_admin.tz'))
                    fs.writeFileSync(path.join(__dirname, '../ligo/src/minter_collection/nft/fa2_multi_nft_asset_multi_admin.tz'), stdout)
                    resolve();
                }
            }    
        )
    );
}

export async function deployContract(): Promise<void> {
    const code = await loadFile(path.join(__dirname, '../ligo/src/minter_collection/nft/fa2_multi_nft_asset_multi_admin.tz'))
    
    const metadataMap = new MichelsonMap<string, string>();
    
    const  originateParam = {
        code: code,
        storage: {
          assets: {
            ledger: new MichelsonMap(),
            next_token_id: 0,
            operators: new MichelsonMap(),
            token_metadata: new MichelsonMap()
          },
          admin: {
            admins: ['ADMIN_CONTRACT_KEY'],
            pending_admins: new MichelsonMap(),
            paused: false
          },
          metadata: metadataMap
        }
      }
      
    try {
        const toolkit = new TezosToolkit('https://edonet.smartpy.io');
        toolkit.setProvider({ signer: await InMemorySigner.fromSecretKey('HERE_YOUR_PRIVATE_KEY') });

        const originationOp = await toolkit.wallet.originate(originateParam).send();
        
        console.log(originationOp)

        await originationOp.confirmation();
        const { address } = await originationOp.contract() 
        
        console.log('Contract deployedd at: ', address)

    } catch (error) {
        const jsonError = JSON.stringify(error, null, 2);
        console.log(kleur.red(`Fa2 multi nft token origination error ${jsonError}`));
    }
}
