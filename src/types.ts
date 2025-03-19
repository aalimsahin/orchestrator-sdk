import { Address, Hex } from 'viem'
import type { UserOperation } from 'viem/account-abstraction'

export type SupportedTestnet = 11155111 | 84532 | 421614 | 11155420 | 80002
export type SupportedMainnet = 1 | 8453 | 42161 | 10 | 137
export type SupportedChain = SupportedMainnet | SupportedTestnet

// TODO: these types need to be updated to the latest contract structs
export type MultiChainCompact = {
  sponsor: Address
  nonce: bigint
  expires: bigint
  segments: Segment[]
}

export type Segment = {
  arbiter: Address
  chainId: bigint
  idsAndAmounts: [bigint, bigint][]
  witness: Witness
}

export type Witness = {
  recipient: Address
  tokenOut: [bigint, bigint][]
  depositId: bigint
  targetChain: bigint
  fillDeadline: number
  execs: Execution[]
  userOpHash: Hex
  maxFeeBps: number
}

export type Execution = {
  to: Address
  value: bigint
  data: Hex
}

export type BatchCompact = {
  arbiter: Address
  sponsor: Address
  nonce: bigint
  expires: bigint
  idsAndAmounts: [bigint, bigint][]
  witness: Witness
}

export type QualificationWitness = {
  claimHash: Hex
  targetChainSignatureHash: Hex
  targetWETHAddress: Address
}

export type ChainNotarization = {
  originAccount: Address
  originModule: Address
  notarizedChainId: bigint
  nonce: bigint
  expires: bigint
  notarizedWitness: Hex
  idsAndAmountsTokenInHash: Hex
}

export type TargetChainAttributes = {
  recipient: Address
  tokenOut: [bigint, bigint][]
  targetWETHAddress: Address
  depositId: bigint
  fillDeadline: number
}

export type MultiOriginMessage = {
  notarization: ChainNotarization
  targetChain: TargetChainAttributes
  otherSegments: Hex[]
  executions: Execution[]
  userSig: Hex
}

export type SingleOriginMessage = {
  notarization: ChainNotarization
  targetChain: TargetChainAttributes
  executions: Execution[]
  userSig: Hex
}

export type UserOperationMessage = {
  targetChain: TargetChainAttributes
  userOp: PackedUserOperation
  nonce: bigint
}

export type TokenArrays6909 = readonly (readonly [bigint, bigint])[]

export type IntentFillPayload = {
  segments: SegmentData[]
  message: Hex
  orchestratorSig: Hex
}

export type SegmentData = {
  tokenIn: [bigint, bigint][]
  tokenOut: [bigint, bigint][]
  originWETHAddress: Address
  originChainId: bigint
  baseDepositId: bigint
}

export type SignedMultiChainCompact = MultiChainCompact & {
  originSignatures: Hex[]
  targetSignature: Hex
}

export type TokenTransfer = {
  tokenAddress: Address
  amount: bigint
}

type WithUserOp = {
  userOp: UserOperation
  targetExecutions?: never
}

type WithExecutions = {
  userOp?: never
  targetExecutions: Execution[]
}

type WithoutOperation = {
  userOp?: never
  targetExecutions?: never
}

type MetaIntentBase = {
  targetChainId: number
  tokenTransfers: TokenTransfer[]
  targetAccount: Address
  accountAccessList?: {
    chainId: number
    tokenAddress: Address
  }[]
  omniLock?: boolean
}

export type MetaIntentEmpty = MetaIntentBase & WithoutOperation
export type MetaIntentWithUserOp = MetaIntentBase & WithUserOp
export type MetaIntentWithExecutions = MetaIntentBase & WithExecutions

export type MetaIntent =
  | MetaIntentEmpty
  | MetaIntentWithUserOp
  | MetaIntentWithExecutions

export type ChainExecution = Execution & { chainId: number }

export type BundleEvent = {
  bundleId: bigint
  type: string
  targetFillPayload: ChainExecution
  acrossDepositEvents: DepositEvent[]
}

export type DepositEvent = {
  originClaimPayload: ChainExecution
  inputToken: Address // address
  outputToken: Address // address
  inputAmount: bigint // uint256
  outputAmount: bigint // uint256
  destinationChainId: number
  originChainId: number
  depositId: bigint // uint256 (indexed)
  quoteTimestamp: number // uint32
  fillDeadline: number // uint32
  exclusivityDeadline: number // uint32
  depositor: Address // address (indexed)
  recipient: Address // address
  exclusiveRelayer: Address // address
  message: Hex // bytes
}

export type SignedTokenUnlock = {
  chainId: number
  tokenAddress: Address
  amount: bigint
  timestamp: number
  nonce: bigint
  signature: Hex
  verifyingContract: Address
}

export type Token = {
  symbol: string
  address: Address
  chainId: number
}

export type UserTokenBalance = {
  tokenName: string
  tokenDecimals: number
  balance: bigint
  tokenChainBalance: {
    chainId: number
    tokenAddress: Address
    balance: bigint
  }[]
}

export enum BundleStatus {
  PENDING = 'PENDING', // bundle is created and all claims are pending
  EXPIRED = 'EXPIRED', // bundle is created and call claims are expired
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED', // = not completed :D (at least one claim made or fill happened)
  COMPLETED = 'COMPLETED', // fill tx received, all deposits claimed
  FAILED = 'FAILED', // either fill expired with at least one claim, or claims expired and fill happened
  UNKNOWN = 'UNKNOWN', // marker status in case we change the logic and it is not handled on get status endpoint
}

export enum ClaimStatus { // See prisma schema
  PENDING = 'PENDING', // not expired and not yet claimed
  EXPIRED = 'EXPIRED', // claim is not possible as it is expired
  CLAIMED = 'CLAIMED', // order is claimed
}

export type SimulationResult =
  | { success: true }
  | {
      success: false
      call: Execution
      details: {
        message: string
        contractAddress: Address
        args: any[]
        functionName: string
      }
    }

export type PostOrderBundleResult = (
  | {
      bundleId: bigint
      status: BundleStatus.PENDING
    }
  | {
      bundleId: bigint
      status: BundleStatus.FAILED
      error: SimulationResult
    }
)[]

export type BundleResult = {
  status: BundleStatus
  fillTimestamp?: number
  fillTransactionHash?: Hex
  claims: Claim[]
}

export type Claim = {
  depositId: bigint
  chainId: number
  status: ClaimStatus
  claimTimestamp?: number
  claimTransactionHash?: Hex
}

export type PackedUserOperation = {
  sender: Address
  nonce: bigint
  initCode: Hex
  callData: Hex
  accountGasLimits: Hex
  preVerificationGas: bigint
  gasFees: Hex
  paymasterAndData: Hex
  signature: Hex
}

export type OrchestratorChainConfig = {
  spokepool: Address
  hook: Address
  originModule: Address
  targetModule: Address
  sameChainModule: Address
  weth: Address
  supportedTokens: TokenConfig[]
}

export type TokenConfig = {
  symbol: string
  address: Address
  decimals: number
}
