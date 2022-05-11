// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import { round, complex, pow, abs, arg, conj, multiply } from "mathjs";

// NEED DIST VERSION CAUSE BUNDLE DESTROYS ANTLR???
import { default as QuantumCircuitLib } from "quantum-circuit/dist/quantum-circuit.min";

export default class QuantumCircuit extends QuantumCircuitLib {
    stateAsArray(onlyPossible, skipItems, blockSize) {
        const state = [];

        const numAmplitudes = this.numAmplitudes();

        skipItems = skipItems || 0;
        blockSize =
            blockSize ||
            (onlyPossible ? this.numAmplitudes(onlyPossible) : numAmplitudes);

        let count = 0;
        for (let i = 0; i < numAmplitudes; i++) {
            const amplitude = round(this.state[i] || complex(0, 0), 14);
            if (!onlyPossible || amplitude.re || amplitude.im) {
                if (count >= skipItems) {
                    let indexBinStr = i.toString(2);
                    while (indexBinStr.length < this.numQubits) {
                        indexBinStr = "0" + indexBinStr;
                    }

                    const amplitudeStr = this.formatComplex(amplitude, {
                        fixedWidth: true,
                        decimalPlaces: 8,
                        iotaChar: "i",
                    });
                    const magnitude = pow(abs(amplitude), 2);
                    const chance = magnitude * 100;
                    const chanceStr = chance.toFixed(5);
                    const phase = arg(amplitude);
                    const phaseStr = phase.toFixed(5);

                    state.push({
                        index: i,
                        indexBinStr: indexBinStr,
                        amplitude: amplitude,
                        amplitudeStr: amplitudeStr,
                        magnitude: magnitude,
                        chance: chance,
                        chanceStr: chanceStr,
                        phase: phase,
                        phaseStr: phaseStr,
                    });
                }

                count++;

                if (state.length === blockSize) {
                    return state;
                }
            }
        }

        return state;
    }

    densityMatrix() {
        const density = [];
        const numAmplitudes = this.numAmplitudes();
        for (let row = 0; row < numAmplitudes; row++) {
            const r = [];
            const rowVal = this.state[row] || complex(0, 0);
            for (let col = 0; col < numAmplitudes; col++) {
                let colVal = this.state[col] || complex(0, 0);
                if (colVal.re || colVal.im) {
                    colVal = conj(colVal);
                }
                r.push(multiply(rowVal, colVal));
            }
            density.push(r);
        }
        return density;
    }
}
