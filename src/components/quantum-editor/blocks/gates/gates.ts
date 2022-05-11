// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import { ControlBlock } from "./control/control-block";
import { HadamardBlock } from "./hadamard/hadamard-block";
import { PauliXBlock } from "./pauli-x/pauli-x-block";
import { PauliYBlock } from "./pauli-y/pauli-y-block";
import { PauliZBlock } from "./pauli-z/pauli-z-block";
import { IdentityBlock } from "@/components/quantum-editor/blocks/gates/identity/identity-block";
import { TGateBlock } from "@/components/quantum-editor/blocks/gates/t-gate/t-gate-block";

export type QuantumGateComponent =
    | typeof HadamardBlock
    | typeof PauliXBlock
    | typeof PauliYBlock
    | typeof PauliZBlock
    | typeof ControlBlock
    | typeof IdentityBlock;

export type QuantumGateName =
    | "HadamardBlock"
    | "PauliXBlock"
    | "PauliYBlock"
    | "PauliZBlock"
    | "TGateBlock"
    | "ControlBlock"
    | "IdentityBlock";

export { ControlBlock, ControlBlockDefinition } from "./control/control-block";
export {
    HadamardBlock,
    HadamardBlockDefinition,
} from "./hadamard/hadamard-block";
export { PauliXBlock, PauliXBlockDefinition } from "./pauli-x/pauli-x-block";
export { PauliYBlock, PauliYBlockDefinition } from "./pauli-y/pauli-y-block";
export { PauliZBlock, PauliZBlockDefinition } from "./pauli-z/pauli-z-block";
export { TGateBlock, TGateBlockDefinition } from "./t-gate/t-gate-block";
export {
    IdentityBlock,
    IdentityBlockDefinition,
} from "./identity/identity-block";

export const fromName: { [key in QuantumGateName]: QuantumGateComponent } = {
    HadamardBlock: HadamardBlock,
    TGateBlock: TGateBlock,
    PauliXBlock: PauliXBlock,
    PauliYBlock: PauliYBlock,
    PauliZBlock: PauliZBlock,
    ControlBlock: ControlBlock,
    IdentityBlock: IdentityBlock,
};
