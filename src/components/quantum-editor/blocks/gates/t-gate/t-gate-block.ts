// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import TGateBlock from "./TGateBlock.vue";
import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";

export const TGateBlockDefinition: GateDefinition = {
    editorComponent: "TGateBlock",
    gate: GateType.T,
    toolbarComponent: TGateBlock,
};

export { default as TGateBlock } from "./TGateBlock.vue";
