// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import PhaseDisk from "./PhaseDisk.vue";
import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";

export const PhaseDiskDefinition: GateDefinition = {
    editorComponent: "PhaseDisk",
    gate: GateType.I,
    toolbarComponent: PhaseDisk,
};

export { default as PhaseDisk } from "./PhaseDisk.vue";
