// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import type { CWQuantumCircuit } from "@/runtime/cw-quantum-circuit";
import { ref } from "vue";
import type { Complex } from "qukit/pkg.web/pkg/qukit";
import init from "qukit/pkg.web/pkg/qukit";
import type { Algorithm, AlgorithmResult } from "qukit/pkg.web";
import type { QuantumState } from "quantum-circuit";
import { abs, arg, complex, pow, round } from "mathjs";
import { GateType } from "@/components/quantum-editor/blocks/gate-type";

export class QuantumRuntime {
    private readonly _quantumCircuit: CWQuantumCircuit;
    private readonly _algorithm: Algorithm;
    private readonly _steps: number;
    private _algorithmResult?: AlgorithmResult = undefined;
    private _pos = -1;
    private static _initialized = false;

    constructor(
        quantumCircuit: CWQuantumCircuit,
        algorithm: Algorithm,
        steps: number
    ) {
        this._quantumCircuit = quantumCircuit;
        this._algorithm = algorithm;
        this._steps = steps;
    }

    static async create(circuit: CWQuantumCircuit, steps = 1, offset = 0) {
        if (import.meta.env.PROD) {
            if (!this._initialized) {
                await init();
                this._initialized = true;
            }
        } else {
            await init(
                new URL(
                    "/node_modules/qukit/pkg.web/pkg/qukit_bg.wasm",
                    import.meta.url
                )
            );
        }

        const algorithm = circuit.toAlgorithm();

        let runtime: QuantumRuntime;
        if (steps === 1) {
            runtime = new QuantumRuntime(circuit, algorithm, steps);
        } else {
            runtime = new QuantumRuntime(
                circuit,
                algorithm.intoStepper(steps),
                steps
            );
        }

        for (let i = 0; i < Math.floor(offset * steps); i++) {
            runtime.step();
        }

        return runtime;
    }

    /**
     * Runs one col of the algorithm. Returns false if finished.
     */
    step(): boolean {
        const col = this._quantumCircuit.getColumn(Math.floor(this._pos + 1));
        if (
            col === undefined ||
            col.find(
                (gate) =>
                    gate.gateDefinition.gate !== GateType.I &&
                    gate.gateDefinition.gate !== GateType.C
            )
        ) {
            const next = this._algorithm.step();
            if (next === undefined) {
                this._pos += 1 / this._steps;
                return false;
            }
            this._algorithmResult = next;
        }
        this._pos += 1 / this._steps;

        return true;
    }

    get pos(): number {
        return this._pos;
    }

    done(): boolean {
        return this._pos > this._quantumCircuit.getLastFilledCol();
    }

    stateAsArray(onlyPossible = false): QuantumState[] {
        const ket: Complex[] = this.state();
        const probs = this.probs();
        const state: QuantumState[] = [];

        for (let i = 0; i < ket.length; i++) {
            const amplitude = round(complex(ket[i].re, ket[i].im), 14);
            if (!onlyPossible || amplitude.re || amplitude.im) {
                let indexBinStr = i.toString(2);
                while (indexBinStr.length < probs.length) {
                    indexBinStr = "0" + indexBinStr;
                }

                const amplitudeStr = `${amplitude.re} + ${amplitude.im}i`;
                const magnitude = pow(abs(amplitude), 2);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
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
        }

        return onlyPossible ? state.filter((state) => state.chance > 0) : state;
    }

    state(): Complex[] {
        if (this._algorithmResult === undefined) {
            const state = new Array(
                pow(2, this._quantumCircuit.getLastFilledWire() + 1)
            )
                .fill(0)
                .map(() => ({ re: 0, im: 0 }));
            state[0].re = 1;

            return state;
        } else {
            return this._algorithmResult.quantumRegister().states();
        }
    }

    probs(): Float64Array {
        if (this._algorithmResult === undefined) {
            return new Float64Array(0);
        } else {
            return this._algorithmResult.quantumRegister().probabilities();
        }
    }

    prob(wire: number): number {
        if (this._algorithmResult === undefined) {
            return 0;
        } else {
            return this._algorithmResult.quantumRegister().probability(wire);
        }
    }

    cregs(): boolean[] {
        if (this._algorithmResult === undefined) {
            return new Array(this._quantumCircuit.getLastFilledWire() + 1).fill(
                false
            );
        } else {
            return this._algorithmResult.classicalRegister().state();
        }
    }
}

export const GlobalQuantumRuntime = ref<QuantumRuntime | undefined>(undefined);
