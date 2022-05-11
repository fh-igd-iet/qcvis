// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import { PhaseDisk } from "./phase-disk/phase-disk";
import { MeasurementGate } from "./measurement-gate/measurement-gate";

export type VisualisationGateComponent = typeof PhaseDisk;

export type VisualisationGateName = "PhaseDisk" | "MeasurementGate";

export { PhaseDisk, PhaseDiskDefinition } from "./phase-disk/phase-disk";
export {
    MeasurementGate,
    MeasurementDefinition,
} from "./measurement-gate/measurement-gate";

export const fromName: {
    [key in VisualisationGateName]: VisualisationGateComponent;
} = {
    PhaseDisk: PhaseDisk,
    MeasurementGate: MeasurementGate,
};
