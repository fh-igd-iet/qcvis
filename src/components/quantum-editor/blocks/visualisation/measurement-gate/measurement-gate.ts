// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import MeasurementGate from "./MeasurementGate.vue";
import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";

export const MeasurementDefinition: GateDefinition = {
    editorComponent: "MeasurementGate",
    gate: GateType.M,
    toolbarComponent: MeasurementGate,
};

export { default as MeasurementGate } from "./MeasurementGate.vue";
