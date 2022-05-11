// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import HadamardBlock from "./HadamardBlock.vue";
import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";

export const HadamardBlockDefinition: GateDefinition = {
    editorComponent: "HadamardBlock",
    gate: GateType.H,
    toolbarComponent: HadamardBlock,
};

export { default as HadamardBlock } from "./HadamardBlock.vue";
