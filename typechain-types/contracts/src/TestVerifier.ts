/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export declare namespace IVerifier {
  export type ModelStruct = {
    contentId: PromiseOrValue<BytesLike>;
    name: PromiseOrValue<string>;
    description: PromiseOrValue<string>;
    ownerAddress: PromiseOrValue<string>;
    isDisabled: PromiseOrValue<boolean>;
  };

  export type ModelStructOutput = [string, string, string, string, boolean] & {
    contentId: string;
    name: string;
    description: string;
    ownerAddress: string;
    isDisabled: boolean;
  };
}

export interface TestVerifierInterface extends utils.Interface {
  functions: {
    "_registerModel(bytes32,string,string)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "_registerModel"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "_registerModel",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "_registerModel",
    data: BytesLike
  ): Result;

  events: {};
}

export interface TestVerifier extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: TestVerifierInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    _registerModel(
      _modelContentId: PromiseOrValue<BytesLike>,
      _modelName: PromiseOrValue<string>,
      _modelDescription: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  _registerModel(
    _modelContentId: PromiseOrValue<BytesLike>,
    _modelName: PromiseOrValue<string>,
    _modelDescription: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    _registerModel(
      _modelContentId: PromiseOrValue<BytesLike>,
      _modelName: PromiseOrValue<string>,
      _modelDescription: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<IVerifier.ModelStructOutput>;
  };

  filters: {};

  estimateGas: {
    _registerModel(
      _modelContentId: PromiseOrValue<BytesLike>,
      _modelName: PromiseOrValue<string>,
      _modelDescription: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _registerModel(
      _modelContentId: PromiseOrValue<BytesLike>,
      _modelName: PromiseOrValue<string>,
      _modelDescription: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
