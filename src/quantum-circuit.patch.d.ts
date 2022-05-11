// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import { default as QuantumCircuitLib, QuantumState } from "quantum-circuit";
import type { MathNumericType } from "mathjs";

declare class QuantumCircuit extends QuantumCircuitLib {
    stateAsArray(
        onlyPossible?: boolean,
        skipItems?: number,
        blockSize?: number
    ): QuantumState[];
    densityMatrix(): MathNumericType[][];
}

export default QuantumCircuit;
