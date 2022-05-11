// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import type { GateType } from "./gate-type";
import type { GateComponent, GateName } from "./blocks";

export interface GateDefinition {
    gate: GateType;
    editorComponent?: GateName;
    toolbarComponent?: GateComponent;
}
