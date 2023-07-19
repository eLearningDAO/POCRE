# Generic info

## Scenario

* Query cluster for Head ID and its state (could be done in any moment)
* Create dispute terms using current timestamp and Head ID
* Call cluster to create dispute
* Call cluster for voting by juries
* Call cluster to settle if everybody voted (or wait for timer)
* Wait until Head is closed
* See required metadata on-chain

## Pre-requisites for frontend

* Requred datum from backend:
    * PK of jury and current user
    * Signature for HeadId by current user (with CIP-30 signData)
* Delegates IPs and headId
    * HeadID is taken by request (see "Head ID query") and delegates IPs should be stored in DB (and hardcoded)
* Terms should be the same for all scenario :D
* JSON encoding
    * Time is in milliseconds, I think
    * Head ID is in I do not know what, should look at Hydra codebase or try different basex
    * `debugCheckSignatures` in terms can disable signature checks

## Head ID query

Input:

{
    "tag": "QueryCurrentDelegateState"
}

Output:

{
    "contents": [
        "WasQueried",
        {
            "contents": [
                "8599889394efb83b8e1055d4c759b4bf9e3f5bb9cc2cd17672a25abd",
                {
                    "stangingBidWasCommited": false,
                    "tag": "AwaitingCommits"
                }
            ],
            "tag": "Initialized"
        }
    ],
    "tag": "CurrentDelegateState"
}

# Terms

{
    "claimFor": "54657374",
    "claimer": "eb94e8236e2099357fa499bfbc415968691573f25ec77435b7949f5fdfaa5da0",
    "debugCheckSignatures": false,
    "hydraHeadId": "8599889394efb83b8e1055d4c759b4bf9e3f5bb9cc2cd17672a25abd",
    "jury": [
        "fb1e80f6b5c0ef33d1b68215389d0ac836412a99edfac8bb203eb1d782342ab3",
        "e48471a0e6711b566ae3607582dfa1e79dacfadaa41682673c91cec014907904"
    ],
    "voteInterval": [
        1689081658629,
        1689082657629
    ]
}

# Actions

## Commiting

Input:
{
    "contents": [
        ...TERMS...,
        ""
    ],
    "tag": "SubmitCommit"
}

No Output.

State should be changed into "Open".

## Voting

{
    "contents": {
        "contents": [
            "fb1e80f6b5c0ef33d1b68215389d0ac836412a99edfac8bb203eb1d782342ab3",
            "",
            "Yes"
        ],
        "tag": "Vote"
    },
    "tag": "SubmitTx"
}

No Output.

State remain same.

## Settle on AllVotesCasted (or wait for timeout)

{
    "contents": {
        "contents": "AllVotesCasted",
        "tag": "Settle"
    },
    "tag": "SubmitTx"
}

No Output.

State should change to "Closed".

