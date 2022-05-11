// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import type { QuantumGateComponent, QuantumGateName } from "./gates/gates";
import {
    ControlBlockDefinition,
    fromName as fromQuantumName,
    HadamardBlockDefinition,
    IdentityBlockDefinition,
    PauliXBlockDefinition,
    PauliYBlockDefinition,
    PauliZBlockDefinition,
    TGateBlockDefinition,
} from "./gates/gates";
import type { VisualisationGateName } from "./visualisation/visualisations";
import {
    fromName as fromVisualisationName,
    PhaseDiskDefinition,
    MeasurementDefinition,
} from "./visualisation/visualisations";
import type { GateDefinition } from "./gate-definition";

export type GateComponent = QuantumGateComponent | QuantumGateName;

export type GateName = QuantumGateName | VisualisationGateName;

export const fromName: { [key in GateName]: GateComponent } = {
    ...fromQuantumName,
    ...fromVisualisationName,
};

export {
    ControlBlock,
    HadamardBlock,
    PauliXBlock,
    PauliYBlock,
    PauliZBlock,
    ControlBlockDefinition,
    HadamardBlockDefinition,
    PauliXBlockDefinition,
    PauliZBlockDefinition,
    PauliYBlockDefinition,
    IdentityBlock,
} from "./gates/gates";
export {
    PhaseDisk,
    MeasurementGate,
    PhaseDiskDefinition,
    MeasurementDefinition,
} from "./visualisation/visualisations";

export const Definitions: GateDefinition[] = [
    IdentityBlockDefinition,
    PauliXBlockDefinition,
    PauliYBlockDefinition,
    PauliZBlockDefinition,
    HadamardBlockDefinition,
    TGateBlockDefinition,
    ControlBlockDefinition,
    PhaseDiskDefinition,
    MeasurementDefinition,
];
