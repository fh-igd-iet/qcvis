// Copyright© 2022 Gesellschaft zur Förderung der angewandten Forschung e.V. acting on behalf of its Fraunhofer Institut für Graphische Datenverarbeitung.
// Licensed under the EUPL. See LICENSE.txt.

import { Color } from "three";
import { lch, rgb } from "@thi.ng/color";

export function getColorForPhase(phase: number, isAnimating?: boolean) {
    const hue = (phase + Math.PI) / (2 * Math.PI);

    return rgb(lch(isAnimating ? 0.5 : 0.75, isAnimating ? 0.25 : 0.5, hue));
}

/**
 * Returns a Three.js color for the given phase.
 * @param phase Phase in the interval [-Math.PI, Math.PI].
 * @param isAnimating Whether the color is used during animation.
 */
export function getThreeColorForPhase(
    phase: number,
    isAnimating = false
): Color {
    const thingColor = getColorForPhase(phase, isAnimating);

    return new Color(thingColor.r, thingColor.g, thingColor.b);
}
