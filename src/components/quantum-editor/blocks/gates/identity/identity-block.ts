// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import type { GateDefinition } from "../../gate-definition";
import { GateType } from "./../../gate-type";
import ToolbarIdentityBlock from "./ToolbarIdentityBlock.vue";

export const IdentityBlockDefinition: GateDefinition = {
    editorComponent: "IdentityBlock",
    gate: GateType.I,
    toolbarComponent: ToolbarIdentityBlock,
};

export { default as IdentityBlock } from "./IdentityBlock.vue";
